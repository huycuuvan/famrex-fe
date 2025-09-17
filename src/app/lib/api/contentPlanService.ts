import { 
    ContentPlanItem, 
    CreateContentPlanItemRequest, 
    UpdateContentPlanItemRequest,
  } from '../types/content-plan.types';

  import { ContentPlanQueryParams, PaginatedApiResponse, ApiResponse } from '../types/common.types';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://superbai.io/api';
  
  class ContentPlanService {
    private getAuthHeaders(): HeadersInit {
      const token = localStorage.getItem('famarex_token');
      console.log('Token from localStorage:', token);
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
  
    private async handleResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  
    // Get all content plans with optional filters
    async getContentPlans(params?: ContentPlanQueryParams): Promise<PaginatedApiResponse<ContentPlanItem>> {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.channel_type) queryParams.append('channel_type', params.channel_type);
      if (params?.product) queryParams.append('product', params.product);
      if (params?.target_customer) queryParams.append('target_customer', params.target_customer);
  
      const url = `${API_BASE_URL}/content-plans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
  
      return this.handleResponse<PaginatedApiResponse<ContentPlanItem>>(response);
    }
  
    // Get content plan by ID
    async getContentPlanById(id: string): Promise<ApiResponse<ContentPlanItem>> {
      const response = await fetch(`${API_BASE_URL}/content-plans/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
  
      return this.handleResponse<ApiResponse<ContentPlanItem>>(response);
    }
  
    // Create new content plan
    async createContentPlan(data: CreateContentPlanItemRequest): Promise<ApiResponse<ContentPlanItem>> {
      const response = await fetch(`${API_BASE_URL}/content-plans`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
  
      return this.handleResponse<ApiResponse<ContentPlanItem>>(response);
    }
  
    // Update content plan
    async updateContentPlan(id: string, data: UpdateContentPlanItemRequest): Promise<ApiResponse<ContentPlanItem>> {
      const response = await fetch(`${API_BASE_URL}/content-plans/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
  
      return this.handleResponse<ApiResponse<ContentPlanItem>>(response);
    }
  
    // Delete content plan
    async deleteContentPlan(id: string): Promise<ApiResponse<null>> {
      const response = await fetch(`${API_BASE_URL}/content-plans/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
  
      return this.handleResponse<ApiResponse<null>>(response);
    }
  
    // Admin endpoints
    async getContentPlansByStatus(status: string, params?: { limit?: number; offset?: number }): Promise<PaginatedApiResponse<ContentPlanItem>> {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
  
      const url = `${API_BASE_URL}/api/admin/content-plans/status/${status}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
  
      return this.handleResponse<PaginatedApiResponse<ContentPlanItem>>(response);
    }
  
    async getScheduledContentPlans(limit?: number): Promise<PaginatedApiResponse<ContentPlanItem[]>> {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());
  
      const url = `${API_BASE_URL}/api/admin/content-plans/scheduled${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
  
      return this.handleResponse<PaginatedApiResponse<ContentPlanItem[]>>(response);
    }
  
    async markAsPublished(id: string, publishPostId: string): Promise<ApiResponse<null>> {
      const response = await fetch(`${API_BASE_URL}/api/admin/content-plans/${id}/publish`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ publish_post_id: publishPostId })
      });
  
      return this.handleResponse<ApiResponse<null>>(response);
    }
  }
  
  export const contentPlanService = new ContentPlanService();
  export default contentPlanService;