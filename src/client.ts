import axios, { AxiosInstance } from 'axios';
import {
  DynamicAdsConfig,
  GenerateAdRequest,
  GenerateAdResponse,
  Ad,
  ListAdsResponse,
} from './types';

export class DynamicAdsClient {
  private readonly client: AxiosInstance;
  private readonly maxPollingAttempts: number;
  private readonly pollingInterval: number;

  constructor(config: DynamicAdsConfig) {
    const baseURL = config.baseUrl || 'http://localhost:4567/api/frontend';
    this.maxPollingAttempts = config.maxPollingAttempts || 60;
    this.pollingInterval = config.pollingInterval || 2000;

    this.client = axios.create({
      baseURL,
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate a new ad based on the provided prompt and options
   */
  async generate(request: GenerateAdRequest): Promise<GenerateAdResponse> {
    const response = await this.client.post<GenerateAdResponse>('/generate', request);
    return response.data;
  }

  /**
   * Get the current status and details of an ad
   */
  async getAd(id: string): Promise<Ad> {
    const response = await this.client.get<Ad>(`/ads/${id}`);
    return response.data;
  }

  /**
   * List previously generated ads with pagination
   */
  async listAds(page: number = 1, limit: number = 10): Promise<ListAdsResponse> {
    const response = await this.client.get<ListAdsResponse>('/ads', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Wait for an ad to complete generation
   */
  async waitForCompletion(id: string): Promise<Ad> {
    for (let attempt = 0; attempt < this.maxPollingAttempts; attempt++) {
      const ad = await this.getAd(id);
      
      if (ad.status === 'complete') {
        return ad;
      }
      
      if (ad.status === 'failed') {
        throw new Error(`Ad generation failed: ${ad.error || 'Unknown error'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    }
    
    throw new Error('Timeout waiting for ad generation');
  }

  /**
   * Generate an ad and wait for it to complete
   */
  async generateAndWait(request: GenerateAdRequest): Promise<Ad> {
    const { id } = await this.generate(request);
    return this.waitForCompletion(id);
  }
}
