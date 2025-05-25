import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  PlaylistAddCheck as WatchedIcon, 
  PlaylistRemove as RemoveIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { getWatchlist } from '@/services/userService';

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
      id={`watchlist-tabpanel-${index}`}
      aria-labelledby={`watchlist-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `watchlist-tab-${index}`,
    'aria-controls': `watchlist-tabpanel-${index}`,
  };
}

export default function WatchlistPage() {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);

  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, anime: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnime(anime);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnime(null);
  };

  const handleMarkAsWatched = () => {
    // Implement mark as watched logic
    console.log('Mark as watched:', selectedAnime);
    handleMenuClose();
  };

  const handleRemoveFromList = () => {
    // Implement remove from list logic
    console.log('Remove from list:', selectedAnime);
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }


  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading your watchlist. Please try again later.
        </Typography>
      </Box>
    );
  }

  const currentlyWatching = watchlist?.filter((anime: any) => anime.status === 'CURRENT') || [];
  const planningToWatch = watchlist?.filter((anime: any) => anime.status === 'PLANNING') || [];
  const completed = watchlist?.filter((anime: any) => anime.status === 'COMPLETED') || [];
  const onHold = watchlist?.filter((anime: any) => anime.status === 'PAUSED') || [];
  const dropped = watchlist?.filter((anime: any) => anime.status === 'DROPPED') || [];

  const renderAnimeList = (animeList: any[]) => (
    <Grid container spacing={3}>
      {animeList.length > 0 ? (
        animeList.map((anime: any) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea>
                <Box sx={{ position: 'relative', paddingTop: '140%' }}>
                  <CardMedia
                    component="img"
                    image={anime.coverImage?.large || '/placeholder-anime.jpg'}
                    alt={anime.title}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </CardActionArea>
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="subtitle1" noWrap gutterBottom>
                  {anime.title}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Rating
                    value={(anime.averageScore || 0) / 20}
                    precision={0.5}
                    readOnly
                    size="small"
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="body2" color="text.secondary" ml={0.5}>
                    {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}
                  </Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                  {anime.genres?.slice(0, 3).map((genre: string) => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                <Button 
                  size="small" 
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                >
                  Watch
                </Button>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, anime)}
                  aria-label="more options"
                >
                  <MoreVertIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No anime in this list yet.
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Watchlist
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="watchlist tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" {...a11yProps(0)} />
          <Tab 
            label={`Watching (${currentlyWatching.length})`} 
            {...a11yProps(1)} 
            iconPosition="start"
          />
          <Tab 
            label={`Plan to Watch (${planningToWatch.length})`} 
            {...a11yProps(2)} 
            iconPosition="start"
          />
          <Tab 
            label={`Completed (${completed.length})`} 
            {...a11yProps(3)} 
            iconPosition="start"
          />
          <Tab 
            label={`On Hold (${onHold.length})`} 
            {...a11yProps(4)} 
            iconPosition="start"
          />
          <Tab 
            label={`Dropped (${dropped.length})`} 
            {...a11yProps(5)} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        {renderAnimeList(watchlist || [])}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {renderAnimeList(currentlyWatching)}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {renderAnimeList(planningToWatch)}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {renderAnimeList(completed)}
      </TabPanel>
      <TabPanel value={value} index={4}>
        {renderAnimeList(onHold)}
      </TabPanel>
      <TabPanel value={value} index={5}>
        {renderAnimeList(dropped)}
      </TabPanel>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMarkAsWatched}>
          <ListItemIcon>
            <WatchedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Watched</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleRemoveFromList}>
          <ListItemIcon>
            <RemoveIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Remove from List
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
