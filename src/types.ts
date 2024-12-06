export interface Dimensions {
  width: number;
  height: number;
}

export type MediaType = 'video' | 'gif';
export type AdStatus = 'processing' | 'complete' | 'failed';

export interface GenerateAdRequest {
  prompt: string;
  mediaType: MediaType;
  dimensions: Dimensions;
}

export interface GenerateAdResponse {
  id: string;
  status: AdStatus;
  dimensions: Dimensions;
}

export interface Ad {
  id: string;
  status: AdStatus;
  prompt: string;
  mediaUrl?: string;
  voiceUrl?: string;
  componentCode?: string;
  dimensions: Dimensions;
  error?: string;
  createdAt?: string;
}

export interface ListAdsResponse {
  ads: Ad[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DynamicAdsConfig {
  apiKey: string;
  baseUrl?: string;
  maxPollingAttempts?: number;
  pollingInterval?: number;
}
