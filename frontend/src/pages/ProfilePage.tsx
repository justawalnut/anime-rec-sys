import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  CardActions,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlaylistAdd as PlaylistAddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { 
  getUserProfile, 
  getWatchlist, 
  getFavorites, 
  getReviews, 
  getUserStats,
  toggleFavorite,
  addReview,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  getWatchedAnime,
} from '@/services/userService';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  total_watched: number;
  total_episodes: number;
  average_rating: number;
  genre_distribution: Record<string, number>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [watchlistMenuAnchor, setWatchlistMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedWatchlistAnime, setSelectedWatchlistAnime] = useState<any>(null);
  const [watchlistStatus, setWatchlistStatus] = useState<string>('PLANNING');

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: getUserProfile,
    enabled: !!user?.id,
  });

  const { data: watchlist, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    enabled: value === 1,
  });

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: value === 2,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews,
    enabled: value === 3,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled: value === 4,
  });

  const { data: watchedAnime, isLoading: isLoadingWatched } = useQuery({
    queryKey: ['watchedAnime'],
    queryFn: getWatchedAnime,
    enabled: value === 0,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: ({ animeId, status }: { animeId: number; status: string }) => 
      addToWatchlist(animeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setWatchlistMenuAnchor(null);
    },
  });

  const updateWatchlistMutation = useMutation({
    mutationFn: ({ watchlistId, data }: { watchlistId: string; data: any }) =>
      updateWatchlistItem(watchlistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setWatchlistMenuAnchor(null);
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (watchlistId: string) => removeFromWatchlist(watchlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setWatchlistMenuAnchor(null);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (animeId: number) => toggleFavorite(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleReviewClick = (anime: any) => {
    setSelectedAnime(anime);
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedAnime || !reviewContent || !reviewRating) return;

    try {
      await addReview({
        anime_id: selectedAnime.id,
        title: selectedAnime.title,
        content: reviewContent,
        rating: reviewRating,
      });
      setReviewDialogOpen(false);
      setReviewContent('');
      setReviewRating(null);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleWatchlistMenuOpen = (event: React.MouseEvent<HTMLElement>, anime: any) => {
    setWatchlistMenuAnchor(event.currentTarget);
    setSelectedWatchlistAnime(anime);
  };

  const handleWatchlistMenuClose = () => {
    setWatchlistMenuAnchor(null);
    setSelectedWatchlistAnime(null);
  };

  const handleAddToWatchlist = (status: string) => {
    if (selectedWatchlistAnime) {
      addToWatchlistMutation.mutate({
        animeId: selectedWatchlistAnime.id,
        status,
      });
    }
  };

  const handleUpdateWatchlistStatus = (status: string) => {
    if (selectedWatchlistAnime) {
      updateWatchlistMutation.mutate({
        watchlistId: selectedWatchlistAnime.id,
        data: { status },
      });
    }
  };

  const handleRemoveFromWatchlist = () => {
    if (selectedWatchlistAnime) {
      removeFromWatchlistMutation.mutate(selectedWatchlistAnime.id);
    }
  };

  const renderAnimeCard = (anime: any, showRating = true, showWatchlist = true) => (
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
        <CardActionArea onClick={() => navigate(`/anime/${anime.anime_id}`)}>
          <Box sx={{ position: 'relative', paddingTop: '140%' }}>
            <CardMedia
              component="img"
              image={anime.coverImage?.large || ''}
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
            {showRating && anime.rating && (
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
                  value={anime.rating / 20}
                  precision={0.5}
                  size="small"
                  readOnly
                  sx={{ color: 'gold' }}
                />
                <Typography variant="caption">
                  {(anime.rating / 10).toFixed(1)}
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
              {anime.genres?.slice(0, 3).map((genre: string) => (
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
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteMutation.mutate(anime.anime_id);
            }}
            color={anime.rating >= 8 ? 'primary' : 'default'}
          >
            {anime.rating >= 8 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          {showWatchlist && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleWatchlistMenuOpen(e, anime);
              }}
            >
              <PlaylistAddIcon />
            </IconButton>
          )}
          {showRating && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewClick(anime);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  if (isLoadingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md="auto">
            <Avatar
              src={profile?.avatar || '/default-avatar.png'}
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={12} md>
            <Typography variant="h4" component="h1" gutterBottom>
              {user?.username}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Member since {new Date(user?.created_at || '').toLocaleDateString()}
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <Chip 
                label={`${watchedAnime?.length || 0} Anime`} 
                variant="outlined"
              />
              <Chip 
                label={`${profile?.favorite_genres?.length || 0} Favorite Genres`} 
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button variant="outlined" size="large">
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Watched" />
            <Tab label="Watchlist" />
            <Tab label="Favorites" />
            <Tab label="Reviews" />
            <Tab label="Stats" />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>Recently Watched</Typography>
          {isLoadingWatched ? (
            <CircularProgress />
          ) : watchedAnime?.length > 0 ? (
            <Grid container spacing={3}>
              {watchedAnime.map((anime: any) => renderAnimeCard(anime))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                You haven't watched any anime yet.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/search')}
              >
                Browse Anime
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>Your Watchlist</Typography>
          {isLoadingWatchlist ? (
            <CircularProgress />
          ) : watchlist?.length > 0 ? (
            <Grid container spacing={3}>
              {watchlist.map((anime: any) => renderAnimeCard(anime, false))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Your watchlist is empty. Start adding anime to your watchlist!
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/search')}
              >
                Browse Anime
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>Favorite Anime</Typography>
          {isLoadingFavorites ? (
            <CircularProgress />
          ) : favorites?.length > 0 ? (
            <Grid container spacing={3}>
              {favorites.map((anime: any) => renderAnimeCard(anime))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                You haven't marked any anime as favorites yet.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <Typography variant="h6" gutterBottom>Your Reviews</Typography>
          {isLoadingReviews ? (
            <CircularProgress />
          ) : reviews?.length > 0 ? (
            <List>
              {reviews.map((review: any) => (
                <ListItem
                  key={review.id}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 2,
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={review.anime?.coverImage?.medium} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {review.title}
                        </Typography>
                        <Rating value={review.rating / 20} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {review.content}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                You haven't written any reviews yet.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <Typography variant="h6" gutterBottom>Your Stats</Typography>
          {isLoadingStats ? (
            <CircularProgress />
          ) : stats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Overview</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Anime Watched
                    </Typography>
                    <Typography variant="h4">
                      {stats.total_watched}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Episodes
                    </Typography>
                    <Typography variant="h4">
                      {stats.total_episodes}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Rating
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={stats.average_rating / 20} readOnly precision={0.5} />
                      <Typography variant="h6">
                        {stats.average_rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Genre Distribution</Typography>
                  {Object.entries(stats.genre_distribution).map(([genre, count]) => (
                    <Box key={genre} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">{genre}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} anime
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / stats.total_watched) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No stats available yet.
            </Typography>
          )}
        </TabPanel>
      </Box>

      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {selectedAnime && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{selectedAnime.title}</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Rating
                  value={reviewRating ? reviewRating / 20 : null}
                  onChange={(_, value) => setReviewRating(value ? value * 20 : null)}
                />
              </Box>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Your Review"
            fullWidth
            multiline
            rows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReviewSubmit}
            variant="contained"
            disabled={!reviewContent || !reviewRating}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={watchlistMenuAnchor}
        open={Boolean(watchlistMenuAnchor)}
        onClose={handleWatchlistMenuClose}
      >
        <MenuItem onClick={() => handleAddToWatchlist('PLANNING')}>
          Add to Plan to Watch
        </MenuItem>
        <MenuItem onClick={() => handleAddToWatchlist('CURRENT')}>
          Add to Currently Watching
        </MenuItem>
        <MenuItem onClick={() => handleAddToWatchlist('COMPLETED')}>
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => handleAddToWatchlist('PAUSED')}>
          Add to On Hold
        </MenuItem>
        <MenuItem onClick={() => handleAddToWatchlist('DROPPED')}>
          Add to Dropped
        </MenuItem>
        {selectedWatchlistAnime && (
          <>
            <Divider />
            <MenuItem onClick={handleRemoveFromWatchlist} sx={{ color: 'error.main' }}>
              Remove from Watchlist
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}
