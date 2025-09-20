'use client';

import { useEffect, useState, useMemo } from 'react';
import { Typography } from '@mui/material';
import { parseMessageContent, ParsedMessage } from '@/libs/utils/messageParser';
import JsonRenderer from './renderers/JsonRenderer';
import MarkdownRenderer from './renderers/MarkdownRenderer';
import TableRenderer from './renderers/TableRenderer';
import CodeRenderer from './renderers/CodeRenderer';
import ChartRenderer from './renderers/ChartRenderer';
import FileRenderer from './renderers/FileRenderer';
import HtmlRenderer from './renderers/HtmlRenderer';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  // Chỉ parse lại khi content thay đổi
  const parsedContent = useMemo(() => parseMessageContent(content), [content]);

  switch (parsedContent.type) {
    case 'json':
      return <JsonRenderer content={JSON.stringify(parsedContent.content)} schema={parsedContent.metadata?.schema} />;
    case 'table':
      return <TableRenderer content={parsedContent.content} headers={parsedContent.metadata?.headers} />;
    case 'markdown':
      return <MarkdownRenderer content={parsedContent.content} />;
    case 'code':
      return <CodeRenderer content={parsedContent.content} language={parsedContent.metadata?.language} />;
    case 'chart':
      return <ChartRenderer data={parsedContent.content} type={parsedContent.metadata?.type} />;
    case 'file':
      return <FileRenderer content={parsedContent.content} filename={parsedContent.metadata?.filename} fileType={parsedContent.metadata?.fileType} />;
    case 'html':
      return <HtmlRenderer content={parsedContent.content} />;
    case 'text':
    default:
      return (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {parsedContent.content}
        </Typography>
      );
  }
}
