import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  Stack,
} from '@mui/material';
import { getRecommendations, getPopularAnime } from '../services/animeService';
import { useAuth } from '../contexts/AuthContext';
import { Anime } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: recommendations, isLoading: isLoadingRecommendations, error: recommendationsError } = useQuery<Anime[]>({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    enabled: isAuthenticated,
  });

  const { data: trendingAnime, isLoading: isLoadingTrending, error: trendingError } = useQuery<Anime[]>({
    queryKey: ['trending'],
    queryFn: () => getPopularAnime(),
  });

  const renderAnimeCard = (anime: Anime) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <Box sx={{ position: 'relative', paddingTop: '140%' }}>
          <CardMedia
            component="img"
            image={anime.coverImage.large}
            alt={anime.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {anime.averageScore && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Rating
                value={anime.averageScore / 20}
                precision={0.5}
                size="small"
                readOnly
                sx={{ color: 'gold' }}
              />
              <Typography variant="caption">
                {(anime.averageScore / 10).toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              height: '2.4em',
            }}
          >
            {anime.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {anime.genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              />
            ))}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.8rem',
              lineHeight: 1.4,
            }}
          >
            {anime.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            variant="contained"
            fullWidth
            onClick={() => navigate(`/anime/${anime.id}`)}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7))',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Discover Your Next Favorite Anime
          </Typography>
          <Typography variant="h5" paragraph>
            Get personalized recommendations based on your preferences and watch history
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/search')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            Explore Anime
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Recommendations Section */}
        {isAuthenticated && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recommended for You
            </Typography>
            {isLoadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recommendationsError ? (
              <Alert severity="error">
                Failed to load recommendations. Please try again later.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {recommendations?.map(renderAnimeCard)}
              </Grid>
            )}
          </Box>
        )}

        {/* Trending Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Trending Now
          </Typography>
          {isLoadingTrending ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : trendingError ? (
            <Alert severity="error">
              Failed to load trending anime. Please try again later.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {trendingAnime?.map(renderAnimeCard)}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
