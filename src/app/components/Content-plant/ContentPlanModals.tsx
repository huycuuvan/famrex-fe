'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
  Alert
} from '@mui/material';
import { ContentPlanItem } from '../../lib/types';

interface AddContentModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Partial<ContentPlanItem>) => void;
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (email: string, permission: string, message: string) => void;
}

export function AddContentModal({ open, onClose, onAdd }: AddContentModalProps) {
  const [formData, setFormData] = useState<Partial<ContentPlanItem>>({
    task_date: new Date().toISOString().split('T')[0],
    channel_type: '',
    channel_id: '',
    status: 'draft',
    publish_date: '',
    description: '',
    content: '',
    producer: '',
    target_source: '',
    goals: '',
    media_url: '',
    article_url: ''
  });

  const handleSubmit = () => {
    onAdd(formData);
    onClose();
    // Reset form
    setFormData({
      task_date: new Date().toISOString().split('T')[0],
      channel_type: '',
      channel_id: '',
      status: 'draft',
      publish_date: '',
      description: '',
      content: '',
      producer: '',
      target_source: '',
      goals: '',
      media_url: '',
      article_url: ''
    });
  };

  const handleChange = (field: keyof ContentPlanItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Thêm Nội Dung Mới</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Ngày Task"
              type="date"
              value={formData.task_date || ''}
              onChange={(e) => handleChange('task_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Ngày Đăng"
              type="date"
              value={formData.publish_date || ''}
              onChange={(e) => handleChange('publish_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Loại Kênh</InputLabel>
              <Select
                value={formData.channel_type || ''}
                onChange={(e) => handleChange('channel_type', e.target.value)}
                label="Loại Kênh"
              >
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="youtube">YouTube</MenuItem>
                <MenuItem value="website">Website</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="ID Kênh"
              value={formData.channel_id || ''}
              onChange={(e) => handleChange('channel_id', e.target.value)}
              fullWidth
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel>Trạng Thái</InputLabel>
            <Select
              value={formData.status || 'draft'}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Trạng Thái"
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Mô Tả"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Nội Dung"
            value={formData.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
            multiline
            rows={4}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Người Tạo"
              value={formData.producer || ''}
              onChange={(e) => handleChange('producer', e.target.value)}
              fullWidth
            />
            <TextField
              label="Nguồn Target"
              value={formData.target_source || ''}
              onChange={(e) => handleChange('target_source', e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Mục Tiêu"
            value={formData.goals || ''}
            onChange={(e) => handleChange('goals', e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Media URL"
              value={formData.media_url || ''}
              onChange={(e) => handleChange('media_url', e.target.value)}
              fullWidth
            />
            <TextField
              label="Article URL"
              value={formData.article_url || ''}
              onChange={(e) => handleChange('article_url', e.target.value)}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ShareModal({ open, onClose, onShare }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (email.trim()) {
      onShare(email, permission, message);
      onClose();
      // Reset form
      setEmail('');
      setPermission('view');
      setMessage('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chia Sẻ Content Plan</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            Mời người khác cộng tác trong content plan này
          </Alert>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>Quyền Truy Cập</InputLabel>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              label="Quyền Truy Cập"
            >
              <MenuItem value="view">
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Chỉ Xem
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Có thể xem nội dung nhưng không thể chỉnh sửa
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="edit">
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Chỉnh Sửa
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Có thể xem và chỉnh sửa nội dung
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="admin">
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Quản Trị
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toàn quyền quản lý và chia sẻ
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tin Nhắn (Tùy Chọn)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={3}
            placeholder="Thêm tin nhắn cá nhân..."
            fullWidth
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quyền được chọn:
            </Typography>
            <Chip 
              label={
                permission === 'view' ? 'Chỉ Xem' :
                permission === 'edit' ? 'Chỉnh Sửa' : 'Quản Trị'
              }
              color={
                permission === 'view' ? 'default' :
                permission === 'edit' ? 'primary' : 'secondary'
              }
              size="small"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!email.trim()}
        >
          Gửi Lời Mời
        </Button>
      </DialogActions>
    </Dialog>
  );
}
