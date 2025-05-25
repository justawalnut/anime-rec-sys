import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGenres, updatePreferences } from '@/services/animeService';
import { useAuth } from '@/contexts/AuthContext';

const PreferencesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch available genres
  const {
    data: genres = [],
    isLoading,
    error: genresError,
  } = useQuery<string[]>({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  // Set initially selected genres from user data if available
  useEffect(() => {
    if (user?.favorite_genres?.length) {
      setSelectedGenres(user.favorite_genres.map((g: any) => g.name));
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (genres: string[]) => updatePreferences(genres),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/');
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update preferences');
      setIsSubmitting(false);
    },
  });

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    mutation.mutate(selectedGenres);
  };

  const handleSkip = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (genresError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load genres. Please try again later.
      </Alert>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Select Your Favorite Genres
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          This helps us recommend anime that match your tastes. Select at least 3 genres.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Available Genres
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {genres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  clickable
                  color={selectedGenres.includes(genre) ? 'primary' : 'default'}
                  variant={selectedGenres.includes(genre) ? 'filled' : 'outlined'}
                  onClick={() => handleGenreToggle(genre)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {user?.favorite_genres?.length ? 'Cancel' : 'Skip for Now'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={selectedGenres.length === 0 || isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PreferencesPage;
