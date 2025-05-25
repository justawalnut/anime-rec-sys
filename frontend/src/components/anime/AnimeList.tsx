import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CardMedia, Chip, Rating, Divider, Button } from '@mui/material';
import { Star as StarIcon, Movie as MovieIcon } from '@mui/icons-material';
import { Anime } from '@/types';

interface AnimeListProps {
  anime: Anime;
}

const AnimeList = ({ anime }: AnimeListProps) => {
  const title = anime.title || 'Unknown Title';
  const score = anime.averageScore ? anime.averageScore / 20 : 0; // Convert 0-100 to 0-5
  
  return (
    <Card 
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
        overflow: 'hidden',
      }}
    >
      <Box 
        component={Link}
        to={`/anime/${anime.id}`}
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: '200px' },
          height: { xs: '280px', sm: 'auto' },
          minHeight: { sm: '100%' },
          textDecoration: 'none',
          color: 'inherit',
          flexShrink: 0,
        }}
      >
        {anime.coverImage?.medium || anime.coverImage?.large ? (
          <CardMedia
            component="img"
            image={anime.coverImage.large || anime.coverImage.medium}
            alt={title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
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
        {anime.averageScore && (
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
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                component="h3"
                variant="h6"
                sx={{
                  mb: 0.5,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                <Chip
                  label={anime.status === 'FINISHED' ? 'Completed' : 
                         anime.status === 'ONGOING' ? 'Airing' : 
                         anime.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                  size="small"
                  variant="outlined"
                />
                {anime.episodes && (
                  <Chip
                    label={`${anime.episodes} ${anime.episodes > 1 ? 'episodes' : 'episode'}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {anime.averageScore && (
                  <Chip
                    icon={<StarIcon color="warning" fontSize="small" />}
                    label={`${anime.averageScore / 10}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <Rating
              value={score}
              precision={0.5}
              readOnly
              size="small"
              sx={{ ml: 1, mt: 0.5 }}
            />
          </Box>
          
          {anime.genres && anime.genres.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {anime.genres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 1.5,
            }}
            dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }}
          />
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to={`/anime/${anime.id}`}
              >
                View Details
              </Button>
              <Button variant="outlined" size="small">
                Add to List
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {anime.startDate?.year || 'TBA'}
              {anime.endDate?.year && anime.startDate?.year !== anime.endDate?.year 
                ? ` - ${anime.endDate.year}` 
                : ''}
            </Typography>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default AnimeList;
