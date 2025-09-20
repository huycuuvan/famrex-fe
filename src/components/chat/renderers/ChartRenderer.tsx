// file: src/components/chat/renderers/ChartRenderer.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  InsertChart as ChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ChartRendererProps {
  data: any;
  type?: 'bar' | 'line' | 'pie' | 'scatter';
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ data, type = 'bar' }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>(type);
  const [error, setError] = useState<string | null>(null);

  // Parse and normalize chart data
  const parseChartData = (): ChartData | null => {
    try {
      // If data is already in Chart.js format
      if (data.labels && data.datasets) {
        return data as ChartData;
      }

      // If data has chartData property
      if (data.chartData) {
        return parseChartData();
      }

      // If data has simple labels and values
      if (data.labels && data.values) {
        return {
          labels: data.labels,
          datasets: [{
            label: data.label || 'Dataset',
            data: data.values,
            backgroundColor: generateColors(data.values.length),
            borderColor: '#1976d2',
            borderWidth: 2
          }]
        };
      }

      // If data is an array of objects
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        const keys = Object.keys(firstItem);
        
        if (keys.length >= 2) {
          const labelKey = keys[0];
          const valueKey = keys[1];
          
          return {
            labels: data.map(item => String(item[labelKey])),
            datasets: [{
              label: valueKey,
              data: data.map(item => Number(item[valueKey]) || 0),
              backgroundColor: generateColors(data.length),
              borderColor: '#1976d2',
              borderWidth: 2
            }]
          };
        }
      }

      // If data is a simple object with key-value pairs
      if (typeof data === 'object' && !Array.isArray(data)) {
        const entries = Object.entries(data);
        const labels = entries.map(([key]) => key);
        const values = entries.map(([, value]) => Number(value) || 0);
        
        return {
          labels,
          datasets: [{
            label: 'Values',
            data: values,
            backgroundColor: generateColors(values.length),
            borderColor: '#1976d2',
            borderWidth: 2
          }]
        };
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse chart data');
      return null;
    }
  };

  const generateColors = (count: number): string[] => {
    const colors = [
      '#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  const chartData = parseChartData();

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChartIcon fontSize="small" />;
      case 'line': return <LineChartIcon fontSize="small" />;
      case 'pie': return <PieChartIcon fontSize="small" />;
      case 'scatter': return <ScatterPlotIcon fontSize="small" />;
      default: return <ChartIcon fontSize="small" />;
    }
  };

  const renderSimpleChart = () => {
    if (!chartData || !chartData.datasets[0]) return null;

    const dataset = chartData.datasets[0];
    const maxValue = Math.max(...dataset.data);

    switch (chartType) {
      case 'bar':
        return (
          <Box sx={{ p: 2 }}>
            {chartData.labels.map((label, index) => {
              const value = dataset.data[index];
              const percentage = (value / maxValue) * 100;
              const color = Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[index] 
                : dataset.backgroundColor || '#1976d2';

              return (
                <Box key={index} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight="bold">{value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 20,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: '100%',
                        bgcolor: color,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        );

      case 'pie':
        const total = dataset.data.reduce((sum, value) => sum + value, 0);
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {chartData.labels.map((label, index) => {
                const value = dataset.data[index];
                const percentage = ((value / total) * 100).toFixed(1);
                const color = Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[index] 
                  : dataset.backgroundColor || '#1976d2';

                return (
                  <Chip
                    key={index}
                    label={`${label}: ${percentage}%`}
                    sx={{
                      bgcolor: color,
                      color: 'white',
                      '& .MuiChip-label': { fontWeight: 'bold' }
                    }}
                  />
                );
              })}
            </Box>
            
            {/* Simple pie chart representation */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total: {total}
              </Typography>
            </Box>
          </Box>
        );

      case 'line':
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', height: 200, mb: 2 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 40}
                    x2="400"
                    y2={i * 40}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Data line */}
                <polyline
                  points={dataset.data.map((value, index) => {
                    const x = (index / (dataset.data.length - 1)) * 400;
                    const y = 200 - (value / maxValue) * 180;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={dataset.borderColor || '#1976d2'}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {dataset.data.map((value, index) => {
                  const x = (index / (dataset.data.length - 1)) * 400;
                  const y = 200 - (value / maxValue) * 180;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={dataset.borderColor || '#1976d2'}
                    />
                  );
                })}
              </svg>
            </Box>
            
            {/* Labels */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {chartData.labels.map((label, index) => (
                <Typography key={index} variant="caption" sx={{ textAlign: 'center' }}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chart type "{chartType}" not implemented in simple renderer
            </Typography>
          </Box>
        );
    }
  };

  const handleExport = () => {
    if (!chartData) return;

    const csvContent = [
      ['Label', ...chartData.datasets.map(d => d.label)].join(','),
      ...chartData.labels.map((label, index) => 
        [label, ...chartData.datasets.map(d => d.data[index])].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-data-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Failed to render chart: {error}
        </Typography>
      </Alert>
    );
  }

  if (!chartData) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography color="text.secondary">
          No valid chart data found. Expected format: {`{labels: [], datasets: []}`} or {`{labels: [], values: []}`}
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
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getChartIcon(chartType)}
          <Chip
            label={`${chartData.labels.length} data points`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={chartType}
              label="Type"
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="pie">Pie</MenuItem>
              <MenuItem value="scatter">Scatter</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Export data as CSV">
            <IconButton size="small" onClick={handleExport}>
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart Content */}
      <Box sx={{ minHeight: 200 }}>
        {renderSimpleChart()}
      </Box>

      {/* Footer with dataset info */}
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
          {chartData.datasets.length} dataset(s) • {chartData.labels.length} labels
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChartRenderer;
