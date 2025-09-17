'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Chip,
  CircularProgress,
  Fab,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Circle as CircleIcon,
  Home as HomeIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { aiService, Agent } from '../lib/api/aiService';
import { userService, User } from '../lib/api/userService';
import AgentSelector from '../components/AgentSelector';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../components/AppLayout';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadUserData();
    initializeSession();
    loadChatHistory();
    checkWorkspaceSelection();
  }, []);

  const checkWorkspaceSelection = () => {
    const workspaceData = localStorage.getItem('famarex_workspace');
    if (!workspaceData) {
      // No workspace selected, redirect to workspace selection
      router.push('/workspace');
      return;
    }
  };

  const loadUserData = async () => {
    try {
      // Get user from localStorage first (faster)
      const cachedUser = localStorage.getItem('famarex_user');
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      // If API fails but we have cached data, that's ok
      if (!currentUser) {
        // If no cached data and API fails, redirect to login
        router.push('/login');
      }
    }
  };

  const loadChatHistory = async () => {
    try {
      const historyData = await aiService.getChatHistory();
      if (historyData.sessions && Array.isArray(historyData.sessions)) {
        const formattedSessions: ChatSession[] = historyData.sessions.map((session: any) => ({
          id: session.session_id || session.id,
          title: session.title || `Chat ${new Date(session.created_at || Date.now()).toLocaleDateString()}`,
          lastMessage: session.last_message || 'No messages yet',
          timestamp: new Date(session.created_at || session.updated_at || Date.now())
        }));
        setChatSessions(formattedSessions);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      
      const userData = localStorage.getItem('famarex_user');
      let userId = 'user_' + Date.now();
      let username = 'Famarex User';
      
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || userId;
        username = user.name || username;
      }

      const session = await aiService.createSession(userId, username);
      setSessionId(session.session_id);

      const welcomeMessage: Message = {
        id: 'welcome_' + Date.now(),
        content: 'Xin chào! Tôi là Famarex - chuyên gia Marketing Facebook của bạn. Tôi có thể giúp bạn tối ưu hóa chiến dịch quảng cáo Facebook như thế nào?',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || isProcessingRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    isProcessingRef.current = true;

    try {
      const userData = localStorage.getItem('famarex_user');
      let userId = 'user_' + Date.now();
      
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || userId;
      }

      const response = await aiService.sendMessage({
        message: inputMessage,
        userId: userId,
        agentId: selectedAgent?.id || 'facebook_marketing_agent',
        sessionId: sessionId || undefined
      });

      const aiMessage: Message = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: response.message,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const startNewChat = async () => {
    try {
      setIsLoading(true);
      aiService.resetSession();
      await initializeSession();
    } catch (error) {
      console.error('Failed to start new chat:', error);
      setMessages([
        {
          id: '1',
          content: 'Xin chào! Tôi là Famarex - chuyên gia Marketing Facebook của bạn. Tôi có thể giúp bạn tối ưu hóa chiến dịch quảng cáo Facebook như thế nào?',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        id: '1',
        content: `Xin chào! Tôi là ${agent.name}. ${agent.description} Tôi có thể giúp gì cho bạn hôm nay?`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  // Loading Screen
  if (isInitializing) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}
          >
            <SparklesIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            Initializing Famarex
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Setting up your AI marketing session...
          </Typography>
          <CircularProgress />
        </Stack>
      </Box>
    );
  }

  return (
    <AppLayout 
      title={selectedAgent?.name || 'AI Marketing Assistant'}
      subtitle={selectedAgent?.description || 'Get personalized Facebook marketing insights'}
      showAgentSelector={true}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Chat History Sidebar */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={startNewChat}
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              mb: 2
            }}
          >
            New Chat
          </Button>
          
          {chatSessions.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Recent Chats
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {chatSessions.slice(0, 5).map((session) => (
                  <ListItem key={session.id} disablePadding>
                    <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }}>
                      <ListItemIcon>
                        <ChatIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {session.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.disabled">
                            {session.timestamp.toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>

        {/* Messages Area */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 3,
            bgcolor: 'grey.50'
          }}
        >
          {messages.length === 0 ? (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SparklesIcon sx={{ color: 'white', fontSize: 40 }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  Chào mừng đến với Famarex!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bắt đầu cuộc trò chuyện với AI Marketing Assistant
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={3}>
              {messages.map((message) => (
                <Stack
                  key={message.id}
                  direction="row"
                  spacing={2}
                  sx={{
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <SparklesIcon />
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={message.sender === 'user' ? 2 : 1}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 3,
                      ...(message.sender === 'user' && {
                        borderBottomRightRadius: 8
                      }),
                      ...(message.sender === 'ai' && {
                        borderBottomLeftRadius: 8
                      })
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1,
                        opacity: 0.7
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Paper>

                  {message.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {currentUser?.picture ? (
                        <img src={currentUser.picture} alt={currentUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                  )}
                </Stack>
              ))}
              
              {isLoading && (
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <SparklesIcon />
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderBottomLeftRadius: 8,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        AI đang suy nghĩ...
                      </Typography>
                    </Stack>
                  </Paper>
                </Stack>
              )}
            </Stack>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box component="form" onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi tôi về chiến lược marketing Facebook, targeting khách hàng, tối ưu quảng cáo..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'background.default'
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <IconButton
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabled',
                    color: 'action.disabled'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Nhấn Enter để gửi, Shift+Enter để xuống dòng
          </Typography>
        </Paper>
      </Box>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
          onClick={startNewChat}
        >
          <AddIcon />
        </Fab>
      )}
    </AppLayout>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
