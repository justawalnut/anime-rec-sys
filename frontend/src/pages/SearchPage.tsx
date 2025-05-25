import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Rating,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Anime } from '../types';
import { searchAnime, getGenres, getAnimeBySort } from '../services/animeService';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'score', label: 'Highest Rated' },
  { value: 'start_date', label: 'Newest' },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const currentQuery = searchParams.get('q') || '';
  const currentGenres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const currentSort = searchParams.get('sort') || 'popularity';

  const { data: genres = [] } = useQuery<string[]>({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery<Anime[]>({
    queryKey: ['search', currentQuery, currentGenres, currentSort],
    queryFn: async () => {
      if (currentQuery) {
        console.log('Searching with:', { query: currentQuery, genres: currentGenres, sort: currentSort });
        return await searchAnime(currentQuery, currentGenres, currentSort);
      } else {
        console.log('Getting anime by sort:', currentSort, 'with genres:', currentGenres);
        return await getAnimeBySort(currentSort, currentGenres);
      }
    },
    enabled: true, // Always enabled to show results based on sort
  });

  const handleSearch = () => {
    console.log('Performing search with input:', inputValue);
    setSearchParams({
      q: inputValue,
      genres: currentGenres.join(','),
      sort: currentSort,
    });
  };

  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(newGenres);
    
    const newParams = new URLSearchParams(searchParams);
    if (newGenres.length > 0) {
      newParams.set('genres', newGenres.join(','));
    } else {
      newParams.delete('genres');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    setSearchParams({
      q: currentQuery,
      genres: currentGenres.join(','),
      sort: newSort,
    });
  };

  const clearFilters = () => {
    setInputValue('');
    setSelectedGenres([]);
    setSortBy('popularity');
    setSearchParams(new URLSearchParams());
  };

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
            {anime.genres?.slice(0, 3).map((genre) => (
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
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search anime..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: inputValue && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setInputValue('')} size="small">
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>

          {(currentQuery || selectedGenres.length > 0 || currentSort !== 'popularity') && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearFilters}
                startIcon={<CloseIcon />}
                size="small"
              >
                Clear All Filters
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Genres
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    onClick={() => handleGenreToggle(genre)}
                    color={selectedGenres.includes(genre) ? 'primary' : 'default'}
                    variant={selectedGenres.includes(genre) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              {currentQuery || selectedGenres.length > 0 ? 'Search Results' : 'Browse Anime'}
              {currentQuery && (
                <Typography component="span" color="text.secondary">
                  {' '}for "{currentQuery}"
                </Typography>
              )}
              {selectedGenres.length > 0 && (
                <Typography component="span" color="text.secondary">
                  {' '}in {selectedGenres.join(', ')}
                </Typography>
              )}
            </Typography>
          </Box>

          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : searchResults.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              {currentQuery || selectedGenres.length > 0
                ? 'No results found. Try adjusting your search or filters.'
                : 'Start searching or select genres to discover anime.'}
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {searchResults.map(renderAnimeCard)}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SearchPage;
