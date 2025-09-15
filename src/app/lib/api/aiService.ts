// AI Service API - Handles communication with AI backend
import { 
  generateJWTToken, 
  createSessionPayload, 
  generateUserId,
  JWTPayload,
  SessionCreateRequest,
  SessionCreateResponse
} from '../utils/jwt';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId: string;
  agentId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  suggestions?: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
}

export interface AgentsResponse {
  agents: Agent[];
  total_count: number;
}

export interface CampaignAnalysis {
  campaignId: string;
  performance: {
    reach: number;
    engagement: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  recommendations: string[];
  optimizations: {
    audience: string[];
    budget: string[];
    creative: string[];
  };
}

class AIService {
  private baseURL: string;
  private apiKey: string;
  private currentSession: string | null = null;
  private currentUser: { id: string; name: string } | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://aiapi.superbai.io/api/v1';
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || '';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async makeAuthenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.currentUser) {
      throw new Error('User not authenticated. Please create a session first.');
    }

    // Generate JWT token for authentication
    const payload = createSessionPayload(
      this.currentUser.id,
      this.currentUser.name,
      'facebook_marketing_agent'
    );
    const jwtToken = generateJWTToken(payload);

    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Set current user for session management
  setCurrentUser(userId: string, username: string) {
    this.currentUser = { id: userId, name: username };
  }

  // Create a new session with SuperbAI
  async createSession(userId?: string, username?: string): Promise<SessionCreateResponse> {
    try {
      // Use provided user info or generate if not available
      const actualUserId = userId || generateUserId();
      const actualUsername = username || 'Famarex User';
      
      this.setCurrentUser(actualUserId, actualUsername);

      // Generate JWT payload using fixed values that work
      const payload = createSessionPayload(
        actualUserId,
        actualUsername,
        'facebook_marketing_agent'
      );

      const jwtToken = generateJWTToken(payload);

      const requestBody: SessionCreateRequest = {
        metadata: {
          additionalProp1: {}
        }
      };

      const response = await fetch(`${this.baseURL}/session/create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Session creation failed:', response.status, errorText);
        throw new Error(`Session creation failed: ${response.status} ${response.statusText}`);
      }

      const sessionData = await response.json() as SessionCreateResponse;
      this.currentSession = sessionData.session_id;
      
      console.log('Session created successfully:', sessionData);
      return sessionData;
    } catch (error) {
      console.error('Session creation failed:', error);
      throw error;
    }
  }

  // Get current session ID
  getCurrentSession(): string | null {
    return this.currentSession;
  }

  // Get all available agents
  async getAgents(): Promise<AgentsResponse> {
    try {
      return await this.makeRequest<AgentsResponse>('/agents/alls', {
        method: 'GET',
      });
    } catch (error) {
      console.error('Failed to retrieve agents:', error);
      throw error;
    }
  }

  // Get specific agent by ID
  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      const response = await this.getAgents();
      return response.agents.find(agent => agent.id === agentId) || null;
    } catch (error) {
      console.error('Failed to retrieve agent:', error);
      throw error;
    }
  }

  // Send chat message to AI
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Ensure we have a session
    if (!this.currentSession) {
      await this.createSession(request.userId, 'Famarex User');
    }

    // Use the exact format from working curl command
    const requestBody = {
      files: [],
      images: [],
      message: request.message,
      metadata: {}
    };

    console.log('Sending chat request:', {
      url: `${this.baseURL}/chat`,
      body: requestBody,
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${generateJWTToken({} as JWTPayload)}`,
        'Content-Type': 'application/json',
      }
    });

    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${generateJWTToken({} as JWTPayload)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Chat response status:', response.status);
    console.log('Chat response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat request failed:', response.status, errorText);
      throw new Error(`Chat request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let chatData;
    try {
      // Try to parse as JSON first
      chatData = JSON.parse(responseText);
      console.log('Parsed chat response as JSON:', chatData);
    } catch (parseError) {
      console.log('Response is not JSON, treating as plain text');
      // If it's not JSON, treat the entire response as the message
      chatData = {
        message: responseText.replace(/^"|"$/g, ''), // Remove surrounding quotes if present
        metadata: {}
      };
    }
    
    console.log('Final chat data:', chatData);
    
    return {
      message: chatData.message || 'Response received from AI',
      sessionId: this.currentSession || 'unknown',
      suggestions: chatData.suggestions || []
    };
  }

  // Get chat history/sessions for an agent
  async getChatHistory(agentId: string = 'facebook_marketing_agent'): Promise<any> {
    const response = await fetch(`${this.baseURL}/agents/${agentId}/sessions`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${generateJWTToken({} as JWTPayload)}`,
      },
    });

    console.log('Chat history response status:', response.status);
    console.log('Chat history response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat history request failed:', response.status, errorText);
      throw new Error(`Chat history request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw chat history response:', responseText);
    
    let historyData;
    try {
      historyData = JSON.parse(responseText);
      console.log('Parsed chat history:', historyData);
    } catch (parseError) {
      console.log('Chat history response is not JSON, treating as plain text');
      historyData = { sessions: [], message: responseText };
    }
    
    return historyData;
  }

  // Analyze Facebook campaign performance
  async analyzeCampaign(campaignId: string): Promise<CampaignAnalysis> {
    try {
      return await this.makeAuthenticatedRequest<CampaignAnalysis>(`/campaigns/${campaignId}/analyze`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Failed to analyze campaign:', error);
      throw error;
    }
  }

  // Get marketing insights and recommendations
  async getInsights(userId: string, timeframe: string = '30d'): Promise<any> {
    try {
      return await this.makeAuthenticatedRequest(`/insights/${userId}?timeframe=${timeframe}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Failed to retrieve insights:', error);
      throw error;
    }
  }

  // Generate audience suggestions
  async generateAudienceSuggestions(businessType: string, location: string): Promise<string[]> {
    try {
      const response = await this.makeAuthenticatedRequest<{ suggestions: string[] }>('/audience/suggestions', {
        method: 'POST',
        body: JSON.stringify({ businessType, location }),
      });
      return response.suggestions;
    } catch (error) {
      console.error('Failed to generate audience suggestions:', error);
      throw error;
    }
  }

  // Reset session (for logout or new session)
  resetSession() {
    this.currentSession = null;
    this.currentUser = null;
  }
}

export const aiService = new AIService();
