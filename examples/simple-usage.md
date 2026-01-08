# WCLASSGAMES MCP 간단 사용 가이드

## 개요

WCLASSGAMES MCP 서버는 게임 플랫폼과 연동하기 위한 도구들을 제공합니다.

---

## 제공 도구

| 도구 | 설명 |
|------|------|
| `get_agent_balance` | 에이전트 잔액 조회 |
| `launch_game` | 게임 런칭 URL 생성 |
| `get_player_balance` | 플레이어 잔액 조회 |
| `deposit` | 플레이어에게 입금 |
| `withdraw` | 플레이어로부터 출금 |
| `get_transfer_history` | 입출금 내역 조회 |
| `get_transaction` | 특정 거래 조회 |
| `get_transactions` | 거래 목록 조회 |

---

## Claude Desktop 사용 예시

### 에이전트 잔액 확인
```
"WCLASSGAMES 에이전트 잔액을 확인해줘"
```

### 게임 런칭
```
"사용자 토큰 'eyJhbGciOi...'로 게임을 런칭해줘"
```

### 플레이어 입금
```
"플레이어 토큰 'user-123'에 1000을 입금해줘"
```

### 플레이어 출금
```
"플레이어 토큰 'user-123'에서 500을 출금해줘"
```

### 거래 내역 조회
```
"최근 거래 내역 10개를 보여줘"
```

```
"사용자 ID '1597876055493'의 거래 내역을 조회해줘"
```

### 특정 거래 상세 조회
```
"거래 ID 'e83adae1-dad8-4e29-ad09-d6ca99609c22'의 상세 정보를 알려줘"
```

---

## 연동 플로우

### Balance Transfer 모드
```
사용자 → Agent Site → MCP Server → WCLASSGAMES
                          ↓
                    launch_game
                          ↓
              WCLASSGAMES → /authenticate → Agent
                          ↓
                    launchUrl 반환
                          ↓
              사용자 → 게임 페이지 → 게임 플레이
                          ↓
                    deposit / withdraw
                          ↓
                     잔액 업데이트
```

### Seamless Wallet 모드
```
사용자 → Agent Site → MCP Server → WCLASSGAMES
                          ↓
                    launch_game
                          ↓
              WCLASSGAMES → /authenticate → Agent
                          ↓
                    launchUrl 반환
                          ↓
              사용자 → 게임 페이지 → 베팅
                          ↓
              WCLASSGAMES → /cg/transaction → Agent
                          ↓
                   Agent 잔액 차감
                          ↓
                      게임 결과
                          ↓
              WCLASSGAMES → /cg/transaction → Agent
                          ↓
                   Agent 잔액 정산
```

---

## Agent 콜백 서버 구현 (Seamless 모드)

Seamless Wallet 모드에서는 Agent가 다음 엔드포인트를 구현해야 합니다:

### GET /cg/authenticate
사용자 JWT 토큰을 검증하고 사용자 정보를 반환합니다.

**Request Headers:**
- `Authorization: Bearer <userToken>`

**Response:**
```json
{
  "result": true,
  "message": "Successfully.",
  "data": {
    "userId": "1001",
    "userName": "player1",
    "email": "player1@example.com"
  }
}
```

### POST /cg/balance
사용자 잔액을 조회합니다.

**Request Body:**
```json
{
  "userId": "1001"
}
```

**Response:**
```json
{
  "result": true,
  "message": "Get user balance successfully",
  "data": {
    "userId": "1001",
    "userName": "player1",
    "balance": 10000
  }
}
```

### POST /cg/transaction
거래(베팅/정산)를 처리합니다. **멱등성을 보장해야 합니다.**

**Request Headers:**
- `X-Cg-Signature: <RSA-SHA512 signature>`

**Request Body:**
```json
{
  "userId": "1001",
  "timestamp": 1760633794277,
  "nonce": "unique-transaction-id",
  "data": {
    "change_amount": "-1000",
    "data": {
      "type": "Futures",
      "status": "Opened",
      ...
    }
  }
}
```

**Response:**
```json
{
  "result": true,
  "message": "Transaction processed successfully",
  "data": {
    "balanceBefore": 10000,
    "changed": -1000,
    "balanceAfter": 9000
  }
}
```

---

## 주요 구현 포인트

### 서명 검증
```typescript
import { createVerify } from 'crypto';

function verifySignature(body: string, signature: string, publicKey: string): boolean {
  const verifier = createVerify('RSA-SHA512');
  verifier.update(body);
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
}
```

### 멱등성 처리
```typescript
const processedTransactions = new Map();

if (processedTransactions.has(nonce)) {
  return res.status(403).json({
    result: false,
    message: 'AlreadyProcessed'
  });
}
```

### 잔액 부족 처리
```typescript
if (changeAmount < 0 && user.balance + changeAmount < 0) {
  return res.status(402).json({
    result: false,
    message: 'InsufficientPlayerBalance'
  });
}
```

---

## 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 200 | OK | 성공 |
| 401 | Unauthorized | 인증 실패 |
| 402 | InsufficientPlayerBalance | 잔액 부족 |
| 403 | AlreadyProcessed | 중복 거래 |
| 404 | PlayerNotFound | 사용자 없음 |
| 500 | UnknownError | 서버 오류 |
