# WCLASSGAMES Agent Server - AWS Lambda

AWS Lambda + API Gateway로 배포하는 Agent Callback 서버입니다.

---

## 빠른 시작

### 1. 빌드

```bash
cd examples/lambda
npm install
npm run build
```

### 2. 패키징

```bash
npm run package
# lambda.zip 파일 생성됨
```

### 3. AWS Lambda 설정

1. **Lambda 함수 생성**
   - Runtime: Node.js 18.x 또는 20.x
   - Handler: `handler.handler`
   - 메모리: 128MB (충분)
   - 타임아웃: 10초

2. **환경 변수** (선택사항)
   ```
   WCLASSGAMES_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
   ```

3. **코드 업로드**
   - `lambda.zip` 파일 업로드

### 4. API Gateway 설정

**HTTP API (권장)**

1. API Gateway > HTTP API 생성
2. Lambda 통합 추가
3. 라우트 설정:
   ```
   GET  /cg/authenticate  → Lambda
   POST /cg/balance       → Lambda
   POST /cg/transaction   → Lambda
   ```

**REST API**

1. API Gateway > REST API 생성
2. 리소스 생성: `/cg/authenticate`, `/cg/balance`, `/cg/transaction`
3. 각 리소스에 메서드 추가 및 Lambda 통합
4. API 배포

---

## AWS CLI로 배포

### Lambda 함수 생성

```bash
aws lambda create-function \
  --function-name wclassgames-agent \
  --runtime nodejs20.x \
  --handler handler.handler \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role \
  --zip-file fileb://lambda.zip \
  --timeout 10 \
  --memory-size 128
```

### 코드 업데이트

```bash
npm run deploy
# 또는
aws lambda update-function-code \
  --function-name wclassgames-agent \
  --zip-file fileb://lambda.zip
```

---

## Serverless Framework 사용

### serverless.yml

```yaml
service: wclassgames-agent

provider:
  name: aws
  runtime: nodejs20.x
  region: ap-northeast-2
  memorySize: 128
  timeout: 10

functions:
  api:
    handler: dist/handler.handler
    events:
      - httpApi:
          path: /cg/authenticate
          method: get
      - httpApi:
          path: /cg/balance
          method: post
      - httpApi:
          path: /cg/transaction
          method: post

plugins:
  - serverless-plugin-typescript
```

### 배포

```bash
npm install -g serverless
serverless deploy
```

---

## SAM (AWS Serverless Application Model)

### template.yaml

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: WCLASSGAMES Agent Callback Server

Globals:
  Function:
    Timeout: 10
    MemorySize: 128

Resources:
  AgentFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/
      Handler: handler.handler
      Runtime: nodejs20.x
      Events:
        Authenticate:
          Type: HttpApi
          Properties:
            Path: /cg/authenticate
            Method: get
        Balance:
          Type: HttpApi
          Properties:
            Path: /cg/balance
            Method: post
        Transaction:
          Type: HttpApi
          Properties:
            Path: /cg/transaction
            Method: post

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com"
```

### 배포

```bash
sam build
sam deploy --guided
```

---

## 프로덕션 고려사항

### 1. DynamoDB 사용 (잔액 저장)

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function getUser(userId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: 'Users',
    Key: { id: userId },
  }));
  return result.Item;
}

async function updateBalance(userId: string, change: number) {
  await docClient.send(new UpdateCommand({
    TableName: 'Users',
    Key: { id: userId },
    UpdateExpression: 'SET balance = balance + :change',
    ExpressionAttributeValues: { ':change': change },
  }));
}
```

### 2. 멱등성 보장 (DynamoDB)

```typescript
// 트랜잭션 중복 체크
async function isProcessed(nonce: string): Promise<boolean> {
  const result = await docClient.send(new GetCommand({
    TableName: 'Transactions',
    Key: { nonce },
  }));
  return !!result.Item;
}

// 트랜잭션 저장
async function saveTransaction(nonce: string, result: TransactionResult) {
  await docClient.send(new PutCommand({
    TableName: 'Transactions',
    Item: { nonce, ...result, ttl: Math.floor(Date.now() / 1000) + 86400 * 7 },
    ConditionExpression: 'attribute_not_exists(nonce)',
  }));
}
```

### 3. 환경 변수

```
USERS_TABLE=wclassgames-users
TRANSACTIONS_TABLE=wclassgames-transactions
WCLASSGAMES_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
```

### 4. IAM 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/wclassgames-*"
      ]
    }
  ]
}
```

---

## 테스트

### 로컬 테스트 (SAM)

```bash
sam local start-api
curl http://localhost:3000/cg/authenticate -H "Authorization: Bearer user-token-123"
```

### Lambda 직접 호출

```bash
aws lambda invoke \
  --function-name wclassgames-agent \
  --payload '{"httpMethod":"GET","path":"/cg/authenticate","headers":{"Authorization":"Bearer user-token-123"}}' \
  response.json
```

---

## 엔드포인트 URL

배포 후 API Gateway URL을 WCLASSGAMES에 등록하세요:

```
https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com
```

Agent Callback Endpoint:
- `https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/cg/authenticate`
- `https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/cg/balance`
- `https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/cg/transaction`
