'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Fab,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  TrendingUp as TrendingUpIcon,
  People as UsersIcon,
  BarChart as BarChartIcon,
  PlayArrow as PlayIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Send as SendIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export default function LandingPage() {
  const [chatInput, setChatInput] = useState('');
  const router = useRouter();

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      router.push('/login');
    }
  };

  const features: FeatureCard[] = [
    {
      icon: <SparklesIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations for your Facebook campaigns based on advanced machine learning algorithms.',
      color: 'primary'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Performance Analytics',
      description: 'Track your campaign performance with detailed analytics and real-time reporting dashboards.',
      color: 'success'
    },
    {
      icon: <UsersIcon sx={{ fontSize: 40 }} />,
      title: 'Audience Targeting',
      description: 'Discover and target the perfect audience for your products with AI-driven audience analysis.',
      color: 'warning'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      title: 'ROI Optimization',
      description: 'Maximize your return on investment with automated bid management and budget optimization.',
      color: 'secondary'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'Famarex transformed our Facebook marketing strategy. Our ROI increased by 300% in just 3 months!',
      avatar: '/api/placeholder/64/64',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'E-commerce Manager',
      company: 'Fashion Forward',
      content: 'The AI insights are incredible. We\'ve discovered audiences we never knew existed.',
      avatar: '/api/placeholder/64/64',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Digital Marketer',
      company: 'Local Biz Co.',
      content: 'Easy to use and incredibly powerful. Our conversion rates have never been better.',
      avatar: '/api/placeholder/64/64',
      rating: 5
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <SparklesIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h5" 
              component="h1" 
              fontWeight="bold"
              sx={{ color: 'text.primary' }}
            >
              Famarex
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" sx={{ color: 'text.primary' }}>Features</Button>
            <Button color="inherit" sx={{ color: 'text.primary' }}>About</Button>
            <Button color="inherit" sx={{ color: 'text.primary' }}>Contact</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Chip 
                    label="🚀 AI-Powered Marketing" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Revolutionize Your{' '}
                    <Box component="span" sx={{ color: 'primary.main' }}>
                      Facebook Marketing
                    </Box>
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6 }}
                  >
                    Harness the power of AI to optimize your Facebook campaigns, 
                    discover high-converting audiences, and maximize your ROI with 
                    intelligent automation.
                  </Typography>
                </Box>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={() => router.push('/login')}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 2
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 2
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Trusted by 10,000+ marketers
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary">
                      <FacebookIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <InstagramIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <TwitterIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    transform: 'rotate(-2deg)',
                    '&:hover': {
                      transform: 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                >
                  <SparklesIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    Famarex AI
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Your Intelligent Marketing Assistant
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          {/* Chat Input Section */}
          <Box sx={{ mt: 8, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                Try Famarex AI Now
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ask me anything about Facebook marketing and see the power of AI in action
              </Typography>
            </Box>
            
            <Paper 
              elevation={4}
              sx={{ 
                p: 2,
                borderRadius: 4,
                border: 2,
                borderColor: 'primary.light',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 6
                }
              }}
            >
              <Box component="form" onSubmit={handleChatSubmit}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ChatIcon color="primary" sx={{ fontSize: 28 }} />
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Ask me anything about Facebook marketing..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: { 
                        fontSize: '1rem',
                        '& input': { py: 1 }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    endIcon={<SendIcon />}
                    disabled={!chatInput.trim()}
                    sx={{ 
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      minWidth: 120
                    }}
                  >
                    Ask AI
                  </Button>
                </Stack>
              </Box>
            </Paper>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ textAlign: 'center', mt: 2 }}
            >
              Try: "How can I improve my Facebook ad performance?" or "Create a campaign strategy for my business"
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
              Powerful Features
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to dominate Facebook marketing with AI-driven insights and automation
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${feature.color}.light`,
                        color: `${feature.color}.main`,
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of satisfied marketers who've transformed their campaigns
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    p: 1
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.7,
                        '&::before': { content: '"', fontSize: '1.5em', color: 'primary.main' },
                        '&::after': { content: '"', fontSize: '1.5em', color: 'primary.main' }
                      }}
                    >
                      {testimonial.content}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={testimonial.avatar}
                        sx={{ width: 48, height: 48 }}
                      >
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
              Ready to Transform Your Marketing?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of marketers who are already using Famarex to dominate Facebook advertising
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Schedule Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => router.push('/login')}
      >
        <SparklesIcon />
      </Fab>
    </Box>
  );
}
