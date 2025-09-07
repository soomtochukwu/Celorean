import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { defineChain } from 'viem';
import { toast } from 'sonner';
import {
  getAddressesForEnvironment,
  getCurrentEnvironmentAddresses,
  type ContractAddresses,
  networkConfigs,
  type NetworkConfig
} from '@/contracts';

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
      // Default to localhost for unknown networks in development, testnet otherwise
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
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }));
      toast.error('Please connect your wallet first');
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
      toast.success(`Switched to ${env} network`);
    } catch (error: any) {
      const errorMessage = error?.message || `Failed to switch to ${env} network`;
      setState(prev => ({ ...prev, error: errorMessage, isSwitching: false }));
      toast.error(errorMessage);
    }
  }, [isConnected, chainId, switchChain]);

  // Refresh addresses for current environment
  const refreshAddresses = useCallback(() => {
    const currentEnv = detectEnvironmentFromChainId(chainId);
    const addresses = getAddressesForEnvironment(currentEnv);
    setState(prev => ({
      ...prev,
      currentEnvironment: currentEnv,
      currentAddresses: addresses,
      currentNetworkConfig: getNetworkConfigForEnvironment(currentEnv),
    }));
  }, [chainId]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Handle chain changes
  useEffect(() => {
    const newEnvironment = detectEnvironmentFromChainId(chainId);
    const newAddresses = getAddressesForEnvironment(newEnvironment);
    const newNetworkConfig = getNetworkConfigForEnvironment(newEnvironment);
    
    // Check if we have addresses for this environment
    const isCorrectNetwork = !!newAddresses;
    
    setState(prev => ({
      ...prev,
      currentEnvironment: newEnvironment,
      currentChainId: chainId as SupportedChainId,
      currentAddresses: newAddresses,
      currentNetworkConfig: newNetworkConfig,
      isCorrectNetwork,
      isSwitching: false,
      error: isCorrectNetwork ? null : `No contract addresses found for ${newEnvironment} network`,
    }));

    // Show warning if no addresses found
    if (!isCorrectNetwork && isConnected) {
      toast.warning(`No contract deployed on ${newEnvironment} network`);
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