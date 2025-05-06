import React, { useState } from 'react';
import axios from 'axios';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('podcastFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/podcasts/search`, {
        params: { query: searchQuery }
      });
      
      setSearchResults(response.data.results);
    } catch (err) {
      setError('Failed to search podcasts. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const normalizePodcastData = (podcast) => {
    // Convert search result format to standard format expected by recommendation engine
    return {
      id: podcast.id,
      title: podcast.title_original || podcast.title || 'Unknown Podcast',
      description: podcast.description_original || podcast.description || '',
      publisher: podcast.publisher_original || podcast.publisher || 'Unknown Publisher',
      thumbnail: podcast.thumbnail || podcast.image || '',
      website: podcast.website || podcast.listennotes_url || '',
      genre_ids: podcast.genre_ids || [],
      explicit_content: podcast.explicit_content || false,
      listennotes_url: podcast.listennotes_url || '',
      // Preserve other fields that might be needed
      ...podcast
    };
  };

  const addToFavorites = (podcast) => {
    console.log('Original podcast data:', podcast);
    
    // Normalize the podcast data to ensure it has the correct fields
    const normalizedPodcast = normalizePodcastData(podcast);
    console.log('Normalized podcast data:', normalizedPodcast);
    
    const newFavorites = [...favorites];
    
    // Check if podcast is already in favorites
    const existingIndex = newFavorites.findIndex(p => p.id === normalizedPodcast.id);
    
    if (existingIndex === -1) {
      // Add to favorites if not already present
      newFavorites.push(normalizedPodcast);
      setFavorites(newFavorites);
      localStorage.setItem('podcastFavorites', JSON.stringify(newFavorites));
      alert('Podcast added to favorites!');
    } else {
      alert('This podcast is already in your favorites.');
    }
  };

  const removeFromFavorites = (podcastId) => {
    const newFavorites = favorites.filter(podcast => podcast.id !== podcastId);
    setFavorites(newFavorites);
    localStorage.setItem('podcastFavorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (podcastId) => {
    return favorites.some(podcast => podcast.id === podcastId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Search Podcasts</h2>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for podcasts..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 ? (
        <div className="grid gap-6">
          {searchResults.map(podcast => (
            <div key={podcast.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 flex justify-center">
                  <img 
                    src={podcast.thumbnail || 'https://via.placeholder.com/150'} 
                    alt={podcast.title_original}
                    className="h-48 w-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{podcast.title_original}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">{podcast.description_original}</p>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-4">
                      <strong>Publisher:</strong> {podcast.publisher_original}
                    </span>
                    {podcast.explicit_content && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                        Explicit
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {podcast.genre_ids?.slice(0, 3).map(genre => (
                      <span key={genre} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    {isFavorite(podcast.id) ? (
                      <button
                        onClick={() => removeFromFavorites(podcast.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                      >
                        Remove from Favorites
                      </button>
                    ) : (
                      <button
                        onClick={() => addToFavorites(podcast)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200"
                      >
                        Add to Favorites
                      </button>
                    )}
                    <a 
                      href={podcast.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition duration-200"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
            {searchQuery ? 'No podcasts found. Try a different search term.' : 'Search for podcasts to see results.'}
          </div>
        )
      )}
    </div>
  );
};

export default SearchPage; 