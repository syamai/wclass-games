/**
 * Data Feed Service for WCLASSGAMES API
 *
 * Handles transaction data retrieval.
 */

import { WclassGamesClient } from '../client/http-client.js';
import { PaginationParams, TransactionItem } from '../types/api.js';

export class DataFeedService {
  constructor(private client: WclassGamesClient) {}

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(transactionId: string): Promise<{
    success: boolean;
    transaction?: TransactionItem;
    error?: string;
  }> {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: 'Transaction ID is required',
        };
      }

      const response = await this.client.getTransaction(transactionId);

      if (response.result) {
        return {
          success: true,
          transaction: response.data.transaction,
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
   * Get a list of transactions
   */
  async getTransactions(params?: PaginationParams): Promise<{
    success: boolean;
    items?: TransactionItem[];
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
      const response = await this.client.getTransactions(params);

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
