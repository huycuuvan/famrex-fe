// file: src/components/chat/renderers/HtmlRenderer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Html as HtmlIcon,
  Code as CodeIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

interface HtmlRendererProps {
  content: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ content }) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');
  const [allowUnsafe, setAllowUnsafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sanitize HTML content by removing potentially dangerous elements and attributes
  const sanitizeHtml = (html: string): string => {
    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove dangerous tags
    const dangerousTags = ['object', 'embed', 'applet', 'iframe', 'frame', 'frameset', 'meta', 'link'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
  };

  // Check if HTML contains potentially unsafe content
  const hasUnsafeContent = (html: string): boolean => {
    const unsafePatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<applet/i,
      /<form/i
    ];
    
    return unsafePatterns.some(pattern => pattern.test(html));
  };

  const isUnsafe = hasUnsafeContent(content);
  const displayContent = allowUnsafe ? content : sanitizeHtml(content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy HTML:', error);
    }
  };

  const getHtmlStats = (): { elements: number; size: string } => {
    const elementCount = (content.match(/<[^>]+>/g) || []).length;
    const size = new Blob([content]).size;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formattedSize = Math.round(size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    
    return { elements: elementCount, size: formattedSize };
  };

  const stats = getHtmlStats();

  const renderHtmlPreview = () => {
    if (viewMode === 'source') {
      return (
        <Box sx={{ p: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                margin: 0,
                lineHeight: 1.4
              }}
            >
              {content}
            </Typography>
          </Paper>
        </Box>
      );
    }

    // Rendered view
    return (
      <Box sx={{ p: 2 }}>
        {isUnsafe && !allowUnsafe && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            icon={<SecurityIcon />}
          >
            <Typography variant="body2">
              This HTML contains potentially unsafe content. Some elements have been removed for security.
              Enable "Allow Unsafe Content" to view the original HTML.
            </Typography>
          </Alert>
        )}
        
        <Paper
          variant="outlined"
          sx={{
            minHeight: 200,
            maxHeight: 400,
            overflow: 'auto',
            bgcolor: 'background.paper'
          }}
        >
          {/* Render HTML in a sandboxed iframe for better security */}
          <iframe
            ref={iframeRef}
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      margin: 16px;
                      line-height: 1.6;
                      color: #333;
                    }
                    img { max-width: 100%; height: auto; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    pre { background-color: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
                    code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 2px; }
                  </style>
                </head>
                <body>
                  ${displayContent}
                </body>
              </html>
            `}
            style={{
              width: '100%',
              minHeight: '200px',
              border: 'none'
            }}
            sandbox={allowUnsafe ? 'allow-same-origin allow-scripts' : 'allow-same-origin'}
            title="HTML Preview"
          />
        </Paper>
      </Box>
    );
  };

  return (
    <Paper variant="outlined" sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HtmlIcon fontSize="small" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${stats.elements} elements`}
              size="small"
              color="error"
              variant="outlined"
            />
            <Chip
              label={stats.size}
              size="small"
              color="default"
              variant="outlined"
            />
            {isUnsafe && (
              <Chip
                icon={<WarningIcon fontSize="small" />}
                label="Unsafe Content"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied!' : 'Copy HTML'}>
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
          variant="standard"
          sx={{ minHeight: 'auto' }}
        >
          <Tab 
            label="Rendered" 
            value="rendered" 
            icon={<ViewIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minHeight: 'auto', py: 0.5 }}
          />
          <Tab 
            label="Source" 
            value="source" 
            icon={<CodeIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minHeight: 'auto', py: 0.5 }}
          />
        </Tabs>

        {isUnsafe && (
          <FormControlLabel
            control={
              <Switch
                checked={allowUnsafe}
                onChange={(e) => setAllowUnsafe(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                Allow Unsafe Content
              </Typography>
            }
          />
        )}
      </Box>

      {/* Content */}
      {renderHtmlPreview()}

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          HTML Document • {content.length} characters • 
          {isUnsafe ? (allowUnsafe ? 'Unsafe content enabled' : 'Content sanitized') : 'Safe content'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default HtmlRenderer;
