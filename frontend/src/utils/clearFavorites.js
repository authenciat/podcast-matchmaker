/**
 * Utility function to clear podcast favorites from localStorage
 * This can be used to resolve issues with corrupted data
 */
export const clearPodcastFavorites = () => {
  try {
    // Remove the favorites from localStorage
    localStorage.removeItem('podcastFavorites');
    console.log('Successfully cleared podcast favorites from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing podcast favorites:', error);
    return false;
  }
};

/**
 * Utility function to inspect current podcast favorites in localStorage
 * Useful for debugging purposes
 */
export const inspectPodcastFavorites = () => {
  try {
    const savedFavorites = localStorage.getItem('podcastFavorites');
    if (!savedFavorites) {
      console.log('No podcast favorites found in localStorage');
      return null;
    }
    
    const parsedFavorites = JSON.parse(savedFavorites);
    console.log('Current podcast favorites:', parsedFavorites);
    
    // Check for data quality issues
    const issuesFound = parsedFavorites.filter(podcast => 
      !podcast.id || !podcast.title || !podcast.description
    );
    
    if (issuesFound.length > 0) {
      console.warn('Issues found with podcast favorites data:', issuesFound);
    } else {
      console.log('No issues found with podcast favorites data');
    }
    
    return parsedFavorites;
  } catch (error) {
    console.error('Error inspecting podcast favorites:', error);
    return null;
  }
};

// Export both functions
export default {
  clearPodcastFavorites,
  inspectPodcastFavorites
}; 