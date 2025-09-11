import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { defineChain } from 'viem';
import { toast } from 'sonner';
import {
  getAddressesForEnvironment,
  type ContractAddresses,
  networkConfigs,
  type NetworkConfig
} from '@/contracts';
import {
  handleNetworkError,
  createUnsupportedNetworkError,
  createContractAddressError,
  createNetworkError,
  NetworkErrorType,
} from '@/utils/network-error-handler';

// Define localhost chain
const localhost = defineChain({
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'http://localhost:8545' },
  },
});

// Network environment mapping
const CHAIN_ID_TO_ENVIRONMENT = {
  [localhost.id]: 'localhost' as const,
  [celoAlfajores.id]: 'testnet' as const,
  [celo.id]: 'mainnet' as const,
} as const;

const ENVIRONMENT_TO_CHAIN_ID = {
  localhost: localhost.id,
  testnet: celoAlfajores.id,
  mainnet: celo.id,
} as const;

export type NetworkEnvironment = 'localhost' | 'testnet' | 'mainnet';
export type SupportedChainId = typeof localhost.id | typeof celoAlfajores.id | typeof celo.id;

export interface NetworkState {
  currentEnvironment: NetworkEnvironment;
  currentChainId: SupportedChainId;
  currentAddresses: ContractAddresses | undefined;
  currentNetworkConfig: NetworkConfig;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isSwitching: boolean;
  error: string | null;
}

export interface NetworkActions {
  switchToEnvironment: (env: NetworkEnvironment) => Promise<void>;
  refreshAddresses: () => void;
  clearError: () => void;
  detectEnvironment: () => NetworkEnvironment;
}

export function useNetworkManager(): NetworkState & NetworkActions {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  
  const [state, setState] = useState<Omit<NetworkState, 'isConnected'>>(() => {
    const initialEnv = detectEnvironmentFromChainId(chainId);
    return {
      currentEnvironment: initialEnv,
      currentChainId: chainId as SupportedChainId,
      currentAddresses: getAddressesForEnvironment(initialEnv),
      currentNetworkConfig: getNetworkConfigForEnvironment(initialEnv),
      isCorrectNetwork: true,
      isSwitching: false,
      error: null,
    };
  });

  // Detect environment from chain ID
  function detectEnvironmentFromChainId(chainId: number): NetworkEnvironment {
    const env = CHAIN_ID_TO_ENVIRONMENT[chainId as SupportedChainId];
    if (!env) {
      // Unknown/unsupported chain
      return process.env.NODE_ENV === 'development' ? 'localhost' : 'testnet';
    }
    return env;
  }

  // Get network config for environment
  function getNetworkConfigForEnvironment(env: NetworkEnvironment): NetworkConfig {
    switch (env) {
      case 'localhost':
        return networkConfigs.localhost;
      case 'testnet':
        return networkConfigs['celo-alfajores'];
      case 'mainnet':
        return networkConfigs['celo-mainnet'];
      default:
        return networkConfigs.localhost;
    }
  }

  // Detect current environment
  const detectEnvironment = useCallback((): NetworkEnvironment => {
    return detectEnvironmentFromChainId(chainId);
  }, [chainId]);

  // Switch to specific environment
  const switchToEnvironment = useCallback(async (env: NetworkEnvironment) => {
    if (!isConnected) {
      const err = createNetworkError(NetworkErrorType.WALLET_NOT_CONNECTED);
      handleNetworkError(err);
      setState(prev => ({ ...prev, error: err.message }));
      return;
    }

    const targetChainId = ENVIRONMENT_TO_CHAIN_ID[env];
    if (chainId === targetChainId) {
      setState(prev => ({ ...prev, error: null }));
      return;
    }

    setState(prev => ({ ...prev, isSwitching: true, error: null }));

    try {
      await switchChain({ chainId: targetChainId });
      setState(prev => ({ ...prev, isSwitching: false }));
    } catch (error: any) {
      handleNetworkError(error);
      const errorMessage = (error?.message as string) || `Failed to switch to ${env} network`;
      setState(prev => ({ ...prev, error: errorMessage, isSwitching: false }));
    }
  }, [isConnected, chainId, switchChain]);

  // Refresh addresses for current environment
  const refreshAddresses = useCallback(() => {
    const currentEnv = detectEnvironmentFromChainId(chainId);
    const addresses = getAddressesForEnvironment(currentEnv);
    const hasContracts = !!addresses;

    setState(prev => ({
      ...prev,
      currentEnvironment: currentEnv,
      currentAddresses: addresses,
      currentNetworkConfig: getNetworkConfigForEnvironment(currentEnv),
      isCorrectNetwork: hasContracts,
      error: hasContracts ? null : `No contract addresses found for ${currentEnv} network`,
    }));

    if (!hasContracts && isConnected) {
      handleNetworkError(createContractAddressError(currentEnv));
    }
  }, [chainId, isConnected]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Handle chain changes
  useEffect(() => {
    const knownEnv = CHAIN_ID_TO_ENVIRONMENT[chainId as SupportedChainId];
    if (!knownEnv) {
      // Unsupported chain
      const err = createUnsupportedNetworkError(chainId);
      handleNetworkError(err);
      const fallbackEnv = detectEnvironmentFromChainId(chainId);
      setState(prev => ({
        ...prev,
        currentEnvironment: fallbackEnv,
        currentChainId: chainId as SupportedChainId,
        currentAddresses: undefined,
        currentNetworkConfig: getNetworkConfigForEnvironment(fallbackEnv),
        isCorrectNetwork: false,
        isSwitching: false,
        error: err.message,
      }));
      return;
    }

    const newEnvironment = knownEnv;
    const newAddresses = getAddressesForEnvironment(newEnvironment);
    const newNetworkConfig = getNetworkConfigForEnvironment(newEnvironment);
    
    const hasContracts = !!newAddresses;

    setState(prev => ({
      ...prev,
      currentEnvironment: newEnvironment,
      currentChainId: chainId as SupportedChainId,
      currentAddresses: newAddresses,
      currentNetworkConfig: newNetworkConfig,
      isCorrectNetwork: hasContracts,
      isSwitching: false,
      error: hasContracts ? null : `No contract addresses found for ${newEnvironment} network`,
    }));

    if (!hasContracts && isConnected) {
      handleNetworkError(createContractAddressError(newEnvironment));
    }
  }, [chainId, isConnected]);

  // Handle connection status changes
  useEffect(() => {
    if (!isConnected) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, [isConnected]);

  return {
    ...state,
    isConnected,
    isSwitching: state.isSwitching || isSwitchPending,
    switchToEnvironment,
    refreshAddresses,
    clearError,
    detectEnvironment,
  };
}

// Utility function to check if a chain ID is supported
export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return chainId in CHAIN_ID_TO_ENVIRONMENT;
}

// Utility function to get environment name for display
export function getEnvironmentDisplayName(env: NetworkEnvironment): string {
  switch (env) {
    case 'localhost':
      return 'Local Development';
    case 'testnet':
      return 'Celo Alfajores Testnet';
    case 'mainnet':
      return 'Celo Mainnet';
    default:
      return 'Unknown Network';
  }
}

// Utility function to get chain info
export function getChainInfo(chainId: SupportedChainId) {
  switch (chainId) {
    case localhost.id:
      return localhost;
    case celoAlfajores.id:
      return celoAlfajores;
    case celo.id:
      return celo;
    default:
      return localhost;
  }
}

export default useNetworkManager;