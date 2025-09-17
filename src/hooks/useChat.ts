// file: src/hooks/useChat.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { aiService, Agent } from '@/services/AI.service';
import { User } from '@/libs/types';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const router = useRouter();

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    try {
      // Check workspace
      if (!localStorage.getItem('famarex_workspace')) {
        router.push('/workspace');
        return;
      }
      // Load user data
      const cachedUser = localStorage.getItem('famarex_user');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        setCurrentUser(user);
        await aiService.createSession(user.id, user.name);
      } else {
        // Nếu không có user, không thể chat -> quay về login
        router.push('/login');
        return;
      }

      // Load history
      const historyData = await aiService.getChatHistory();
      if (historyData.sessions && Array.isArray(historyData.sessions)) {
        setChatSessions(historyData.sessions.map((s: any) => ({
          id: s.session_id,
          title: s.title || `Chat from ${new Date(s.created_at).toLocaleDateString()}`,
          timestamp: new Date(s.created_at)
        })));
      }
      
      // Welcome message
      setMessages([{
        id: 'welcome_' + Date.now(),
        content: 'Xin chào! Tôi là Famarex. Tôi có thể giúp bạn tối ưu hóa chiến dịch quảng cáo Facebook như thế nào?',
        sender: 'ai',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [router]);

  useEffect(() => {
    initialize();
  }, [initialize]);
  
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage({
        message: messageContent,
        userId: currentUser!.id, // currentUser chắc chắn có ở bước này
      });
      
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: response.chatMessage, 
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        content: 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    aiService.resetSession();
    initialize(); // Khởi tạo lại toàn bộ
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    isInitializing,
    currentUser,
    chatSessions,
    sendMessage,
    startNewChat,
  };
}