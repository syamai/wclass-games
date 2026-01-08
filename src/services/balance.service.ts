/**
 * Balance Service for WCLASSGAMES API
 *
 * Handles player balance operations: balance inquiry, deposit, and withdrawal.
 */

import { WclassGamesClient } from '../client/http-client.js';
import { PaginationParams } from '../types/api.js';

export class BalanceService {
  constructor(private client: WclassGamesClient) {}

  /**
   * Get the current balance of a player
   */
  async getPlayerBalance(userToken: string): Promise<{
    success: boolean;
    balance?: string;
    agentBalance?: string;
    error?: string;
  }> {
    try {
      if (!userToken) {
        return {
          success: false,
          error: 'User token is required',
        };
      }

      const response = await this.client.getPlayerBalance(userToken);

      if (response.result) {
        return {
          success: true,
          balance: response.data.balance,
          agentBalance: response.data.agentBalance,
        };
      }

      return {
        success: false,
        error: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Deposit funds into a player's balance
   */
  async deposit(
    userToken: string,
    amount: number
  ): Promise<{
    success: boolean;
    amount?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    error?: string;
  }> {
    try {
      if (!userToken) {
        return {
          success: false,
          error: 'User token is required',
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
        };
      }

      const response = await this.client.deposit(userToken, amount);

      if (response.result) {
        return {
          success: true,
          amount: response.data.amount,
          balanceBefore: response.data.before,
          balanceAfter: response.data.after,
        };
      }

      return {
        success: false,
        error: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Withdraw funds from a player's balance
   */
  async withdraw(
    userToken: string,
    amount: number
  ): Promise<{
    success: boolean;
    amount?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    error?: string;
  }> {
    try {
      if (!userToken) {
        return {
          success: false,
          error: 'User token is required',
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
        };
      }

      const response = await this.client.withdraw(userToken, amount);

      if (response.result) {
        return {
          success: true,
          amount: response.data.amount,
          balanceBefore: response.data.before,
          balanceAfter: response.data.after,
        };
      }

      return {
        success: false,
        error: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get transfer history (deposits/withdrawals)
   */
  async getTransferHistory(params?: PaginationParams): Promise<{
    success: boolean;
    items?: Array<{
      id: number;
      userId: string;
      userName: string;
      type: string;
      changed: string;
      available: string;
      note: string;
      transactionId: string;
      createdAt: string;
    }>;
    pagination?: {
      totalElement: number;
      currentElement: number;
      totalPage: number;
      page: number;
      size: number;
      hasNext: boolean;
    };
    error?: string;
  }> {
    try {
      const response = await this.client.getTransferHistory(params);

      if (response.result) {
        return {
          success: true,
          items: response.data.items,
          pagination: response.data.pageable,
        };
      }

      return {
        success: false,
        error: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
