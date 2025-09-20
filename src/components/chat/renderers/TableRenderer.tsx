'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  TableChart as TableIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import a lightweight markdown parser for cell content
const parseInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
};

interface TableRendererProps {
  content: string;
  headers?: string[];
}

interface TableData {
  headers: string[];
  rows: string[][];
  format: string;
}

const TableRenderer: React.FC<TableRendererProps> = ({ content, headers }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = useMemo((): TableData => {
    // Chỉ trích xuất các dòng là một phần của bảng markdown
    const lines = content.split('\n').filter(line => line.includes('|'));
    
    if (lines.length === 0) {
      return { headers: [], rows: [], format: 'empty' };
    }

    let parsedHeaders: string[] = [];
    let parsedRows: string[][] = [];
    let detectedFormat = 'unknown';

    // Try to parse as markdown table (pipe-separated)
    const pipeLines = lines.filter(line => line.includes('|') && line.split('|').length > 2);
    if (pipeLines.length >= 2) {
      detectedFormat = 'markdown';
      parsedHeaders = pipeLines[0]
        .split('|')
        .map(h => h.trim())
        .filter(h => h);

      // Skip separator line if it exists
      let startIndex = 1;
      if (pipeLines[1] && pipeLines[1].match(/^[\s|:-]+$/)) {
        startIndex = 2;
      }
      
      parsedRows = pipeLines.slice(startIndex).map(line =>
        line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')
      );
    }
    // Try to parse as tab-separated
    else if (lines.some(line => line.includes('\t'))) {
      detectedFormat = 'tab-separated';
      const tabLines = lines.filter(line => line.includes('\t'));
      parsedHeaders = tabLines[0].split('\t').map(h => h.trim());
      parsedRows = tabLines.slice(1).map(line =>
        line.split('\t').map(cell => cell.trim())
      );
    }
    // Try to parse as CSV
    else if (lines.some(line => line.includes(',') && line.split(',').length > 2)) {
      detectedFormat = 'csv';
      const csvLines = lines.filter(line => line.includes(','));
      parsedHeaders = parseCSVLine(csvLines[0]);
      parsedRows = csvLines.slice(1).map(line => parseCSVLine(line));
    }
    // Try to parse as space-separated
    else if (hasConsistentColumns(lines)) {
      detectedFormat = 'space-separated';
      
      const firstLine = lines[0].trim().split(/\s+/);
      const secondLine = lines[1] ? lines[1].trim().split(/\s+/) : [];
      
      // Check if first line looks like headers
      const looksLikeHeaders = firstLine.some(cell => 
        isNaN(Number(cell)) && cell.length > 1
      );
      
      if (looksLikeHeaders && firstLine.length === secondLine.length) {
        parsedHeaders = firstLine;
        parsedRows = lines.slice(1).map(line => 
          line.trim().split(/\s+/).filter(cell => cell)
        );
      } else {
        const maxColumns = Math.max(...lines.map(line => line.trim().split(/\s+/).length));
        parsedHeaders = Array.from({ length: maxColumns }, (_, i) => `Cột ${i + 1}`);
        parsedRows = lines.map(line => 
          line.trim().split(/\s+/).filter(cell => cell)
        );
      }
    }
    // Fallback: treat as single column or try to detect patterns
    else {
      // Check if it looks like a list that could be converted to table
      if (lines.every(line => line.includes(':'))) {
        detectedFormat = 'key-value';
        parsedHeaders = ['Thuộc tính', 'Giá trị'];
        parsedRows = lines.map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            return [
              line.substring(0, colonIndex).trim(),
              line.substring(colonIndex + 1).trim()
            ];
          }
          return [line.trim(), ''];
        });
      } else {
        detectedFormat = 'single-column';
        parsedHeaders = ['Nội dung'];
        parsedRows = lines.map(line => [line.trim()]);
      }
    }

    // Use provided headers if available
    if (headers && headers.length > 0) {
      parsedHeaders = headers;
    }

    // Normalize row lengths
    const maxColumns = parsedHeaders.length;
    parsedRows = parsedRows.map(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
      return row.slice(0, maxColumns);
    });

    return { headers: parsedHeaders, rows: parsedRows, format: detectedFormat };
  }, [content, headers]);

  // Helper functions
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result.map(cell => cell.replace(/^"|"$/g, ''));
  };

  const hasConsistentColumns = (lines: string[]): boolean => {
    if (lines.length < 2) return false;
    
    const columnCounts = lines.map(line => line.trim().split(/\s+/).length);
    const firstCount = columnCounts[0];
    
    const consistentLines = columnCounts.filter(count => count === firstCount).length;
    return (consistentLines / columnCounts.length) >= 0.8;
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return tableData.rows;
    
    return tableData.rows.filter(row =>
      row.some(cell =>
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [tableData.rows, searchTerm]);

  const paginatedRows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    const csvContent = [
      tableData.headers.join(','),
      ...tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const getFormatColor = (format: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const formatColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      markdown: 'primary',
      'tab-separated': 'info',
      csv: 'success',
      'space-separated': 'warning',
      'key-value': 'secondary',
      'single-column': 'default'
    };
    return formatColors[format] || 'default';
  };

  if (tableData.headers.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            Không thể phân tích dữ liệu thành bảng. Nội dung có thể không có cấu trúc bảng rõ ràng.
          </Typography>
        </Alert>
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
          <TableIcon fontSize="small" />
          <Chip
            label={`${tableData.rows.length} hàng × ${tableData.headers.length} cột`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={tableData.format.replace('-', ' ').toUpperCase()}
            size="small"
            color={getFormatColor(tableData.format)}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm trong bảng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200 }}
          />
          
          <Tooltip title="Xuất ra CSV">
            <IconButton size="small" onClick={handleExport}>
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {tableData.headers.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRight: '1px solid',
                    borderColor: 'primary.dark',
                    minWidth: 120
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableData.headers.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: 'grey.50'
                    },
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal', // Cho phép văn bản xuống dòng
                        fontSize: '0.875rem',
                        wordBreak: 'break-word', // Giúp ngắt từ nếu cần
                      }}
                    >
                      <Tooltip title={cell || 'Trống'} placement="top">
                        <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell || '-') }} />
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {tableData.rows.length > 5 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        />
      )}
    </Paper>
  );
};

export default TableRenderer;
