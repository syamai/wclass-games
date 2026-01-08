# WCLASSGAMES API Specification

> **Last update**: October, 2025
> © 2025 WCLASSGAMES

---

## Update History

### 2025-10-24
- Initial API specification release
- Integration API, Balance Transfer API, Seamless Wallet Callback API
- Data Feed API for transaction history

---

## Table of Contents

1. [I. API Overview](#i-api-overview)
   - [1.1 Prerequisites](#11-prerequisites)
   - [1.2 Integration API](#12-integration-api)
   - [1.3 Balance Transfer API](#13-balance-transfer-api)
   - [1.4 Seamless Wallet Callback API](#14-seamless-wallet-callback-api)
   - [1.5 Data Feed API](#15-data-feed-api)
   - [1.6 Error Codes](#16-error-codes)
2. [II. Authorization](#ii-authorization)
   - [2.1 Get Key](#21-get-key)
   - [2.2 Signature Calculation](#22-signature-calculation)
   - [2.3 Request Header](#23-request-header)
   - [2.4 Verification](#24-verification)
3. [III. Integration API](#iii-integration-api)
   - [3.1 GET AgentBalance](#31-get-agentbalance)
   - [3.2 GET Authenticate](#32-get-authenticate)
   - [3.3 POST LaunchGame](#33-post-launchgame)
4. [IV. Balance Transfer API](#iv-balance-transfer-api)
   - [4.1 GET PlayerBalance](#41-get-playerbalance)
   - [4.2 POST Deposit](#42-post-deposit)
   - [4.3 POST Withdraw](#43-post-withdraw)
   - [4.4 GET TransferResult](#44-get-transferresult)
5. [V. Seamless Wallet Callback API](#v-seamless-wallet-callback-api)
   - [5.1 POST Balance](#51-post-balance)
   - [5.2 POST Transaction](#52-post-transaction)
6. [VI. Data Feed API](#vi-data-feed-api)
   - [6.1 GET Transaction](#61-get-transaction)
   - [6.2 GET Transactions](#62-get-transactions)
7. [VII. Configuration](#vii-configuration)

---

## I. API Overview

### 1.1 Prerequisites

The following requisites must be determined to start integration of the API.

For the main API Server, the URL of Wclassgames will be: **api.wclassgames.com**

```
https://<API-SERVER-DOMAIN>/ -> https://api.wclassgames.com
```

#### Balance Transfer Mode

| Requisite | Provider | Example |
|-----------|----------|---------|
| API Server URL | WCLASSGAMES | `https://<API-SERVER-DOMAIN>/` |
| Agent Id | WCLASSGAMES | `6f748d89-288c-45aa-b206-abd8190c2ef9` |
| Agent Secret | WCLASSGAMES | `qa2OMOiC6AVkuypY4aZIPOoAR5v9kSu0VcwOKQ8tsvUHCpKZEpFzrZZed2N34y0e` |
| Agent Callback Endpoint | Agent | `https://<AGENT-CALLBACK-ENDPOINT>/` |

#### Seamless Wallet Mode

| Requisite | Provider | Example |
|-----------|----------|---------|
| API Server URL | WCLASSGAMES | `https://<API-SERVER-DOMAIN>/` |
| Agent Id | WCLASSGAMES | `6f748d89-288c-45aa-b206-abd8190c2ef9` |
| Agent Secret | WCLASSGAMES | `qa2OMOiC6AVkuypY4aZIPOoAR5v9kSu0VcwOKQ8tsvUHCpKZEpFzrZZed2N34y0e` |
| Agent Public Key | Agent | (see II. Authorization) |
| Agent Callback Endpoint | Agent | `https://<AGENT-CALLBACK-ENDPOINT>/` |

---

### 1.2 Integration API

Agents may use this API for launching games.

| Action | Description | Status |
|--------|-------------|--------|
| AgentBalance | Using this action, agents can retrieve the current agent balance | Optional |
| Authenticate | Using this action, WCLASSGAMES will retrieve the user credentials | **Required** |
| LaunchGame | Using this action, agents can retrieve a launch URL for the game | **Required** |

---

### 1.3 Balance Transfer API

Balance Transferring Agents should use this API for transferring funds to player's wallet and retrieving the current balance within WCLASSGAMES.

| Action | Description | Status |
|--------|-------------|--------|
| PlayerBalance | Using this action, agents can retrieve current balance of a player | **Required** |
| Deposit | Using this action, agents can transfer funds in to player's balance | **Required** |
| Withdraw | Using this action, agents can transfer funds out of player's balance | **Required** |
| TransferResult | Using this action, agents can retrieve the result of a transaction | Optional |

---

### 1.4 Seamless Wallet Callback API

Seamless Wallet Agents should provide the Seamless Wallet Callback API on their side. WCLASSGAMES will call the API actions when players make a bet or get a win so their balance has to be updated.

| Action | Description | Status |
|--------|-------------|--------|
| Balance | Using this action, WCLASSGAMES will retrieve current balance of a player | **Required** |
| Transaction | Using this action, WCLASSGAMES will send transactions to be processed | **Required** |

---

### 1.5 Data Feed API

Agents may use this API for loading in-game or ended game transactions.

| Action | Description | Max Items | Note |
|--------|-------------|-----------|------|
| Transaction | Using this action, agents can get information about a specific transaction | 1 | |
| Transactions | Using this action, agents can load up to 100 money transactions | 100 | **Balance Transferring Agents only** |

---

### 1.6 Error Codes

#### Integration Service API

In general, API responses from WCLASSGAMES will have one of the following response types.

| HTTP Status | Status Code | Description |
|-------------|-------------|-------------|
| 200 | OK | Successful |
| 401 | Unauthorized | You are not authorized to perform this action |
| 404 | AgentNotFound | Agent not found |
| 401 | InvalidAgentSignature | The agent signature is invalid |
| 401 | AgentUserUnauthorized | Agent user is not authorized |
| 400 | InsufficientAgentBalance | Insufficient agent balance |
| 400 | InsufficientBalance | Insufficient user balance |
| 500 | InternalServerError | An internal server error occurred. Please try again later |

#### Seamless Wallet Callback API

Callback API responses from Seamless Wallet Agents should have one of the following HTTP status codes and status values.

| HTTP Status | Status Code | Description |
|-------------|-------------|-------------|
| 200 | OK | Successful |
| 401 | Unauthorized | Verification of the authorization header has failed |
| 402 | InsufficientPlayerBalance | The transaction has failed due to insufficient player balance |
| 403 | AlreadyProcessed | The transaction with the specified id has already been processed |
| 404 | NotFound | Some resources do not exist or are disabled |
| 404 | PlayerNotFound | The player with the specified code does not exist |
| 404 | ReferenceNotFound | The resource with the specified reference does not exist |
| 500 | UnknownError | An error occurred while processing the request |
| 501 | OutOfTradeLimits | Out of Seamless Agent's Trade Limits |

---

## II. Authorization

Agents should always take deep care of security issues.

- To launch the games, agents need to send a request join game with encoded signature by agent id and agent secret key as an Request Header
- Agents need to verify request from WCLASSGAMES using the public key and the signature is attached as Request Header
- Seamless Wallet Agents need to verify every callback request from WCLASSGAMES using the callback public key

### 2.1 Get Key

Agents need to get agent id, agent secret and a RSA public key from WCLASSGAMES. The public key is secret and should never be aware to others. The key and secret is top secret and should never be aware to others.

Using online services, you can get agent id, agent secret and RSA key pairs.

### 2.2 Signature Calculation

1. The input text consists of the following elements. Elements will be separated by one ":" character.
   - **Agent Id** e.g. `2fa797ba-90b2-491a-bed1-fc5936d9c544`
   - **Agent Secret Key** e.g. `J5XAD8DH7aCWk2GQyEpcYCz7kV3xlNOpDJgAdC7Oh3dTAOYPvfov2EXiM1cYTxrW`

2. The **SHA512withRSA** algorithm is used to sign the input text.

3. **Example**
   - **The input text**: `2fa797ba-90b2-491a-bed1-fc5936d9c544:J5XAD8DH7aCWk2GQyEpcYCz7kV3xlNOpDJgAdC7Oh3dTAOYPvfov2EXiM1cYTxrW`
   - **Signature (base64 encoded)**: `Basic YjI5NzIxMGM2Yzc3YTNlN2JlZDMwOGY2N2Y3OWUwMGUyN2I2MDNjNjY1MTRmYjBkZDIwMmY0N2U1MmQxODVlNGNhYWQyODU3ODdmNGE2YmRlODVjMzNhM2FlZjEyNGUxNTM3Y2JiZTkzOTFkNThhNmE2MTU2MWI2MmI1ZGU1MDc=`

---

### 2.3 Request Header

Request header consists of the following elements:

- Agent Id provided by WCLASSGAMES
- The signature encoded in base64
- The Authorization of user within Agent System

**Example:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Agent-Id: d41b9c78-c5e9-4644-84e2-db08a437163f
X-Agent-Signature: Basic YjI5NzIxMGM2Yzc3YTNlN2JlZDMwOGY2N2Y3OWUwMGUy...
```

---

### 2.4 Verification

The callback requests that WCLASSGAMES sends to Seamless Wallet Agents will also have authorization headers that are generated through exactly the same process described above with the callback private key.

**Verify Agent API Callback Signature:**

```javascript
const { createVerify } = require('crypto');

const validateTransactionCallback = (agentPublicKey, requestBody) => {
  const signature = req.headers['x-cg-signature'];
  if (typeof signature !== 'string') return false;

  const message = JSON.stringify(requestBody);
  const verifier = createVerify('RSA-SHA512');
  verifier.write(message);
  verifier.end();

  return verifier.verify(operatorPublicKey, signature, 'base64');
};
```

---

## III. Integration API

Agents may use this API for launching games.

### 3.1 GET AgentBalance

**Endpoint**: `GET /cashier/agent-balance`

Using this action, agents can retrieve the current agent balance within WCLASSGAMES.

**Request Parameters**: None

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from agent id and secret key | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| balance | Decimal | Current balance of the agent | Required |

**Request/Response Example**:

```http
GET https://<API-SERVER-DOMAIN>/cashier/agent-balance
```

```json
{
  "result": true,
  "message": "Successfully",
  "data": {
    "balance": 99092.80
  }
}
```

---

### 3.2 GET Authenticate (Agent Callback API)

**Endpoint**: `GET /cg/authenticate`

Using this action, WCLASSGAMES will retrieve the user credentials for play games.

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| Authorization | String | The user's jwt bearer value in the agent site's system | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| userId | Number | The user's id in the agent site's system | Required |
| userName | String | The user's name in the agent site's system | Required |
| email | String | The user's email in the agent site's system | Required |

**Request/Response Example**:

```http
GET https://<AGENT-CALLBACK-ENDPOINT>/cg/authenticate
```

```json
{
  "result": true,
  "message": "Successfully.",
  "data": {
    "userId": "1754640242558",
    "userName": "test",
    "email": "test@gmail.com"
  }
}
```

---

### 3.3 POST LaunchGame

**Endpoint**: `POST /auth/join`

Using this action, agents can retrieve a launch URL for the requested game.

**Request Parameters**: None

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from agent id and secret key | Required |
| Authorization | String(255) | The user's jwt bearer value in the agent site's system | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| joinToken | String(128) | The join token attached to launch game URL | Required |
| userId | Number | Unique identifier of the user in WCLASSGAMES | Required |
| agentId | String(36) | Unique identifier of the agent in WCLASSGAMES | Required |
| launchUrl | String | The launch game URL for play game | Required |
| createdAt | Number | Timestamp (ms) launchUrl is created | Required |
| expiredAt | Number | Timestamp (ms) launchUrl is expired | Required |

**Request/Response Example**:

```http
POST https://<API-SERVER-DOMAIN>/auth/join
```

```json
{
  "result": true,
  "message": "Join successfully.",
  "data": {
    "joinToken": "RuMCULSHwpmP3z4GYt50sTKTs9BzOxokb3JzRKxw0n5qmKaIU2rHJXTzTQ4DBQwOSsZxvWWdOIFmh9f5UwRyBeN4tka6tzCOMCuJYkbF5lmxdmgzoV3SnC77qe3ehzTC",
    "userId": 1,
    "agentId": "6f748d89-288c-45aa-b206-abd8190c2ef9",
    "launchUrl": "https://wclassgames.com?id=6f748d89-288c-45aa-b206-abd8190c2ef9&join_token=RuMCULSHwpmP3z4GYt50sTKTs9BzOxokb3JzRKxw0n5qmKaIU2rHJXTzTQ4DBQwOSsZxvWWdOIFmh9f5UwRyBeN4tka6tzCOMCuJYkbF5lmxdmgzoV3SnC77qe3ehzTC",
    "createdAt": 1760631646662,
    "expiredAt": 1760631706662
  }
}
```

---

## IV. Balance Transfer API

Balance Transferring Agents should use this API for transferring funds to player's wallet and retrieving the current balance within WCLASSGAMES.

### 4.1 GET PlayerBalance

**Endpoint**: `GET /cashier/balance`

Using this action, agents can retrieve current balance of a player within WCLASSGAMES.

**Request Parameters**: None

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from agent id and secret key | Required |
| Authorization | String(255) | The user's jwt bearer value in the agent site's system | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| balance | String | Current balance of the player | Required |

**Request/Response Example**:

```http
GET https://<API-SERVER-DOMAIN>/cashier/balance
```

```json
{
  "result": true,
  "message": "Successfully.",
  "data": {
    "balance": "99092.80273446",
    "agentBalance": "1000004236.20000000"
  }
}
```

---

### 4.2 POST Deposit

**Endpoint**: `POST /cashier/deposit`

Using this action, agents can transfer funds in to player's balance within WCLASSGAMES.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| amount | Number | Deposit for user amount | Required |

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from id and secret key | Required |
| Authorization | String(255) | The user's jwt bearer value in the agent site's system | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| amount | Number | Deposit for user amount | Required |
| before | Number | The balance of user before deposit | Required |
| after | Number | The balance of user after deposit | Required |

**Request/Response Example**:

```http
POST https://<API-SERVER-DOMAIN>/cashier/deposit

{
  "amount": 100
}
```

```json
{
  "result": true,
  "message": "Successfully.",
  "data": {
    "amount": 100,
    "before": 98992.80,
    "after": 99092.80
  }
}
```

---

### 4.3 POST Withdraw

**Endpoint**: `POST /cashier/withdraw`

Using this action, agents can transfer funds out of player's balance within WCLASSGAMES.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| amount | Number | Withdraw for user amount | Required |

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from id and secret key | Required |
| Authorization | String(255) | The user's jwt bearer value in the agent site's system | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| amount | Number | Withdraw for user amount | Required |
| before | Number | The balance of user before withdraw | Required |
| after | Number | The balance of user after deposit | Required |

**Request/Response Example**:

```http
POST https://<API-SERVER-DOMAIN>/cashier/withdraw

{
  "amount": 100
}
```

```json
{
  "result": true,
  "message": "Withdraw Successfully.",
  "data": {
    "amount": 100,
    "before": 98992.80,
    "after": 98892.80
  }
}
```

---

### 4.4 GET TransferResult

**Endpoint**: `GET /cashier/history`

Using this action, agents can retrieve the result of a particular deposit or withdraw transaction that transferred funds in to or out of the player's balance within WCLASSGAMES.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| page | Number | Page number for pagination | Optional |
| size | Number | Number of records to display per page | Optional |
| startTime | DateTime | Start time for filtering data | Optional |
| endTime | DateTime | End time for filtering data | Optional |
| userId | String | Unique identifier of the user to filter results | Optional |

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Agent-Id | String(36) | Agent id in WCLASSGAMES | Required |
| X-Agent-Signature | String(255) | The signature is encoded from id and secret key | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| id | Number | Unique identifier for the record | Required |
| userId | String | Unique identifier of the user associated | Required |
| userName | String | Name of the user associated with the record | Required |
| type | String | Type of transaction or action performed | Required |
| changed | Decimal | Amount or value that has been changed | Required |
| available | Decimal | Current available amount or balance after transaction | Required |
| note | String | Additional information or comments | Required |
| transactionId | String | Unique identifier of the related transaction | Required |
| createdAt | DateTime | Date and time when the record was created | Required |

**Request/Response Example**:

```http
GET https://<API-SERVER-DOMAIN>/cashier/history?page=1&size=20&startTime=2025-10-15 15:40:00&endTime=2025-10-17 16:40:00&userId=1760597855492
```

```json
{
  "result": true,
  "message": "Successfully.",
  "data": {
    "items": [
      {
        "id": 2,
        "userId": "1597876055493",
        "userName": "testuser",
        "type": "Withdraw",
        "changed": "-1000.00000000",
        "available": "170.55089549",
        "note": "Withdraw",
        "transactionId": "1c4ee995-d1a9-49bf-9c73-f693feb2fe7b",
        "createdAt": "2025-10-16T17:27:41.000Z"
      },
      {
        "id": 1,
        "userId": "1597876055493",
        "userName": "testuser",
        "type": "Deposit",
        "changed": "1170.55089549",
        "available": "1170.55089549",
        "note": "Deposit",
        "transactionId": "a2f27c3b-27e5-4757-ae5d-8fa5d635108c",
        "createdAt": "2025-10-16T16:43:53.000Z"
      }
    ],
    "pageable": {
      "totalElement": 1,
      "currentElement": 2,
      "totalPage": 1,
      "page": 20,
      "size": 2,
      "hasNext": false
    }
  }
}
```

---

## V. Seamless Wallet Callback API

Seamless Wallet Agents should provide the Seamless Wallet Callback API on their side. WCLASSGAMES will call the API actions when players make any action play games, so their balance has to be updated.

### 5.1 POST Balance

**Endpoint**: `POST /cg/balance`

Using this action, WCLASSGAMES will retrieve current balance of a player.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| userId | String(63) | Unique identifier of the player | Required |

**Request Headers**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| X-Cg-Signature | String | Unique identifier of the player | Required |

**Response Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| balance | Decimal | Current balance of the player | Required |

**Request/Response Example**:

```http
POST https://<AGENT-CALLBACK-ENDPOINT>/cg/balance
```

```json
{
  "result": true,
  "message": "Get user balance successfully",
  "data": {
    "userId": 1024,
    "userName": "nguyenhuong95",
    "balance": 98543.75
  }
}
```

---

### 5.2 POST Transaction

**Endpoint**: `POST /cg/transaction`

Using this action, WCLASSGAMES will send transactions to be processed for players' action. Agent side should change the player's balance in appliance with this request and return the updated balance.

> **Important:** The call is idempotent, i.e. sending it again only creates one transaction.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| userId | Number | The user's id in the agent site's system | Required |
| timestamp | String | Timestamp(ms) transaction is sent | Required |
| nonce | String | Unique identifier nonce | Required |
| data | Object | Transaction data | Required |

#### Transaction Procedure

1. **Check transaction uniqueness.**
   - Look for a transaction with the specified uuid which has already been processed.
   - If such transaction is found, return error code `AlreadyProcessed`.

2. **In case status is Opened:**
   - The request `change_amount` will be negative.
   - If the player's current balance is insufficient to cover the amount of trade, return status `InsufficientPlayerBalance` and the player's current balance.
   - Add the negative request `change_amount` from the player's balance and return Success.

3. **In case status is Closed and result is Win:**
   - The request `change_amount` will be positive.
   - Add the request `change_amount` to the player's balance and return Success.

4. **In case status is Closed and result is Lose:**
   - The request `change_amount` will be negative.
   - Add the negative request `change_amount` to the player's balance and return Success.

5. **In case type is Other:**
   - The request `change_amount` can be positive or negative.
   - If the `change_amount` is negative and the player's balance is going negative by this transaction, return status `InsufficientPlayerBalance` and the player's current balance.
   - Add the request `change_amount` to the player's balance and return Success.

**Request/Response Example (Position Opened)**:

```http
POST https://<AGENT-CALLBACK-ENDPOINT>/cg/transaction

{
  "userId": "1760611439745",
  "timestamp": 1760633794277,
  "nonce": "41681cf5-0da8-4134-8b19-1c4c2d3a52bd",
  "data": {
    "change_amount": "-10000",
    "data": {
      "type": "Futures",
      "status": "Opened",
      "user": {
        "id": "1760611439745",
        "name": "test",
        "email": "test@gmail.com"
      },
      "position": {
        "symbol": "BTC",
        "side": "Long",
        "trade_amount": 10000,
        "entry_price": 108836.178,
        "bust_price": "97956.943",
        "multiplier": 10,
        "status": "Opened",
        "take_profit": null,
        "stop_loss": null,
        "open_fee": "20",
        "close_fee": "20",
        "entry_time": 1760633794
      }
    }
  }
}
```

```json
{
  "result": true,
  "message": "Transaction processed successfully",
  "data": {
    "balanceBefore": 20000,
    "changed": -10000,
    "balanceAfter": 10000
  }
}
```

**Request/Response Example (Position Closed - Win)**:

```http
POST https://<AGENT-CALLBACK-ENDPOINT>/cg/transaction

{
  "userId": "1760611439745",
  "timestamp": 1760634071430,
  "nonce": "1139fef1-cb3d-47c3-9d11-69c113baf2c4",
  "data": {
    "change_amount": "10017.086238364599683021",
    "data": {
      "type": "Futures",
      "status": "Closed",
      "user": {
        "id": "1760611439745",
        "name": "test",
        "email": "test@gmail.com"
      },
      "position": {
        "id": "69af9d2a-b69d-47dc-a649-d4ff4571a7e8",
        "symbol": "BTC",
        "side": "Long",
        "trade_amount": "10000.000000",
        "entry_price": "108836.178000",
        "exit_price": 108898.558,
        "multiplier": 10,
        "status": "Closed",
        "sub_status": "Normal",
        "pnl": "57.086238364599683021",
        "roi": "0.005731550036606394",
        "outcome": "10017.086238364599683021",
        "result": "Win"
      }
    }
  }
}
```

---

## VI. Data Feed API

Agents may use this API for loading in-game transactions and opening game round history pages.

### 6.1 GET Transaction

**Endpoint**: `GET /trade/transaction`

Using this action, agents can get information about a specific transaction.

**Request/Response Example**:

```http
GET https://<API-SERVER-DOMAIN>/trade/transaction?id=e83adae1-dad8-4e29-ad09-d6ca99609c22
```

```json
{
  "result": true,
  "message": "Get transaction details OK",
  "data": {
    "transaction": {
      "id": 9,
      "userId": "1597876055493",
      "userName": "testuser",
      "type": "OpenPosition",
      "changed": "-100.00000000",
      "available": "92691.61670010",
      "note": "[Futures/Seamless]Open 100 Points Long position BTC with multiplier x10",
      "refId": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
      "asset": "Points",
      "createdAt": "2025-10-17T16:09:29.000Z",
      "gameType": "Futures",
      "gameDetails": {
        "id": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
        "tradeAmount": "100.000000",
        "gameCoin": "BTC",
        "status": "Closed",
        "pnl": "-0.149883",
        "result": "Lose"
      }
    }
  }
}
```

---

### 6.2 GET Transactions

**Endpoint**: `GET /trade/transactions`

Using this action, agents can load up to 100 money transactions. This data feed should be used as the main transaction collector by Balance Transferring Agents.

**Request Parameters**:

| Name | Type | Description | Status |
|------|------|-------------|--------|
| page | Number | Page number for pagination | Optional |
| size | Number | Number of records to display | Optional |
| startTime | DateTime | Start time for filtering data | Optional |
| endTime | DateTime | End time for filtering data | Optional |
| userId | String | Filter by user ID | Optional |

**Request/Response Example**:

```http
GET https://<API-SERVER-DOMAIN>/trade/transactions?page=1&size=20&startTime=2025-10-15 15:40:00&endTime=2025-10-17 16:40:00&userId=1597876055493
```

```json
{
  "result": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": 10,
        "userId": "1597876055493",
        "userName": "testuser",
        "type": "ClosePosition",
        "changed": "99.45011744",
        "available": "99.45011744",
        "note": "[Futures/Seamless] Close position e83adae1-dad8-4e29-ad09-d6ca99609c22",
        "refId": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
        "asset": "Points",
        "createdAt": "2025-10-17T16:09:31.000Z",
        "gameType": "Futures",
        "gameDetails": {
          "id": "e83adae1-dad8-4e29-ad09-d6ca99609c22",
          "tradeAmount": "100.000000",
          "gameCoin": "BTC",
          "status": "Closed",
          "pnl": "-0.149883",
          "result": "Lose"
        }
      }
    ]
  }
}
```

---

## VII. Configuration

This section contains the actual configuration values for your agent account.

### Agent Configuration

| Parameter | Value |
|-----------|-------|
| **Agent ID** | `898ecdd8-5891-4ec6-8c50-096ee2ef850a` |
| **API Host** | `https://ca-api.cateleca.com/api/crypto` |
| **API Mode** | Seamless |
| **Domain** | `https://cateleca.com/` |
| **Secret Key** | (Hidden - View in dashboard) |
| **RSA Public Key** | (Download from dashboard) |

### Notes

- **API Mode: Seamless** - This agent is configured for Seamless Wallet Mode, which means WCLASSGAMES will call your callback endpoints when players make transactions.
- **Secret Key** - Click the eye icon in the dashboard to reveal the secret key. Keep this confidential.
- **RSA Public Key** - Download from the dashboard to verify callback signatures from WCLASSGAMES.

---

© 2025 WCLASSGAMES - All Rights Reserved
*Last Updated: October, 2025*
