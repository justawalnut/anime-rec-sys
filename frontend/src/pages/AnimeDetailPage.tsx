import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Typography, Paper, Grid, Rating, Button, Divider, Chip } from '@mui/material';
import { getAnimeById } from '@/services/animeService';

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => id ? getAnimeById(Number(id)) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !anime) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading anime details. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={anime.coverImage?.large || '/placeholder-anime.jpg'}
              alt={anime.title}
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {anime.title}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Rating 
                value={(anime.averageScore || 0) / 20} 
                precision={0.5} 
                readOnly 
                size="large"
              />
              <Typography variant="body1" ml={1}>
                {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}/10
              </Typography>
              <Typography variant="body2" color="text.secondary" ml={2}>
                {anime.episodes} episodes • {anime.status}
              </Typography>
            </Box>
            
            <Box mb={3}>
              {anime.genres?.map((genre: string) => (
                <Chip 
                  key={genre} 
                  label={genre} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>
                {anime.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
              </Typography>
            </Box>
            
            <Box display="flex" gap={2} mt={4}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
              >
                Add to Watchlist
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
              >
                Rate This Anime
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Additional sections like characters, recommendations, etc. can be added here */}
    </Box>
  );
}
