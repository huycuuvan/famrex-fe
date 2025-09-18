// file: src/components/chat/MessageContent.tsx
'use client';

import React from 'react';
import { 
  Typography, 
  Box, 
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Article as ArticleIcon,
  TextFields as TextIcon
} from '@mui/icons-material';
import { Message } from '@/hooks/useChat';

interface MessageContentProps {
  message: Message;
}

/**
 * Component để render markdown content
 */
function MarkdownContent({ content }: { content: string }) {
  // Simple markdown parser cho các pattern cơ bản
  const parseMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Lists
      .replace(/^\s*\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\s*- (.*$)/gim, '<li>$1</li>')
      .replace(/^\s*\+ (.*$)/gim, '<li>$1</li>')
      // Numbered lists
      .replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n/gim, '<br>');
  };

  return (
    <Box
      sx={{
        '& h1, & h2, & h3': {
          margin: '16px 0 8px 0',
          fontWeight: 'bold'
        },
        '& h1': { fontSize: '1.5rem' },
        '& h2': { fontSize: '1.3rem' },
        '& h3': { fontSize: '1.1rem' },
        '& strong': {
          fontWeight: 'bold'
        },
        '& em': {
          fontStyle: 'italic'
        },
        '& code': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        },
        '& li': {
          marginLeft: '20px',
          listStyle: 'disc'
        }
      }}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

/**
 * Component để hiển thị JSON content
 */
function JSONContent({ content, metadata }: { content: string; metadata?: any }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Chip 
          icon={<CodeIcon />} 
          label="JSON Response" 
          size="small" 
          color="info" 
          variant="outlined"
        />
      </Box>
      
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {content}
      </Typography>

      {metadata && Object.keys(metadata).length > 0 && (
        <Accordion 
          expanded={expanded} 
          onChange={() => setExpanded(!expanded)}
          sx={{ mt: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="caption" color="text.secondary">
              Metadata ({Object.keys(metadata).length} fields)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            >
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </Paper>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

/**
 * Component để hiển thị text content
 */
function TextContent({ content }: { content: string }) {
  return (
    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
      {content}
    </Typography>
  );
}

/**
 * Component để hiển thị streaming indicator
 */
function StreamingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <CircularProgress size={12} />
      <Typography variant="caption" color="text.secondary">
        Đang nhận phản hồi...
      </Typography>
    </Box>
  );
}

/**
 * Main MessageContent component
 */
export default function MessageContent({ message }: MessageContentProps) {
  const { content, messageType = 'text', metadata, isStreaming = false } = message;

  // Debug log để kiểm tra
  console.log('MessageContent render:', { 
    content, 
    messageType, 
    isStreaming, 
    hasContent: !!content,
    contentLength: content?.length || 0 
  });

  // Hiển thị type indicator cho AI messages (chỉ khi không streaming và có messageType khác text)
  const showTypeIndicator = message.sender === 'ai' && messageType !== 'text' && !isStreaming;

  return (
    <Box>
      {showTypeIndicator && (
        <Box sx={{ mb: 1 }}>
          <Chip 
            icon={
              messageType === 'markdown' ? <ArticleIcon /> :
              messageType === 'json' ? <CodeIcon /> :
              <TextIcon />
            }
            label={
              messageType === 'markdown' ? 'Markdown' :
              messageType === 'json' ? 'Structured Response' :
              'Text'
            }
            size="small" 
            color={
              messageType === 'markdown' ? 'success' :
              messageType === 'json' ? 'info' :
              'default'
            }
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: '20px' }}
          />
        </Box>
      )}

      {/* Luôn hiển thị content nếu có, bất kể streaming hay không */}
      {content && content.trim() && (
        <Box>
          {messageType === 'markdown' && <MarkdownContent content={content} />}
          {messageType === 'json' && <JSONContent content={content} metadata={metadata} />}
          {messageType === 'text' && <TextContent content={content} />}
        </Box>
      )}

      {/* Hiển thị streaming indicator chỉ khi đang streaming */}
      {isStreaming && (
        <StreamingIndicator />
      )}

      {/* Chỉ hiển thị "Tin nhắn trống" khi thực sự không có content và không streaming */}
      {(!content || content.trim() === '') && !isStreaming && (
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Tin nhắn trống
        </Typography>
      )}
    </Box>
  );
}
