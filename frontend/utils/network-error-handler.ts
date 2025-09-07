import { toast } from 'sonner';
import { Chain } from 'viem';

/**
 * Network error types for better error categorization
 */
export enum NetworkErrorType {
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  NETWORK_SWITCH_FAILED = 'NETWORK_SWITCH_FAILED',
  CONTRACT_ADDRESS_NOT_FOUND = 'CONTRACT_ADDRESS_NOT_FOUND',
  RPC_CONNECTION_FAILED = 'RPC_CONNECTION_FAILED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  CHAIN_MISMATCH = 'CHAIN_MISMATCH',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Network error interface
 */
export interface NetworkError {
  type: NetworkErrorType;
  message: string;
  chainId?: number;
  expectedChainId?: number;
  originalError?: Error;
}

/**
 * User-friendly error messages for different network error types
 */
const ERROR_MESSAGES: Record<NetworkErrorType, string> = {
  [NetworkErrorType.UNSUPPORTED_NETWORK]: 'This network is not supported. Please switch to a supported network.',
  [NetworkErrorType.NETWORK_SWITCH_FAILED]: 'Failed to switch networks. Please try again or switch manually in your wallet.',
  [NetworkErrorType.CONTRACT_ADDRESS_NOT_FOUND]: 'Contract addresses not available for this network. Please check your network configuration.',
  [NetworkErrorType.RPC_CONNECTION_FAILED]: 'Unable to connect to the network. Please check your internet connection and try again.',
  [NetworkErrorType.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
  [NetworkErrorType.CHAIN_MISMATCH]: 'Your wallet is connected to a different network. Please switch to the correct network.',
  [NetworkErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

/**
 * Creates a standardized network error
 */
export function createNetworkError(
  type: NetworkErrorType,
  customMessage?: string,
  chainId?: number,
  expectedChainId?: number,
  originalError?: Error
): NetworkError {
  return {
    type,
    message: customMessage || ERROR_MESSAGES[type],
    chainId,
    expectedChainId,
    originalError
  };
}

/**
 * Handles network errors with appropriate user feedback
 */
export function handleNetworkError(error: NetworkError | Error | unknown): void {
  let networkError: NetworkError;

  if (error instanceof Error) {
    // Try to categorize common error types
    if (error.message.includes('User rejected')) {
      networkError = createNetworkError(
        NetworkErrorType.NETWORK_SWITCH_FAILED,
        'Network switch was cancelled by user.',
        undefined,
        undefined,
        error
      );
    } else if (error.message.includes('Unsupported chain')) {
      networkError = createNetworkError(
        NetworkErrorType.UNSUPPORTED_NETWORK,
        undefined,
        undefined,
        undefined,
        error
      );
    } else {
      networkError = createNetworkError(
        NetworkErrorType.UNKNOWN_ERROR,
        error.message,
        undefined,
        undefined,
        error
      );
    }
  } else if (isNetworkError(error)) {
    networkError = error;
  } else {
    networkError = createNetworkError(
      NetworkErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred'
    );
  }

  // Show user-friendly toast notification
  toast.error(networkError.message, {
    description: getErrorDescription(networkError),
    duration: 5000
  });

  // Log detailed error for debugging
  console.error('Network Error:', {
    type: networkError.type,
    message: networkError.message,
    chainId: networkError.chainId,
    expectedChainId: networkError.expectedChainId,
    originalError: networkError.originalError
  });
}

/**
 * Type guard to check if an error is a NetworkError
 */
function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    Object.values(NetworkErrorType).includes((error as NetworkError).type)
  );
}

/**
 * Gets additional description for error types
 */
function getErrorDescription(error: NetworkError): string | undefined {
  switch (error.type) {
    case NetworkErrorType.CHAIN_MISMATCH:
      if (error.chainId && error.expectedChainId) {
        return `Connected to chain ${error.chainId}, expected ${error.expectedChainId}`;
      }
      break;
    case NetworkErrorType.UNSUPPORTED_NETWORK:
      if (error.chainId) {
        return `Chain ID: ${error.chainId}`;
      }
      break;
    case NetworkErrorType.RPC_CONNECTION_FAILED:
      return 'Check your internet connection and wallet settings';
    case NetworkErrorType.WALLET_NOT_CONNECTED:
      return 'Click the connect button to link your wallet';
    default:
      return undefined;
  }
}

/**
 * Validates if a chain is supported
 */
export function validateSupportedChain(chainId: number, supportedChains: Chain[]): boolean {
  return supportedChains.some(chain => chain.id === chainId);
}

/**
 * Creates a chain mismatch error
 */
export function createChainMismatchError(
  currentChainId: number,
  expectedChainId: number
): NetworkError {
  return createNetworkError(
    NetworkErrorType.CHAIN_MISMATCH,
    `Please switch to the correct network`,
    currentChainId,
    expectedChainId
  );
}

/**
 * Creates an unsupported network error
 */
export function createUnsupportedNetworkError(chainId: number): NetworkError {
  return createNetworkError(
    NetworkErrorType.UNSUPPORTED_NETWORK,
    `Network with chain ID ${chainId} is not supported`,
    chainId
  );
}

/**
 * Creates a contract address not found error
 */
export function createContractAddressError(environment: string): NetworkError {
  return createNetworkError(
    NetworkErrorType.CONTRACT_ADDRESS_NOT_FOUND,
    `Contract addresses not available for ${environment} environment`
  );
}

/**
 * Retry mechanism for network operations
 */
export async function retryNetworkOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

/**
 * Safe network operation wrapper
 */
export async function safeNetworkOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    handleNetworkError(error);
    return fallback;
  }
}