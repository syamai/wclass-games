/**
 * WCLASSGAMES API Type Definitions
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T> {
  result: boolean;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  startTime?: string;
  endTime?: string;
  userId?: string;
}

export interface Pageable {
  totalElement: number;
  currentElement: number;
  totalPage: number;
  page: number;
  size: number;
  hasNext: boolean;
}

// ============================================================================
// Integration API Types
// ============================================================================

export interface AgentBalanceData {
  balance: number;
}

export interface LaunchGameData {
  joinToken: string;
  userId: number;
  agentId: string;
  launchUrl: string;
  createdAt: number;
  expiredAt: number;
}

// ============================================================================
// Balance Transfer API Types
// ============================================================================

export interface PlayerBalanceData {
  balance: string;
  agentBalance?: string;
}

export interface DepositRequest {
  amount: number;
}

export interface DepositData {
  amount: number;
  before: number;
  after: number;
}

export interface WithdrawRequest {
  amount: number;
}

export interface WithdrawData {
  amount: number;
  before: number;
  after: number;
}

export interface TransferHistoryItem {
  id: number;
  userId: string;
  userName: string;
  type: 'Deposit' | 'Withdraw';
  changed: string;
  available: string;
  note: string;
  transactionId: string;
  createdAt: string;
}

export interface TransferHistoryData {
  items: TransferHistoryItem[];
  pageable: Pageable;
}

// ============================================================================
// Data Feed API Types
// ============================================================================

export interface GameDetails {
  id: string;
  tradeAmount: string;
  gameCoin: string;
  status: 'Opened' | 'Closed';
  pnl: string;
  result: 'Win' | 'Lose';
}

export interface TransactionItem {
  id: number;
  userId: string;
  userName: string;
  type: 'OpenPosition' | 'ClosePosition';
  changed: string;
  available: string;
  note: string;
  refId: string;
  asset: string;
  createdAt: string;
  gameType: string;
  gameDetails: GameDetails;
}

export interface TransactionData {
  transaction: TransactionItem;
}

export interface TransactionsData {
  items: TransactionItem[];
  pageable?: Pageable;
}

// ============================================================================
// Error Types
// ============================================================================

export type ApiErrorCode =
  | 'OK'
  | 'Unauthorized'
  | 'AgentNotFound'
  | 'InvalidAgentSignature'
  | 'AgentUserUnauthorized'
  | 'InsufficientAgentBalance'
  | 'InsufficientBalance'
  | 'InternalServerError';

export interface ApiError {
  result: false;
  message: string;
  code?: ApiErrorCode;
}

// ============================================================================
// Seamless Wallet Callback Types (for reference)
// ============================================================================

export interface BalanceCallbackRequest {
  userId: string;
}

export interface TransactionCallbackRequest {
  userId: string;
  timestamp: number;
  nonce: string;
  data: {
    change_amount: string;
    data: {
      type: 'Futures';
      status: 'Opened' | 'Closed';
      user: {
        id: string;
        name: string;
        email: string;
      };
      position: {
        id?: string;
        symbol: string;
        side: 'Long' | 'Short';
        trade_amount: number | string;
        entry_price: number | string;
        exit_price?: number;
        bust_price?: string;
        multiplier: number;
        status: 'Opened' | 'Closed';
        sub_status?: string;
        take_profit?: number | null;
        stop_loss?: number | null;
        open_fee?: string;
        close_fee?: string;
        entry_time?: number;
        pnl?: string;
        roi?: string;
        outcome?: string;
        result?: 'Win' | 'Lose';
      };
    };
  };
}

export interface TransactionCallbackResponse {
  result: boolean;
  message: string;
  data: {
    balanceBefore: number;
    changed: number;
    balanceAfter: number;
  };
}
