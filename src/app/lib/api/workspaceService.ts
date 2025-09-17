// Workspace API service for Famarex
import { generateJWTToken, createSessionPayload } from '../utils/jwt';
import {
  Workspace,
  WorkspaceProfile,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceNotification,
  CreateWorkspaceRequest,
  UpdateWorkspaceProfileRequest,
  InviteMemberRequest,
  TransferOwnershipRequest,
  ScrapCompanyProfileRequest,
  ApiResponse,
  ApiError
} from '../types';

// API Base URL - should match your backend
const API_BASE_URL = 'https://superbai.io/api';

// Helper function to get auth headers with real user data
function getAuthHeaders(): HeadersInit {
  // Try to get existing token from localStorage first
  let token = localStorage.getItem('famarex_token');
  
  if (!token) {
    // If no token, try to get user data from localStorage to create one
    const userData = localStorage.getItem('famarex_user');
    const workspaceData = localStorage.getItem('famarex_workspace');
    
    if (userData) {
      const user = JSON.parse(userData);
      const workspace = workspaceData ? JSON.parse(workspaceData) : null;
      
      // Create session payload with real user data
      const payload = createSessionPayload(
        user.id || user.user_id || '',
        user.name || user.username || user.email || '',
        'facebook_marketing_agent',
        workspace?.id
      );
      
      token = generateJWTToken(payload);
      localStorage.setItem('famarex_token', token);
    } else {
      // Fallback to generate token with empty payload
      token = generateJWTToken(createSessionPayload('', ''));
    }
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
}

export const workspaceService = {
  // 1. CREATE WORKSPACE
  async createWorkspace(request: CreateWorkspaceRequest): Promise<ApiResponse<Workspace>> {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });
    
    return handleApiResponse<ApiResponse<Workspace>>(response);
  },

  // 2. GET USER'S WORKSPACES
  async getUserWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<Workspace[]>>(response);
  },

  // 3. GET MY WORKSPACES (Alternative endpoint)
  async getMyWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/my`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<Workspace[]>>(response);
  },

  // 4. GET ALL WORKSPACES (Super Admin Only)
  async getAllWorkspaces(): Promise<{ status: number; data: Workspace[] }> {
    const response = await fetch(`${API_BASE_URL}/workspaces/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<{ status: number; data: Workspace[] }>(response);
  },

  // 5. GET WORKSPACE BY ID
  async getWorkspaceById(workspaceId: string): Promise<ApiResponse<Workspace >> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<Workspace>>(response);
  },

  // 6. UPDATE WORKSPACE PROFILE
  async updateWorkspaceProfile(
    workspaceId: string, 
    request: UpdateWorkspaceProfileRequest
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });
    
    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  },

  // 7. SCRAP COMPANY PROFILE FROM URL
  async scrapCompanyProfile(
    workspaceId: string, 
    request: ScrapCompanyProfileRequest
  ): Promise<ApiResponse<WorkspaceProfile>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/profile/scrap-url`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });
    
    return handleApiResponse<ApiResponse<WorkspaceProfile>>(response);
  },

  // 8. GET WORKSPACE MEMBERS
  async getWorkspaceMembers(workspaceId: string): Promise<ApiResponse<WorkspaceMember[]>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<WorkspaceMember[]>>(response);
  },

  // 9. INVITE MEMBER TO WORKSPACE
  async inviteMember(
    workspaceId: string, 
    request: InviteMemberRequest
  ): Promise<{ status: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });
    
    return handleApiResponse<{ status: number; message: string }>(response);
  },

  // 10. REMOVE WORKSPACE MEMBER
  async removeMember(
    workspaceId: string, 
    userId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  },

  // 11. TRANSFER WORKSPACE OWNERSHIP
  async transferOwnership(
    workspaceId: string, 
    request: TransferOwnershipRequest
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/transfer-ownership`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });
    
    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  },

  // 12. GET MY INVITATIONS
  async getMyInvitations(): Promise<{ status: number; data: WorkspaceInvitation[] }> {
    const response = await fetch(`${API_BASE_URL}/workspaces/me/invitations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<{ status: number; data: WorkspaceInvitation[] }>(response);
  },

  // 13. ACCEPT INVITATION
  async acceptInvitation(invitationId: string): Promise<{ status: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/workspaces/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<{ status: number; message: string }>(response);
  },

  // 14. DECLINE INVITATION
  async declineInvitation(invitationId: string): Promise<{ status: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/workspaces/invitations/${invitationId}/decline`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<{ status: number; message: string }>(response);
  },

  // 15. GET NOTIFICATIONS
  async getNotifications(): Promise<ApiResponse<WorkspaceNotification[]>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/notifications`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<WorkspaceNotification[]>>(response);
  },

  // 16. MARK NOTIFICATION AS READ
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  },

  // 17. MARK ALL NOTIFICATIONS AS READ
  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/workspaces/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  }
};
