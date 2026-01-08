/**
 * Authentication utilities for WCLASSGAMES API
 *
 * Signature calculation uses SHA512 hash of "agentId:agentSecret"
 * encoded as Base64 with "Basic " prefix.
 */

import { createHash } from 'crypto';

/**
 * Generate signature for API authentication
 *
 * According to the API docs (Section 2.2):
 * 1. Input text: "agentId:agentSecret"
 * 2. Use SHA512 hash algorithm
 * 3. Encode result as Base64
 * 4. Prefix with "Basic "
 *
 * @param agentId - The agent identifier
 * @param agentSecret - The agent secret key
 * @returns The signature string with "Basic " prefix
 */
export function generateSignature(agentId: string, agentSecret: string): string {
  const inputText = `${agentId}:${agentSecret}`;

  // Create SHA512 hash
  const hash = createHash('sha512');
  hash.update(inputText);
  const hashHex = hash.digest('hex');

  // Encode as Base64
  const base64Signature = Buffer.from(hashHex).toString('base64');

  return `Basic ${base64Signature}`;
}

/**
 * Create authentication headers for WCLASSGAMES API requests
 *
 * @param agentId - The agent identifier
 * @param signature - The generated signature
 * @param userToken - Optional JWT bearer token for user-specific requests
 * @returns Headers object for fetch requests
 */
export function createAuthHeaders(
  agentId: string,
  signature: string,
  userToken?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Agent-Id': agentId,
    'X-Agent-Signature': signature,
  };

  if (userToken) {
    // Add Bearer prefix if not present
    const token = userToken.startsWith('Bearer ') ? userToken : `Bearer ${userToken}`;
    headers['Authorization'] = token;
  }

  return headers;
}

/**
 * Verify callback signature from WCLASSGAMES
 *
 * This is used for Seamless Wallet callback verification.
 * The signature is in the 'X-Cg-Signature' header.
 *
 * @param publicKey - The RSA public key from WCLASSGAMES
 * @param requestBody - The request body as string
 * @param signature - The signature from X-Cg-Signature header
 * @returns true if signature is valid
 */
export function verifyCallbackSignature(
  publicKey: string,
  requestBody: string,
  signature: string
): boolean {
  const { createVerify } = require('crypto');

  try {
    const verifier = createVerify('RSA-SHA512');
    verifier.update(requestBody);
    verifier.end();

    return verifier.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}
