import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('podcastFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFromFavorites = (podcastId) => {
    const newFavorites = favorites.filter(podcast => podcast.id !== podcastId);
    setFavorites(newFavorites);
    localStorage.setItem('podcastFavorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Your Favorite Podcasts</h2>
      
      {favorites.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">You have {favorites.length} favorite podcasts</p>
            <Link 
              to="/recommendations" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Get Recommendations
            </Link>
          </div>
          
          <div className="grid gap-6">
            {favorites.map(podcast => (
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
                      <button
                        onClick={() => removeFromFavorites(podcast.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                      >
                        Remove from Favorites
                      </button>
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
        </>
      ) : (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't added any podcasts to your favorites yet.</p>
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

export default FavoritesPage; 