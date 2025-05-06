import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { clearPodcastFavorites, inspectPodcastFavorites } from '../utils/clearFavorites';

const RecommendationsPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      const savedFavorites = localStorage.getItem('podcastFavorites');
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          console.log('Loaded favorites:', parsedFavorites);
          setFavorites(parsedFavorites);
        } catch (err) {
          console.error('Error parsing favorites from localStorage:', err);
          localStorage.removeItem('podcastFavorites'); // Clear corrupted data
        }
      }
    };
    
    loadFavorites();
  }, []);

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

  const getRecommendations = async () => {
    if (favorites.length === 0) {
      setError('You need to add podcasts to your favorites first to get recommendations.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setProcessingStage('Starting recommendation engine...');
    
    const startTime = Date.now();
    
    try {
      // Debug log to check favorite podcast data
      console.log('Sending favorites to recommendation API:', favorites);
      
      // Check for missing title or description
      const missingData = favorites.filter(podcast => !podcast.title || !podcast.description);
      if (missingData.length > 0) {
        console.warn('Some favorites are missing title or description:', missingData);
      }
      
      // Set up a timer to update the processing stage message
      const processingMessages = [
        'Collecting candidate podcasts...',
        'Analyzing content similarities...',
        'Generating embeddings...',
        'Calculating recommendation scores...',
        'Finding the best matches for you...',
        'Almost there! Finalizing recommendations...'
      ];
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (messageIndex < processingMessages.length) {
          setProcessingStage(processingMessages[messageIndex]);
          messageIndex++;
        }
      }, 3000);
      
      const response = await axios.post('http://localhost:5000/api/recommendations', {
        favorites
      });
      
      clearInterval(messageInterval);
      setProcessingTime((Date.now() - startTime) / 1000); // Convert to seconds
      
      // Debug log to check recommendation results
      console.log('Received recommendations:', response.data.recommendations);
      
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Full error object:', err);
      setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
      console.error('Recommendations error:', err);
    } finally {
      setLoading(false);
      setProcessingStage('');
    }
  };

  const addToFavorites = (podcast) => {
    // Debug log
    console.log('Adding podcast to favorites:', podcast);
    
    // Normalize the podcast data to ensure it has the correct fields
    const normalizedPodcast = normalizePodcastData(podcast);
    console.log('Normalized podcast data:', normalizedPodcast);
    
    // Validate podcast object
    if (!normalizedPodcast.title) {
      console.error('Cannot add podcast without title to favorites');
      return;
    }
    
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

  const isFavorite = (podcastId) => {
    return favorites.some(podcast => podcast.id === podcastId);
  };

  // Clear favorites from localStorage
  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all your favorites? This cannot be undone.')) {
      clearPodcastFavorites();
      setFavorites([]);
      setRecommendations([]);
    }
  };

  // Inspect favorites for debugging
  const handleInspectFavorites = () => {
    inspectPodcastFavorites();
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Fix existing favorites
  const fixExistingFavorites = () => {
    const fixedFavorites = favorites.map(podcast => normalizePodcastData(podcast));
    console.log('Fixed favorites:', fixedFavorites);
    setFavorites(fixedFavorites);
    localStorage.setItem('podcastFavorites', JSON.stringify(fixedFavorites));
    alert('Fixed podcast favorites data!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Podcast Recommendations</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Get AI-Powered Podcast Recommendations</h3>
            <p className="text-gray-600">
              {favorites.length > 0 
                ? `Based on your ${favorites.length} favorite podcasts`
                : 'Add podcasts to favorites to get recommendations'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/favorites" 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition duration-200 text-center"
            >
              View Favorites
            </Link>
            <button
              onClick={getRecommendations}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              disabled={loading || favorites.length === 0}
            >
              {loading ? 'Finding matches...' : 'Get Recommendations'}
            </button>
          </div>
        </div>
        
        {/* Debug Controls - only visible in debug mode */}
        <div className="mt-4">
          <button 
            onClick={toggleDebugMode} 
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {debugMode ? 'Hide Debug Options' : 'Show Debug Options'}
          </button>
          
          {debugMode && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Debug Controls</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInspectFavorites}
                  className="bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded"
                >
                  Inspect Favorites
                </button>
                <button
                  onClick={handleClearFavorites}
                  className="bg-red-100 text-red-800 px-3 py-1 text-xs rounded"
                >
                  Clear All Favorites
                </button>
                <button
                  onClick={fixExistingFavorites}
                  className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded"
                >
                  Fix Existing Favorites
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="text-center p-8 bg-blue-50 rounded-lg shadow-md">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-blue-800 mb-2">{processingStage}</p>
          <p className="text-gray-600">This may take a moment while we analyze your favorites and find the best matches.</p>
        </div>
      )}
      
      {recommendations.length > 0 && (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-blue-800">Your Recommended Podcasts</h3>
            {processingTime && (
              <p className="text-sm text-gray-500">Generated in {processingTime.toFixed(1)} seconds</p>
            )}
          </div>
          
          {recommendations.map(item => (
            <div key={item.podcast.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 flex justify-center items-center p-4 md:p-6 bg-gray-50">
                  <img 
                    src={item.podcast.thumbnail || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={item.podcast.title || 'Untitled Podcast'}
                    className="h-32 w-32 md:h-40 md:w-40 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="text-xl font-semibold mb-2">{item.podcast.title || 'Untitled Podcast'}</h3>
                    <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full whitespace-nowrap">
                      {Math.round(item.similarity_score * 100)}% Match
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Publisher:</span> {item.podcast.publisher || 'Unknown Publisher'}
                    {item.podcast.explicit_content && (
                      <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                        Explicit
                      </span>
                    )}
                  </p>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">{item.podcast.description || 'No description available'}</p>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <h4 className="font-semibold text-yellow-800">Why we recommend this:</h4>
                    <p className="text-yellow-800">{item.reason || 'Based on your listening preferences'}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {!isFavorite(item.podcast.id) && (
                      <button
                        onClick={() => addToFavorites(item.podcast)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200"
                      >
                        Add to Favorites
                      </button>
                    )}
                    {item.podcast.website && (
                      <a 
                        href={item.podcast.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition duration-200"
                      >
                        Visit Website
                      </a>
                    )}
                    {item.podcast.listennotes_url && (
                      <a 
                        href={item.podcast.listennotes_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 transition duration-200"
                      >
                        Listen Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && recommendations.length === 0 && favorites.length > 0 && !error && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Click the "Get Recommendations" button to find podcasts you might like.</p>
        </div>
      )}
      
      {!loading && favorites.length === 0 && !error && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You need to add podcasts to your favorites first.</p>
          <Link 
            to="/search" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200 inline-block"
          >
            Search Podcasts
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage; 