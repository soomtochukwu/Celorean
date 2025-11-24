declare module 'react-tiny-link' {
  import { FC } from 'react';

  export interface ReactTinyLinkProps {
    cardSize?: 'small' | 'large';
    showGraphic?: boolean;
    maxLine?: number;
    minLine?: number;
    url: string;
    proxyUrl?: string;
    header?: string;
    description?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    loadSecureUrl?: boolean;
    defaultMedia?: string;
    width?: string;
    requestHeaders?: Record<string, string>;
  }

  export const ReactTinyLink: FC<ReactTinyLinkProps>;
}
