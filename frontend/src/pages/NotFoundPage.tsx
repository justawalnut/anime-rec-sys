import { Button, Container, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      py: 4,
    }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h1"
          component="h1"
          color="primary"
          sx={{
            fontSize: '8rem',
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </Typography>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2 }}>
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '600px' }}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable. Let's get you back on track!
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
          sx={{
            mt: 2,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 118, 255, 0.23)',
            },
          }}
        >
          Back to Home
        </Button>
      </motion.div>
      
      <Box sx={{ mt: 6, opacity: 0.7 }}>
        <Typography variant="caption" color="textSecondary">
          Need help? Contact support@animerecs.com
        </Typography>
      </Box>
    </Container>
  );
}
