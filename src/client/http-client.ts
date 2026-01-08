/**
 * HTTP Client for WCLASSGAMES API
 */

import { Config } from '../config/index.js';
import { generateSignature, createAuthHeaders } from '../utils/auth.js';
import {
  ApiResponse,
  AgentBalanceData,
  LaunchGameData,
  PlayerBalanceData,
  DepositData,
  WithdrawData,
  TransferHistoryData,
  TransactionData,
  TransactionsData,
  PaginationParams,
} from '../types/api.js';

export class WclassGamesClient {
  private config: Config;
  private signature: string;

  constructor(config: Config) {
    this.config = config;
    this.signature = generateSignature(config.agentId, config.agentSecret);
  }

  /**
   * Make an authenticated GET request
   */
  private async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    userToken?: string
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.config.apiHost}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = createAuthHeaders(this.config.agentId, this.signature, userToken);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  /**
   * Make an authenticated POST request
   */
  private async post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    userToken?: string
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.apiHost}${endpoint}`;
    const headers = createAuthHeaders(this.config.agentId, this.signature, userToken);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  // ============================================================================
  // Integration API
  // ============================================================================

  /**
   * Get the current agent balance
   * Endpoint: GET /cashier/agent-balance
   */
  async getAgentBalance(): Promise<ApiResponse<AgentBalanceData>> {
    return this.get<AgentBalanceData>('/cashier/agent-balance');
  }

  /**
   * Launch a game and get the game URL
   * Endpoint: POST /auth/join
   */
  async launchGame(userToken: string): Promise<ApiResponse<LaunchGameData>> {
    return this.post<LaunchGameData>('/auth/join', undefined, userToken);
  }

  // ============================================================================
  // Balance Transfer API
  // ============================================================================

  /**
   * Get the current balance of a player
   * Endpoint: GET /cashier/balance
   */
  async getPlayerBalance(userToken: string): Promise<ApiResponse<PlayerBalanceData>> {
    return this.get<PlayerBalanceData>('/cashier/balance', undefined, userToken);
  }

  /**
   * Deposit funds into a player's balance
   * Endpoint: POST /cashier/deposit
   */
  async deposit(userToken: string, amount: number): Promise<ApiResponse<DepositData>> {
    return this.post<DepositData>('/cashier/deposit', { amount }, userToken);
  }

  /**
   * Withdraw funds from a player's balance
   * Endpoint: POST /cashier/withdraw
   */
  async withdraw(userToken: string, amount: number): Promise<ApiResponse<WithdrawData>> {
    return this.post<WithdrawData>('/cashier/withdraw', { amount }, userToken);
  }

  /**
   * Get transfer history (deposits/withdrawals)
   * Endpoint: GET /cashier/history
   */
  async getTransferHistory(params?: PaginationParams): Promise<ApiResponse<TransferHistoryData>> {
    return this.get<TransferHistoryData>('/cashier/history', params as Record<string, string | number | undefined>);
  }

  // ============================================================================
  // Data Feed API
  // ============================================================================

  /**
   * Get a specific transaction by ID
   * Endpoint: GET /trade/transaction
   */
  async getTransaction(transactionId: string): Promise<ApiResponse<TransactionData>> {
    return this.get<TransactionData>('/trade/transaction', { id: transactionId });
  }

  /**
   * Get a list of transactions
   * Endpoint: GET /trade/transactions
   */
  async getTransactions(params?: PaginationParams): Promise<ApiResponse<TransactionsData>> {
    return this.get<TransactionsData>('/trade/transactions', params as Record<string, string | number | undefined>);
  }
}
