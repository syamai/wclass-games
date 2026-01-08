/**
 * Integration Service for WCLASSGAMES API
 *
 * Handles game launching and agent balance operations.
 */

import { WclassGamesClient } from '../client/http-client.js';

export class IntegrationService {
  constructor(private client: WclassGamesClient) {}

  /**
   * Get the current agent balance
   */
  async getAgentBalance(): Promise<{
    success: boolean;
    balance?: number;
    error?: string;
  }> {
    try {
      const response = await this.client.getAgentBalance();

      if (response.result) {
        return {
          success: true,
          balance: response.data.balance,
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
   * Launch a game and get the game URL
   */
  async launchGame(userToken: string): Promise<{
    success: boolean;
    launchUrl?: string;
    joinToken?: string;
    userId?: number;
    expiresAt?: Date;
    error?: string;
  }> {
    try {
      if (!userToken) {
        return {
          success: false,
          error: 'User token is required',
        };
      }

      const response = await this.client.launchGame(userToken);

      if (response.result) {
        return {
          success: true,
          launchUrl: response.data.launchUrl,
          joinToken: response.data.joinToken,
          userId: response.data.userId,
          expiresAt: new Date(response.data.expiredAt),
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
