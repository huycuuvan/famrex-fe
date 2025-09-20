// file: src/components/chat/renderers/FileRenderer.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Description as FileIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';

interface FileRendererProps {
  content: string;
  filename?: string;
  fileType?: string;
}

const FileRenderer: React.FC<FileRendererProps> = ({ content, filename, fileType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(lowerType)) {
      return <ImageIcon fontSize="small" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(lowerType)) {
      return <VideoIcon fontSize="small" />;
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(lowerType)) {
      return <AudioIcon fontSize="small" />;
    }
    if (lowerType === 'pdf') {
      return <PdfIcon fontSize="small" />;
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(lowerType)) {
      return <DocumentIcon fontSize="small" />;
    }
    
    return <FileIcon fontSize="small" />;
  };

  const getFileTypeColor = (type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const lowerType = type.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(lowerType)) {
      return 'success';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(lowerType)) {
      return 'info';
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(lowerType)) {
      return 'warning';
    }
    if (lowerType === 'pdf') {
      return 'error';
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(lowerType)) {
      return 'primary';
    }
    
    return 'default';
  };

  const isBase64Content = (content: string): boolean => {
    return content.startsWith('data:') || /^[A-Za-z0-9+/]+=*$/.test(content);
  };

  const isImageType = (type: string): boolean => {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(type.toLowerCase());
  };

  const isTextType = (type: string): boolean => {
    return ['txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md'].includes(type.toLowerCase());
  };

  const getFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    try {
      let blob: Blob;
      let downloadFilename = filename || `file-${Date.now()}`;

      if (isBase64Content(content)) {
        // Handle base64 content
        if (content.startsWith('data:')) {
          // Data URL format
          const [header, data] = content.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
          const binaryString = atob(data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: mimeType });
        } else {
          // Plain base64
          const binaryString = atob(content);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes]);
        }
      } else {
        // Handle text content
        blob = new Blob([content], { type: 'text/plain' });
        if (!downloadFilename.includes('.')) {
          downloadFilename += '.txt';
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download file');
      console.error('Download error:', error);
    }
  };

  const renderFilePreview = () => {
    if (!fileType) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No file type specified
          </Typography>
        </Box>
      );
    }

    // Image preview
    if (isImageType(fileType) && isBase64Content(content)) {
      const imageSrc = content.startsWith('data:') ? content : `data:image/${fileType};base64,${content}`;
      
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <img
            src={imageSrc}
            alt={filename || 'Image'}
            style={{
              maxWidth: '100%',
              maxHeight: 300,
              objectFit: 'contain',
              borderRadius: 8
            }}
            onError={() => setError('Failed to load image')}
          />
        </Box>
      );
    }

    // Text file preview
    if (isTextType(fileType) && !isBase64Content(content)) {
      return (
        <Box sx={{ p: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              maxHeight: 300,
              overflow: 'auto'
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}
            >
              {content.length > 1000 ? content.substring(0, 1000) + '...' : content}
            </Typography>
          </Paper>
          {content.length > 1000 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing first 1000 characters. Download to view full content.
            </Typography>
          )}
        </Box>
      );
    }

    // Binary file or unsupported type
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          {getFileIcon(fileType)}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {fileType.toUpperCase()} file - Preview not available
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Click download to save the file
        </Typography>
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
          {fileType && getFileIcon(fileType)}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {filename || 'Untitled File'}
            </Typography>
            {fileType && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={fileType.toUpperCase()}
                  size="small"
                  color={getFileTypeColor(fileType)}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {getFileSize(content)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Download file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && <LinearProgress />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* File Preview */}
      {!isLoading && !error && renderFilePreview()}

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
          {isBase64Content(content) ? 'Binary content' : 'Text content'} • 
          {content.length} characters
        </Typography>
      </Box>
    </Paper>
  );
};

export default FileRenderer;
