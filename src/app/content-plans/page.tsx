'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Fab,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { ContentPlan, ContentPlanItem } from '../lib/types';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../components/AppLayout';
import ContentPlanDataGrid from '../components/Content-plant/ContentPlanDataGrid';
import ContentPlanActions from '../components/Content-plant/ContentPlanActions';
import { AddContentModal, ShareModal } from '../components/Content-plant/ContentPlanModals';
import contentPlanService from '../lib/api/contentPlanService';


interface ContentPlanPageProps {}

function ContentPlanContent() {
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ContentPlan | null>(null);
  const [planItems, setPlanItems] = useState<ContentPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Modals
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Form states
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadContentPlans();
    }
  }, [mounted]);

  const loadContentPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load content plans from API
      const response = await contentPlanService.getContentPlans({
        limit: 50,
        offset: 0
      });

      if (response.success) {
        setPlanItems(response.data);
      } else {
        setError('Không thể tải danh sách content plan');
      }
    } catch (error) {
      console.error('Failed to load content plans:', error);
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách content plan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddContent = async (newItem: Partial<ContentPlanItem>) => {
    try {
      const createRequest = {
        task_date: newItem.task_date || new Date().toISOString().split('T')[0],
        channel_id: newItem.channel_id || '',
        title: newItem.title || '',
        descript_content: newItem.descript_content || '',
        media_url: newItem.media_url || '',
        status: newItem.status || 'draft' as const,
        meta_data: newItem.meta_data || '',
        publish_time: newItem.publish_time || new Date().toISOString(),
        product: newItem.product || '',
        target_customer: newItem.target_customer || '',
        goals: newItem.goals || '',
        article_route: newItem.article_route || '',
        channel_type: newItem.channel_type || 'blog' as const
      };

      const response = await contentPlanService.createContentPlan(createRequest);
      
      if (response.success) {
        setPlanItems(prev => [...prev, response.data]);
        setShowCreateItem(false);
      } else {
        setError('Không thể tạo content plan mới');
      }
    } catch (error) {
      console.error('Failed to create content plan:', error);
      setError(error instanceof Error ? error.message : 'Không thể tạo content plan mới');
    }
  };

  const handleEditItem = (item: ContentPlanItem) => {
    console.log('Edit item:', item);
    // TODO: Implement edit functionality with API
  };

  const handleDeleteItem = async (item: ContentPlanItem) => {
    try {
      const response = await contentPlanService.deleteContentPlan(item.id);
      
      if (response.success) {
        setPlanItems(prev => prev.filter(i => i.id !== item.id));
      } else {
        setError('Không thể xóa content plan');
      }
    } catch (error) {
      console.error('Failed to delete content plan:', error);
      setError(error instanceof Error ? error.message : 'Không thể xóa content plan');
    }
  };

  const handleImportItems = (importedItems: ContentPlanItem[]) => {
    setPlanItems(prev => [...prev, ...importedItems]);
  };

  const handleShare = (email: string, permission: string, message: string) => {
    console.log('Share with:', { email, permission, message });
    // TODO: Implement sharing functionality
    setShowShareDialog(false);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <AppLayout 
      title="Content Plan Management" 
      subtitle="Quản lý kế hoạch nội dung"
    >
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Header Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Content Plan Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý và theo dõi kế hoạch nội dung marketing
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateItem(true)}
            sx={{ borderRadius: 2 }}
          >
            Thêm Nội Dung
          </Button>
        </Stack>

        {/* Action Buttons */}
        <ContentPlanActions
          planItems={planItems}
          onImport={handleImportItems}
          onShare={() => setShowShareDialog(true)}
        />

        {/* Content Plan Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {planItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng nội dung
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {planItems.filter(item => item.status === 'published').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã đăng
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {planItems.filter(item => item.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã lên lịch
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {planItems.filter(item => item.status === 'draft').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bản nháp
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Data Grid */}
        <ContentPlanDataGrid
          planItems={planItems}
          isLoading={isLoading}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

        {/* Mobile FAB */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => setShowCreateItem(true)}
        >
          <AddIcon />
        </Fab>

        {/* Modals */}
        <AddContentModal
          open={showCreateItem}
          onClose={() => setShowCreateItem(false)}
          onAdd={handleAddContent}
        />

        <ShareModal
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShare}
        />
      </Box>
    </AppLayout>
  );
}

export default function ContentPlanPage() {
  return (
    <ProtectedRoute>
      <ContentPlanContent />
    </ProtectedRoute>
  );
}
