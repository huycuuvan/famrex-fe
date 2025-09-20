'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DataObject as JsonIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';

interface JsonRendererProps {
  content: string;
  schema?: any;
}

interface JsonTreeNodeProps {
  data: any;
  keyName?: string;
  level?: number;
  isLast?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({ 
  data, 
  keyName, 
  level = 0, 
  isLast = true 
}) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      string: '#008000',
      number: '#0066cc',
      boolean: '#0066cc',
      null: '#808080',
      object: '#cc6600',
      array: '#cc6600',
      undefined: '#808080'
    };
    return colors[type] || '#000000';
  };

  const formatValue = (value: any): string => {
    const type = getValueType(value);
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'null':
        return 'null';
      case 'undefined':
        return 'undefined';
      default:
        return String(value);
    }
  };

  const isExpandable = (value: any): boolean => {
    return (typeof value === 'object' && value !== null) || Array.isArray(value);
  };

  const getItemCount = (value: any): number => {
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length;
    return 0;
  };

  const renderValue = () => {
    const type = getValueType(data);
    
    if (!isExpandable(data)) {
      return (
        <Box component="span" sx={{ color: getTypeColor(type) }}>
          {formatValue(data)}
        </Box>
      );
    }

    const itemCount = getItemCount(data);
    const isArray = Array.isArray(data);
    const preview = isArray ? '[...]' : '{...}';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0.25 }}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        
        <Box component="span" sx={{ color: getTypeColor('object') }}>
          {expanded ? (isArray ? '[' : '{') : preview}
        </Box>
        
        {!expanded && (
          <Chip
            label={`${itemCount} ${isArray ? 'items' : 'keys'}`}
            size="small"
            variant="outlined"
            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    );
  };

  const renderChildren = () => {
    if (!isExpandable(data) || !expanded) return null;

    const isArray = Array.isArray(data);
    const entries = isArray 
      ? data.map((item, index) => [index.toString(), item])
      : Object.entries(data);

    return (
      <Box sx={{ ml: 2, borderLeft: '1px solid', borderColor: 'grey.300', pl: 1 }}>
        {entries.map(([key, value], index) => (
          <JsonTreeNode
            key={key}
            data={value}
            keyName={key}
            level={level + 1}
            isLast={index === entries.length - 1}
          />
        ))}
        <Box sx={{ color: getTypeColor('object'), fontFamily: 'monospace' }}>
          {isArray ? ']' : '}'}
          {!isLast && ','}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', py: 0.25 }}>
        {keyName && (
          <>
            <Box component="span" sx={{ color: '#cc6600', fontWeight: 'bold' }}>
              "{keyName}"
            </Box>
            <Box component="span" sx={{ mx: 0.5 }}>:</Box>
          </>
        )}
        {renderValue()}
        {!isExpandable(data) && !isLast && (
          <Box component="span" sx={{ color: 'text.primary' }}>,</Box>
        )}
      </Box>
      {renderChildren()}
    </Box>
  );
};

const JsonRenderer: React.FC<JsonRendererProps> = ({ content, schema }) => {
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [copied, setCopied] = useState(false);

  let parsedData: any;
  let parseError: string | null = null;

  try {
    parsedData = JSON.parse(content);
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'Invalid JSON';
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy JSON:', error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'tree' ? 'raw' : 'tree');
  };

  const getDataStats = (data: any): string => {
    if (Array.isArray(data)) {
      return `Array with ${data.length} items`;
    }
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      return `Object with ${keys.length} properties`;
    }
    return `${typeof data} value`;
  };

  if (parseError) {
    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <JsonIcon fontSize="small" />
          <Typography variant="subtitle2">Invalid JSON</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {parseError}
        </Typography>
      </Paper>
    );
  }

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
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <JsonIcon fontSize="small" />
          <Chip
            label={getDataStats(parsedData)}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={viewMode === 'tree' ? 'Show raw JSON' : 'Show tree view'}>
            <IconButton size="small" onClick={toggleViewMode}>
              {viewMode === 'tree' ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {viewMode === 'tree' ? (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <JsonTreeNode data={parsedData} />
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1
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
              {JSON.stringify(parsedData, null, 2)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Schema Information */}
      {schema && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              JSON Schema Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              <Typography
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}
              >
                {JSON.stringify(schema, null, 2)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default JsonRenderer;
