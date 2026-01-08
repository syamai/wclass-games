/**
 * WCLASSGAMES Agent Callback Server Sample (Express.js)
 *
 * Seamless Wallet 모드에서 Agent가 구현해야 하는 콜백 API 서버 예제입니다.
 * WCLASSGAMES가 이 엔드포인트들을 호출하여 사용자 인증 및 잔액 관리를 수행합니다.
 *
 * 실행 방법:
 *   npm install
 *   npm run server
 *
 * 제공 엔드포인트:
 *   GET  /cg/authenticate  - 사용자 인증 (JWT 토큰 검증)
 *   POST /cg/balance       - 사용자 잔액 조회
 *   POST /cg/transaction   - 거래 처리 (베팅/정산)
 */

import express, { Request, Response } from 'express';
import { createVerify } from 'crypto';

const app = express();
app.use(express.json());

// ============================================================================
// 샘플 데이터베이스 (실제 환경에서는 DB 사용)
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

const users: Map<string, User> = new Map([
  ['user-token-123', { id: '1001', name: 'player1', email: 'player1@example.com', balance: 10000 }],
  ['user-token-456', { id: '1002', name: 'player2', email: 'player2@example.com', balance: 5000 }],
]);

// 처리된 트랜잭션 저장 (멱등성 보장용)
const processedTransactions: Map<string, { balanceBefore: number; changed: number; balanceAfter: number }> = new Map();

// RSA 공개키 (WCLASSGAMES에서 제공받은 키로 교체)
const WCLASSGAMES_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
YOUR_RSA_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----`;

// ============================================================================
// GET /cg/authenticate - 사용자 인증
// ============================================================================

app.get('/cg/authenticate', (req: Request, res: Response) => {
  console.log('\n📥 [Authenticate] Request received');

  const authHeader = req.headers['authorization'];
  console.log(`   Authorization: ${authHeader}`);

  if (!authHeader) {
    console.log('   ❌ Missing authorization header');
    return res.status(401).json({
      result: false,
      message: 'Unauthorized',
    });
  }

  // Bearer 토큰 추출
  const token = authHeader.replace('Bearer ', '');
  const user = users.get(token);

  if (!user) {
    console.log('   ❌ Invalid token');
    return res.status(401).json({
      result: false,
      message: 'AgentUserUnauthorized',
    });
  }

  console.log(`   ✅ User authenticated: ${user.name} (${user.id})`);

  res.json({
    result: true,
    message: 'Successfully.',
    data: {
      userId: user.id,
      userName: user.name,
      email: user.email,
    },
  });
});

// ============================================================================
// POST /cg/balance - 사용자 잔액 조회
// ============================================================================

app.post('/cg/balance', (req: Request, res: Response) => {
  console.log('\n📥 [Balance] Request received');
  console.log(`   Body: ${JSON.stringify(req.body)}`);

  const { userId } = req.body;

  // 사용자 찾기
  let user: User | undefined;
  for (const u of users.values()) {
    if (u.id === userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    console.log(`   ❌ User not found: ${userId}`);
    return res.status(404).json({
      result: false,
      message: 'PlayerNotFound',
    });
  }

  console.log(`   ✅ Balance: ${user.balance}`);

  res.json({
    result: true,
    message: 'Get user balance successfully',
    data: {
      userId: user.id,
      userName: user.name,
      balance: user.balance,
    },
  });
});

// ============================================================================
// POST /cg/transaction - 거래 처리
// ============================================================================

app.post('/cg/transaction', (req: Request, res: Response) => {
  console.log('\n📥 [Transaction] Request received');
  console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);

  const signature = req.headers['x-cg-signature'] as string;
  const { userId, nonce, data } = req.body;

  // 1. 서명 검증 (실제 환경에서 활성화)
  // if (!verifySignature(JSON.stringify(req.body), signature)) {
  //   console.log('   ❌ Invalid signature');
  //   return res.status(401).json({ result: false, message: 'Unauthorized' });
  // }

  // 2. 중복 트랜잭션 체크 (멱등성)
  if (processedTransactions.has(nonce)) {
    console.log(`   ⚠️ Transaction already processed: ${nonce}`);
    const existing = processedTransactions.get(nonce)!;
    return res.status(403).json({
      result: false,
      message: 'AlreadyProcessed',
      data: existing,
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
    console.log(`   ❌ User not found: ${userId}`);
    return res.status(404).json({
      result: false,
      message: 'PlayerNotFound',
    });
  }

  // 4. 금액 변동 처리
  const changeAmount = parseFloat(data.change_amount);
  const balanceBefore = user.balance;

  // 잔액 부족 체크 (출금의 경우)
  if (changeAmount < 0 && user.balance + changeAmount < 0) {
    console.log(`   ❌ Insufficient balance: ${user.balance} + ${changeAmount} < 0`);
    return res.status(402).json({
      result: false,
      message: 'InsufficientPlayerBalance',
      data: {
        balance: user.balance,
      },
    });
  }

  // 잔액 업데이트
  user.balance += changeAmount;
  users.set(userToken, user);

  // 트랜잭션 기록
  const txResult = {
    balanceBefore,
    changed: changeAmount,
    balanceAfter: user.balance,
  };
  processedTransactions.set(nonce, txResult);

  const status = data.data?.status || 'Unknown';
  const result = data.data?.position?.result || '';

  console.log(`   ✅ Transaction processed`);
  console.log(`      Status: ${status} ${result}`);
  console.log(`      Change: ${changeAmount >= 0 ? '+' : ''}${changeAmount}`);
  console.log(`      Balance: ${balanceBefore} → ${user.balance}`);

  res.json({
    result: true,
    message: 'Transaction processed successfully',
    data: txResult,
  });
});

// ============================================================================
// 서명 검증 함수
// ============================================================================

function verifySignature(body: string, signature: string): boolean {
  try {
    const verifier = createVerify('RSA-SHA512');
    verifier.update(body);
    verifier.end();
    return verifier.verify(WCLASSGAMES_PUBLIC_KEY, signature, 'base64');
  } catch {
    return false;
  }
}

// ============================================================================
// 서버 시작
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('═'.repeat(60));
  console.log('WCLASSGAMES Agent Callback Server');
  console.log('═'.repeat(60));
  console.log();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log();
  console.log('📋 Available Endpoints:');
  console.log(`   GET  /cg/authenticate  - 사용자 인증`);
  console.log(`   POST /cg/balance       - 잔액 조회`);
  console.log(`   POST /cg/transaction   - 거래 처리`);
  console.log();
  console.log('🔑 Test Tokens:');
  console.log(`   user-token-123 → player1 (Balance: 10000)`);
  console.log(`   user-token-456 → player2 (Balance: 5000)`);
  console.log();
  console.log('─'.repeat(60));
});
