// file: src/app/chat/page.tsx
'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { AutoAwesome as SparklesIcon } from '@mui/icons-material';

import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import { useChat, Message } from '@/hooks/useChat';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';



function ChatPageContent() {
  const {
    messages,
    isLoading,
    isInitializing,
    sendMessage,
  } = useChat();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };
  
  if (isInitializing) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress />
          <Typography variant="h5">Initializing Chat...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <AppLayout title="AI Marketing Assistant">
      <Box sx={{ height: '100%', display: 'flex' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MessageList messages={messages} isLoading={isLoading} />
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </Box>
      </Box>
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