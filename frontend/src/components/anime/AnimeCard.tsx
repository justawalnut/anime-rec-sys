import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Rating } from '@mui/material';
import { Movie as MovieIcon, Star as StarIcon } from '@mui/icons-material';
import { Anime } from '@/types';

interface AnimeCardProps {
  anime: Anime;
  showGenres?: boolean;
  showScore?: boolean;
  elevation?: number;
}

const AnimeCard = ({
  anime,
  showGenres = true,
  showScore = true,
  elevation = 1,
}: AnimeCardProps) => {
  const title = anime.title || 'Unknown Title';
  const score = anime.averageScore ? anime.averageScore / 20 : 0; // Convert 0-100 to 0-5
  
  return (
    <Card 
      elevation={elevation}
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
      <Box 
        component={Link}
        to={`/anime/${anime.id}`}
        sx={{
          position: 'relative',
          paddingTop: '140%',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        {anime.coverImage?.medium || anime.coverImage?.large ? (
          <CardMedia
            component="img"
            image={anime.coverImage.large || anime.coverImage.medium}
            alt={title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MovieIcon sx={{ fontSize: 60, color: 'grey.500' }} />
          </Box>
        )}
        
        {/* Score Badge */}
        {showScore && anime.averageScore && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'common.white',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <StarIcon color="warning" fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.25, fontWeight: 'bold' }}>
              {anime.averageScore / 10}
            </Typography>
          </Box>
        )}
        
        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'common.white',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" noWrap sx={{ flex: 1, mr: 1 }}>
            {anime.status === 'FINISHED' ? 'Completed' : 
             anime.status === 'ONGOING' ? 'Airing' : 
             anime.status === 'NOT_YET_RELEASED' ? 'Not Yet Aired' : 
             anime.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
          </Typography>
          {anime.episodes && (
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
              {anime.episodes} eps
            </Typography>
          )}
        </Box>
      </Box>
      
      <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle2"
          component="h3"
          noWrap
          sx={{
            fontWeight: 'medium',
            mb: 0.5,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {title}
        </Typography>
        
        {showGenres && anime.genres && anime.genres.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto', pt: 1 }}>
            {anime.genres.slice(0, 2).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                sx={{ height: 20, fontSize: '0.6rem' }}
              />
            ))}
          </Box>
        )}
        
        {showScore && anime.averageScore && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Rating
              value={score}
              precision={0.5}
              readOnly
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {anime.averageScore / 10}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimeCard;
