'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import useNetworkManager, {
  type NetworkState,
  type NetworkActions,
  type NetworkEnvironment,
  getEnvironmentDisplayName
} from '@/hooks/useNetworkManager';
import { 
  handleNetworkError, 
  createContractAddressError, 
  createUnsupportedNetworkError,
  NetworkErrorType
} from '@/utils/network-error-handler';

// Context type
type NetworkContextType = (NetworkState & NetworkActions) | null;

// Create context
const NetworkContext = createContext<NetworkContextType>(null);

// Provider props
interface NetworkProviderProps {
  children: ReactNode;
  enableAutoSwitching?: boolean;
  preferredEnvironment?: NetworkEnvironment;
  showNetworkToasts?: boolean;
}

// Provider component
export function NetworkProvider({
  children,
  enableAutoSwitching = false,
  preferredEnvironment,
  showNetworkToasts = true
}: NetworkProviderProps) {
  const networkManager = useNetworkManager();
  const {
    currentEnvironment,
    currentAddresses,
    isConnected,
    isCorrectNetwork,
    error,
    switchToEnvironment,
    clearError
  } = networkManager;

  // Handle automatic network switching
  useEffect(() => {
    if (!enableAutoSwitching || !preferredEnvironment || !isConnected) {
      return;
    }

    if (currentEnvironment !== preferredEnvironment) {
      const timer = setTimeout(() => {
        if (showNetworkToasts) {
          toast.info(
            `Switching to ${getEnvironmentDisplayName(preferredEnvironment)}...`,
            {
              duration: 3000,
            }
          );
        }
        switchToEnvironment(preferredEnvironment);
      }, 1000); // Small delay to avoid immediate switching

      return () => clearTimeout(timer);
    }
  }, [currentEnvironment, preferredEnvironment, isConnected, enableAutoSwitching, switchToEnvironment, showNetworkToasts]);

  // Handle network errors
  useEffect(() => {
    if (error && showNetworkToasts) {
      toast.error(error, {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: clearError,
        },
      });
    }
  }, [error, showNetworkToasts, clearError]);

  // Show network status notifications
  useEffect(() => {
    if (!isConnected || !showNetworkToasts) return;

    if (!isCorrectNetwork && !currentAddresses) {
      toast.warning(
        `No contracts deployed on ${getEnvironmentDisplayName(currentEnvironment)}`,
        {
          duration: 5000,
          description: 'Please switch to a supported network or deploy contracts first.',
        }
      );
    }
  }, [isConnected, isCorrectNetwork, currentAddresses, currentEnvironment, showNetworkToasts]);

  return (
    <NetworkContext.Provider value={networkManager}>
      {children}
    </NetworkContext.Provider>
  );
}

// Hook to use network context
export function useNetwork(): NetworkState & NetworkActions {
  const context = useContext(NetworkContext);
  
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  
  return context;
}

// Hook to get current network addresses with error handling
export function useNetworkAddresses() {
  const { currentAddresses, currentEnvironment, isCorrectNetwork } = useNetwork();
  
  if (!isCorrectNetwork || !currentAddresses) {
    const error = createContractAddressError(currentEnvironment || 'unknown');
    handleNetworkError(error);
    throw new Error(
      `No contract addresses available for ${currentEnvironment} network. ` +
      'Please ensure contracts are deployed or switch to a supported network.'
    );
  }
  
  return currentAddresses;
}

// Hook to get current network config
export function useNetworkConfig() {
  const { currentNetworkConfig } = useNetwork();
  return currentNetworkConfig;
}

// Hook for network switching with confirmation
export function useNetworkSwitcher() {
  const { switchToEnvironment, isSwitching, currentEnvironment } = useNetwork();
  
  const switchWithConfirmation = async (targetEnv: NetworkEnvironment) => {
    if (currentEnvironment === targetEnv) {
      toast.info(`Already connected to ${getEnvironmentDisplayName(targetEnv)}`);
      return;
    }
    
    const confirmed = window.confirm(
      `Switch to ${getEnvironmentDisplayName(targetEnv)}?\n\n` +
      'This will change your wallet network and may require confirmation.'
    );
    
    if (confirmed) {
      try {
        await switchToEnvironment(targetEnv);
        toast.success(`Switched to ${getEnvironmentDisplayName(targetEnv)} network`);
      } catch (error) {
        handleNetworkError(error);
      }
    }
  };
  
  return {
    switchWithConfirmation,
    switchToEnvironment,
    isSwitching,
    currentEnvironment
  };
}

// Hook to check if current network is supported
export function useNetworkSupport() {
  const { isCorrectNetwork, currentAddresses, currentEnvironment } = useNetwork();
  
  return {
    isSupported: isCorrectNetwork && !!currentAddresses,
    hasContracts: !!currentAddresses,
    environment: currentEnvironment,
    displayName: getEnvironmentDisplayName(currentEnvironment)
  };
}

// Export context for advanced usage
export { NetworkContext };
export default NetworkProvider;