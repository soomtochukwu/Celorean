'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useNetwork,
  useNetworkSwitcher,
  useNetworkSupport
} from '@/contexts/NetworkContext';
import {
  getEnvironmentDisplayName,
  type NetworkEnvironment
} from '@/hooks/useNetworkManager';
import {
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Server,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkSwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  showStatus?: boolean;
  className?: string;
}

const NETWORK_ICONS = {
  localhost: Laptop,
  testnet: Server,
  mainnet: Globe,
} as const;

const NETWORK_COLORS = {
  localhost: 'bg-blue-500/10 text-blue-600 border-blue-200',
  testnet: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  mainnet: 'bg-green-500/10 text-green-600 border-green-200',
} as const;

export function NetworkSwitcher({
  variant = 'default',
  showStatus = true,
  className
}: NetworkSwitcherProps) {
  const {
    currentEnvironment,
    isConnected,
    isCorrectNetwork,
    currentAddresses,
    error
  } = useNetwork();
  
  const { switchWithConfirmation, isSwitching } = useNetworkSwitcher();
  const { isSupported, hasContracts, displayName } = useNetworkSupport();

  const environments: NetworkEnvironment[] = ['localhost', 'testnet', 'mainnet'];
  
  const getCurrentIcon = () => {
    const IconComponent = NETWORK_ICONS[currentEnvironment];
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-4 w-4 text-gray-400" />;
    if (isSwitching) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (isSupported && hasContracts) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Not Connected';
    if (isSwitching) return 'Switching...';
    if (error) return 'Network Error';
    if (isSupported && hasContracts) return 'Connected';
    return 'No Contracts';
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getCurrentIcon()}
        <span className="text-sm font-medium">{displayName}</span>
        {showStatus && getStatusIcon()}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
            disabled={isSwitching}
          >
            {getCurrentIcon()}
            <span className="hidden sm:inline">{currentEnvironment}</span>
            {showStatus && getStatusIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {environments.map((env) => {
            const IconComponent = NETWORK_ICONS[env];
            const isActive = env === currentEnvironment;
            
            return (
              <DropdownMenuItem
                key={env}
                onClick={() => !isActive && switchWithConfirmation(env)}
                className={cn(
                  'gap-2 cursor-pointer',
                  isActive && 'bg-accent'
                )}
                disabled={isActive || isSwitching}
              >
                <IconComponent className="h-4 w-4" />
                <span>{getEnvironmentDisplayName(env)}</span>
                {isActive && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getCurrentIcon()}
          <span className="font-medium">{displayName}</span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              NETWORK_COLORS[currentEnvironment]
            )}
          >
            {currentEnvironment}
          </Badge>
        </div>
        
        {showStatus && (
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className={cn(
              'font-medium',
              !isConnected && 'text-gray-400',
              error && 'text-red-500',
              isSupported && hasContracts && 'text-green-600'
            )}>
              {getStatusText()}
            </span>
          </div>
        )}
      </div>

      {/* Network Status Alert */}
      {isConnected && (!isSupported || !hasContracts) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {!hasContracts
              ? `No contracts deployed on ${displayName}. Please deploy contracts or switch networks.`
              : 'Network not fully supported. Some features may be unavailable.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Network Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {environments.map((env) => {
          const IconComponent = NETWORK_ICONS[env];
          const isActive = env === currentEnvironment;
          
          return (
            <Button
              key={env}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => !isActive && switchWithConfirmation(env)}
              disabled={isActive || isSwitching}
              className={cn(
                'gap-2 justify-start',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <IconComponent className="h-4 w-4" />
              <span className="truncate">{getEnvironmentDisplayName(env)}</span>
              {isActive && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
          );
        })}
      </div>

      {/* Connection Info */}
      {isConnected && currentAddresses && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Contract: {currentAddresses.proxyAddress.slice(0, 10)}...{currentAddresses.proxyAddress.slice(-8)}</div>
          <div>Deployed: {currentAddresses.deployedAtFormatted || 'Unknown'}</div>
        </div>
      )}
    </div>
  );
}

export default NetworkSwitcher;