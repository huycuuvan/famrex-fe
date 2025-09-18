// file: services/AIService.ts

// Các type cho request/response của bạn
import { 
  SessionCreateRequest, 
  SessionCreateResponse,
  ChatRequest,
  ChatResponse,
  Agent,
  AgentsResponse
} from '../libs/types';

// Các hàm tiện ích để lấy token và thông tin user
import { 
  getAIServiceToken,
  UserInfo
} from '../libs/utils/aiUtils';
import {aiApiClient } from '../libs/utils/apiClient';
import { fetchEventSource } from '@microsoft/fetch-event-source';
// Import apiClient và các type liên quan từ file đã tạo


// Re-export Agent type để các component khác có thể sử dụng
export type { Agent };
const AI_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://aiapi.superbai.io/api/v1';
class AIService {
  private currentSession: string | null = null;
  private currentUser: UserInfo | null = null;

  // Set người dùng hiện tại để quản lý session
  public setCurrentUser(userId: string, username: string) {
    this.currentUser = { id: userId, name: username };
  }

  // Tạo một session mới với SuperbAI
  public async createSession(userId?: string, username?: string): Promise<SessionCreateResponse> {
    this.setCurrentUser(userId || '', username || '');

    const requestBody: SessionCreateRequest = {
      metadata: { additionalProp1: {} }
    };
    
    // 3. Gọi apiClient trực tiếp
    // Giả sử AI Service có cơ chế xác thực riêng và cần 1 token khác
    // Chúng ta sẽ truyền token này vào header một cách thủ công
    const aiToken = getAIServiceToken(this.currentUser);

    const sessionData = await aiApiClient<SessionCreateResponse>('/session/create', {
      method: 'POST',
      headers: {
        // Ghi đè header Authorization cho riêng service này nếu cần
        'Authorization': `Bearer ${aiToken}` 
      },
      body: JSON.stringify(requestBody),
    });

    this.currentSession = sessionData.session_id;
    console.log('Session created successfully:', sessionData);
    return sessionData;
  }

  // Lấy ID của session hiện tại
  public getCurrentSession(): string | null {
    return this.currentSession;
  }

  // Lấy tất cả các agent có sẵn
  public async getAgents(): Promise<AgentsResponse> { 
    return aiApiClient<AgentsResponse>('/agents/alls',{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAIServiceToken(this.currentUser)}`
      }
    });
  }

  // Lấy thông tin một agent cụ thể bằng ID
  public async getAgent(agentId: string): Promise<Agent | null> {
    try {
      const response = await this.getAgents();
      return response.agents.find(agent => agent.id === agentId) || null;
    } catch (error) {
      console.error('Failed to retrieve agent:', error);
      throw error;
    }
  }

  // Gửi tin nhắn chat đến AI
  public async sendMessage(
    request: ChatRequest,
    onChunk: (text: string) => void,
    onClose: () => void, // Thêm callback khi stream đóng
    onError: (error: Error) => void // Thêm callback khi có lỗi
  ): Promise<void> {
    if (!this.currentSession) {
      onError(new Error("Session not initialized"));
      return;
    }

    const aiToken = getAIServiceToken(this.currentUser);
    const url = `${AI_SERVICE_BASE_URL}/chat/${this.currentSession}`;
    
    const requestBody = {
      files: [],
      images: [],
      message: request.message,
      metadata: {},
    };

    await fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),

      // Hàm được gọi mỗi khi nhận được một sự kiện
      onmessage(event) {
        // Chỉ xử lý các sự kiện có tên 'message_chunk'
        if (event.event === 'message_chunk') {
          const chunkData = JSON.parse(event.data);
          if (chunkData.text) {
            onChunk(chunkData.text);
          }
        }
        // Có thể xử lý sự kiện 'stream_end' ở đây nếu muốn
        if (event.event === 'stream_end') {
          console.log('Stream ended by server.');
          onClose();
        }
      },

      // Hàm được gọi khi kết nối được mở
      async onopen(response) {
        if (response.ok) {
          console.log('Connection opened successfully.');
          return; // ok
        }
        // Nếu có lỗi ngay khi mở kết nối (ví dụ: 404, 500)
        throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
      },

      // Hàm được gọi khi stream đóng lại
      onclose() {
        console.log('Connection closed by browser or server.');
        onClose();
      },

      // Hàm được gọi khi có lỗi
      onerror(err) {
        console.error('EventSource error:', err);
        onError(err);
        // Ném lại lỗi để dừng vòng lặp retry mặc định của thư viện
        throw err;
      },
    });
  }
  // Lấy lịch sử chat của một agent
  public async getChatHistory(agentId: string = 'facebook_marketing_agent'): Promise<any> {
    return aiApiClient<any>(`/agents/${agentId}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAIServiceToken(this.currentUser)}`
      }
    });
  }

  // Reset session (dùng khi logout hoặc bắt đầu phiên làm việc mới)
  public resetSession() {
    this.currentSession = null;
    this.currentUser = null;
  }
}

// Xuất ra một instance duy nhất của AIService (Singleton Pattern)
export const aiService = new AIService();