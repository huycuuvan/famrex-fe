// file: src/components/chat/renderers/CodeRenderer.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface CodeRendererProps {
  content: string;
  language?: string;
}

const CodeRenderer: React.FC<CodeRendererProps> = ({ content, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getLanguageColor = (lang: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const languageColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      javascript: 'warning',
      typescript: 'info',
      python: 'success',
      java: 'error',
      html: 'secondary',
      css: 'primary',
      json: 'info',
      sql: 'success',
      bash: 'default',
      shell: 'default',
      php: 'primary',
      cpp: 'error',
      c: 'error',
      go: 'info',
      rust: 'warning',
      ruby: 'error',
      swift: 'warning',
      kotlin: 'primary',
    };
    return languageColors[lang.toLowerCase()] || 'default';
  };

  const highlightSyntax = (code: string, lang: string): string => {
    // Basic syntax highlighting patterns
    const patterns: Record<string, Array<{ pattern: RegExp; replacement: string }>> = {
      javascript: [
        { pattern: /\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|default)\b/g, replacement: '<span style="color: #0066cc; font-weight: bold;">$1</span>' },
        { pattern: /\b(true|false|null|undefined)\b/g, replacement: '<span style="color: #0066cc;">$1</span>' },
        { pattern: /"([^"\\]|\\.)*"/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /'([^'\\]|\\.)*'/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /\/\/.*$/gm, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
        { pattern: /\/\*[\s\S]*?\*\//g, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
      ],
      typescript: [
        { pattern: /\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|default|interface|type|enum)\b/g, replacement: '<span style="color: #0066cc; font-weight: bold;">$1</span>' },
        { pattern: /\b(string|number|boolean|any|void|never|unknown)\b/g, replacement: '<span style="color: #0066cc;">$1</span>' },
        { pattern: /"([^"\\]|\\.)*"/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /'([^'\\]|\\.)*'/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /\/\/.*$/gm, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
      ],
      python: [
        { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield)\b/g, replacement: '<span style="color: #0066cc; font-weight: bold;">$1</span>' },
        { pattern: /\b(True|False|None)\b/g, replacement: '<span style="color: #0066cc;">$1</span>' },
        { pattern: /"([^"\\]|\\.)*"/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /'([^'\\]|\\.)*'/g, replacement: '<span style="color: #008000;">$&</span>' },
        { pattern: /#.*$/gm, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
      ],
      html: [
        { pattern: /&lt;(\/?[a-zA-Z][^&gt;]*)&gt;/g, replacement: '<span style="color: #0066cc;">$&</span>' },
        { pattern: /(&lt;[^&gt;]*\s)([a-zA-Z-]+)(=)/g, replacement: '$1<span style="color: #cc6600;">$2</span>$3' },
        { pattern: /=("[^"]*")/g, replacement: '=<span style="color: #008000;">$1</span>' },
        { pattern: /&lt;!--[\s\S]*?--&gt;/g, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
      ],
      css: [
        { pattern: /([.#]?[a-zA-Z][a-zA-Z0-9-]*)\s*{/g, replacement: '<span style="color: #0066cc; font-weight: bold;">$1</span> {' },
        { pattern: /([a-zA-Z-]+)\s*:/g, replacement: '<span style="color: #cc6600;">$1</span>:' },
        { pattern: /:\s*([^;]+);/g, replacement: ': <span style="color: #008000;">$1</span>;' },
        { pattern: /\/\*[\s\S]*?\*\//g, replacement: '<span style="color: #808080; font-style: italic;">$&</span>' },
      ],
      json: [
        { pattern: /"([^"\\]|\\.)*":/g, replacement: '<span style="color: #0066cc; font-weight: bold;">$&</span>' },
        { pattern: /:\s*"([^"\\]|\\.)*"/g, replacement: ': <span style="color: #008000;">$&</span>'.replace(': "', ': <span style="color: #008000;">"') },
        { pattern: /:\s*(true|false|null|\d+)/g, replacement: ': <span style="color: #0066cc;">$1</span>' },
      ],
    };

    let highlightedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const langPatterns = patterns[lang.toLowerCase()];
    if (langPatterns) {
      langPatterns.forEach(({ pattern, replacement }) => {
        highlightedCode = highlightedCode.replace(pattern, replacement);
      });
    }

    return highlightedCode;
  };

  const getLineNumbers = (code: string): string[] => {
    return code.split('\n').map((_, index) => (index + 1).toString());
  };

  const lines = content.split('\n');
  const lineNumbers = getLineNumbers(content);
  const highlightedContent = highlightSyntax(content, language);

  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'grey.300'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon fontSize="small" />
          <Chip
            label={language.toUpperCase()}
            size="small"
            color={getLanguageColor(language)}
            variant="outlined"
          />
        </Box>
        
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code Content */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {/* Line Numbers */}
          <Box
            sx={{
              minWidth: 40,
              bgcolor: 'grey.200',
              borderRight: '1px solid',
              borderColor: 'grey.300',
              py: 2,
              px: 1,
              userSelect: 'none'
            }}
          >
            {lineNumbers.map((lineNum, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textAlign: 'right',
                  lineHeight: '1.5rem',
                  display: 'block'
                }}
              >
                {lineNum}
              </Typography>
            ))}
          </Box>

          {/* Code */}
          <Box sx={{ flex: 1, py: 2, px: 2 }}>
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
                margin: 0,
                whiteSpace: 'pre',
                color: 'text.primary'
              }}
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          </Box>
        </Box>
      </Box>

      {/* Footer with code stats */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'grey.100',
          borderTop: '1px solid',
          borderColor: 'grey.300'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {lines.length} lines • {content.length} characters
        </Typography>
      </Box>
    </Paper>
  );
};

export default CodeRenderer;
