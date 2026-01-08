/**
 * WCLASSGAMES Agent Callback Server - AWS Lambda Version
 *
 * AWS Lambda + API Gateway에서 실행되는 Agent Callback API입니다.
 * Seamless Wallet 모드에서 WCLASSGAMES가 호출하는 엔드포인트를 제공합니다.
 *
 * 배포 방법:
 *   1. npm install && npm run build
 *   2. dist/ 폴더를 zip으로 압축
 *   3. AWS Lambda에 업로드
 *   4. API Gateway 연결 (HTTP API 또는 REST API)
 *
 * 환경 변수:
 *   - WCLASSGAMES_PUBLIC_KEY: RSA 공개키 (서명 검증용)
 */

import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createVerify } from 'crypto';

// ============================================================================
// 타입 정의
// ============================================================================

// HTTP API v2 또는 REST API v1 이벤트 모두 지원
type LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2;

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

interface TransactionResult {
  balanceBefore: number;
  changed: number;
  balanceAfter: number;
}

// ============================================================================
// 샘플 데이터베이스 (실제 환경에서는 DynamoDB 등 사용)
// ============================================================================

// 메모리 DB (Lambda 인스턴스 간 공유 안됨 - 실제로는 DynamoDB 사용)
const users: Map<string, User> = new Map([
  ['user-token-123', { id: '1001', name: 'player1', email: 'player1@example.com', balance: 10000 }],
  ['user-token-456', { id: '1002', name: 'player2', email: 'player2@example.com', balance: 5000 }],
]);

const processedTransactions: Map<string, TransactionResult> = new Map();

// ============================================================================
// Lambda Handler
// ============================================================================

export const handler = async (
  event: LambdaEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // HTTP API v2와 REST API v1 이벤트 모두 지원
  const isV2 = 'version' in event && event.version === '2.0';
  const path = isV2
    ? (event as APIGatewayProxyEventV2).rawPath
    : (event as APIGatewayProxyEvent).path;
  const httpMethod = isV2
    ? (event as APIGatewayProxyEventV2).requestContext.http.method
    : (event as APIGatewayProxyEvent).httpMethod;
  const headers = event.headers;
  const body = event.body ?? null;

  try {
    // 라우팅
    if (path === '/cg/authenticate' && httpMethod === 'GET') {
      return handleAuthenticate(headers);
    }

    if (path === '/cg/balance' && httpMethod === 'POST') {
      return handleBalance(body);
    }

    if (path === '/cg/transaction' && httpMethod === 'POST') {
      return handleTransaction(headers, body);
    }

    // 404 Not Found
    return response(404, { result: false, message: 'NotFound' });

  } catch (error) {
    console.error('Error:', error);
    return response(500, { result: false, message: 'UnknownError' });
  }
};

// ============================================================================
// GET /cg/authenticate - 사용자 인증
// ============================================================================

function handleAuthenticate(
  headers: Record<string, string | undefined>
): APIGatewayProxyResult {
  console.log('[Authenticate] Processing...');

  const authHeader = headers['authorization'] || headers['Authorization'];

  if (!authHeader) {
    console.log('[Authenticate] Missing authorization header');
    return response(401, { result: false, message: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const user = users.get(token);

  if (!user) {
    console.log('[Authenticate] Invalid token');
    return response(401, { result: false, message: 'AgentUserUnauthorized' });
  }

  console.log(`[Authenticate] Success: ${user.name} (${user.id})`);

  return response(200, {
    result: true,
    message: 'Successfully.',
    data: {
      userId: user.id,
      userName: user.name,
      email: user.email,
    },
  });
}

// ============================================================================
// POST /cg/balance - 잔액 조회
// ============================================================================

function handleBalance(body: string | null): APIGatewayProxyResult {
  console.log('[Balance] Processing...');

  if (!body) {
    return response(400, { result: false, message: 'BadRequest' });
  }

  const { userId } = JSON.parse(body);

  // 사용자 찾기
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    console.log(`[Balance] User not found: ${userId}`);
    return response(404, { result: false, message: 'PlayerNotFound' });
  }

  console.log(`[Balance] Success: ${user.balance}`);

  return response(200, {
    result: true,
    message: 'Get user balance successfully',
    data: {
      userId: user.id,
      userName: user.name,
      balance: user.balance,
    },
  });
}

// ============================================================================
// POST /cg/transaction - 거래 처리
// ============================================================================

function handleTransaction(
  headers: Record<string, string | undefined>,
  body: string | null
): APIGatewayProxyResult {
  console.log('[Transaction] Processing...');

  if (!body) {
    return response(400, { result: false, message: 'BadRequest' });
  }

  const signature = headers['x-cg-signature'] || headers['X-Cg-Signature'];
  const parsed = JSON.parse(body);
  const { userId, nonce, data } = parsed;

  // 1. 서명 검증 (프로덕션에서 활성화)
  // const publicKey = process.env.WCLASSGAMES_PUBLIC_KEY;
  // if (publicKey && !verifySignature(body, signature, publicKey)) {
  //   console.log('[Transaction] Invalid signature');
  //   return response(401, { result: false, message: 'Unauthorized' });
  // }

  // 2. 중복 체크 (멱등성)
  if (processedTransactions.has(nonce)) {
    console.log(`[Transaction] Already processed: ${nonce}`);
    return response(403, {
      result: false,
      message: 'AlreadyProcessed',
      data: processedTransactions.get(nonce),
    });
  }

  // 3. 사용자 찾기
  let user: User | undefined;
  let userToken: string | undefined;
  for (const [token, u] of users.entries()) {
    if (u.id === userId) {
      user = u;
      userToken = token;
      break;
    }
  }

  if (!user || !userToken) {
    console.log(`[Transaction] User not found: ${userId}`);
    return response(404, { result: false, message: 'PlayerNotFound' });
  }

  // 4. 금액 처리
  const changeAmount = parseFloat(data.change_amount);
  const balanceBefore = user.balance;

  // 잔액 부족 체크
  if (changeAmount < 0 && user.balance + changeAmount < 0) {
    console.log(`[Transaction] Insufficient balance: ${user.balance} + ${changeAmount} < 0`);
    return response(402, {
      result: false,
      message: 'InsufficientPlayerBalance',
      data: { balance: user.balance },
    });
  }

  // 잔액 업데이트
  user.balance += changeAmount;
  users.set(userToken, user);

  // 결과 저장
  const txResult: TransactionResult = {
    balanceBefore,
    changed: changeAmount,
    balanceAfter: user.balance,
  };
  processedTransactions.set(nonce, txResult);

  console.log(`[Transaction] Success: ${balanceBefore} → ${user.balance}`);

  return response(200, {
    result: true,
    message: 'Transaction processed successfully',
    data: txResult,
  });
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

function verifySignature(body: string, signature: string | undefined, publicKey: string): boolean {
  if (!signature) return false;

  try {
    const verifier = createVerify('RSA-SHA512');
    verifier.update(body);
    verifier.end();
    return verifier.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}
