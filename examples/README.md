# WCLASSGAMES MCP Examples

WCLASSGAMES MCP 서버 연동 예제입니다.

---

## 추가된 파일

```
examples/
├── README.md              # 예제 설명 문서
├── agent-server.ts        # Agent Callback API 서버 샘플 (Express.js)
├── mcp-client-usage.ts    # MCP 클라이언트 사용 예제
└── simple-usage.md        # 간단한 사용 가이드 (한국어)
```

---

## 1. Agent 콜백 서버 샘플 실행

```bash
cd /Users/ahnsungbin/Source/wclass-games/examples
npm install
npm run server
```

**제공 엔드포인트:**
- `GET /cg/authenticate` - 사용자 인증 (JWT 토큰 검증)
- `POST /cg/balance` - 사용자 잔액 조회
- `POST /cg/transaction` - 거래 처리 (베팅/정산)

**테스트 토큰:**
- `user-token-123` → player1 (잔액: 10,000)
- `user-token-456` → player2 (잔액: 5,000)

---

## 2. MCP 클라이언트 사용 예제 실행

```bash
# 먼저 MCP 서버 빌드 (루트 디렉토리에서)
cd /Users/ahnsungbin/Source/wclass-games
npm install
npm run build

# .env 파일 설정
cp .env.example .env
# AGENT_ID, AGENT_SECRET 입력

# 예제 실행
cd examples
npm run client
```

---

## 3. 연동 플로우

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
              Agent → deposit/withdraw → WCLASSGAMES
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
                   Agent 잔액 차감 (change_amount < 0)
                          ↓
                      게임 결과
                          ↓
              WCLASSGAMES → /cg/transaction → Agent
                          ↓
                   Agent 잔액 정산 (change_amount > 0)
```

---

## 4. Claude Desktop에서 사용 예시

### 에이전트 잔액 확인
```
"WCLASSGAMES 에이전트 잔액을 확인해줘"
```

### 게임 런칭
```
"사용자 토큰 'user-token-123'으로 게임을 런칭해줘"
```

### 플레이어 입금/출금
```
"플레이어 토큰 'user-token-123'에 1000을 입금해줘"

"플레이어 토큰 'user-token-123'에서 500을 출금해줘"
```

### 거래 내역 조회
```
"최근 거래 내역 10개를 보여줘"

"거래 ID 'e83adae1-dad8-4e29-ad09-d6ca99609c22'의 상세 정보를 알려줘"
```

---

## 5. MCP 도구 목록

| 도구 | 설명 | 필수 파라미터 |
|------|------|--------------|
| `get_agent_balance` | 에이전트 잔액 조회 | - |
| `launch_game` | 게임 런칭 URL 생성 | `userToken` |
| `get_player_balance` | 플레이어 잔액 조회 | `userToken` |
| `deposit` | 플레이어에게 입금 | `userToken`, `amount` |
| `withdraw` | 플레이어로부터 출금 | `userToken`, `amount` |
| `get_transfer_history` | 입출금 내역 조회 | - |
| `get_transaction` | 특정 거래 조회 | `transactionId` |
| `get_transactions` | 거래 목록 조회 | - |

---

## ★ Insight ─────────────────────────────────────

**Agent 서버 구현 포인트:**

1. **`/cg/authenticate`**: Bearer 토큰으로 사용자 검증 후 `userId`, `userName`, `email` 반환

2. **`/cg/transaction`**: `x-cg-signature` 헤더로 RSA-SHA512 서명 검증 필수

3. **멱등성 보장**: `nonce`로 중복 거래 체크, 이미 처리된 거래는 `AlreadyProcessed` 반환

4. **잔액 부족**: `change_amount`가 음수이고 잔액이 부족하면 `InsufficientPlayerBalance` 반환

─────────────────────────────────────────────────
