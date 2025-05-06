/**
 * Utilities for enhanced podcast search
 */
const { extractTopics, extractKeywords } = require('./text-processing');

/**
 * Generate diverse search queries based on podcast content themes
 * @param {Array<Object>} podcasts Array of podcasts
 * @returns {Array<Object>} Array of search queries with params
 */
const generateDiverseQueries = (podcasts) => {
  if (!podcasts || podcasts.length === 0) {
    return [];
  }
  
  try {
    // Create a combined set of content-focused queries
    const allQueries = [];
    
    // Get publisher information for filtering
    const publishersToFilter = new Set(
      podcasts
        .map(p => p.publisher || p.publisher_original)
        .filter(Boolean)
        .flatMap(p => p.toLowerCase().split(/\s+/))
    );
    
    // STRATEGY 1: Extract single most important theme (most likely to succeed)
    const themes = extractThemesFromPodcasts(podcasts);
    if (themes.length > 0) {
      allQueries.push({
        q: themes[0],
        type: 'podcast',
        sort_by_date: 0,
        page_size: 20, // Increased page size to get more results per call
        only_in: 'description',
        safe_mode: 0
      });
    }
    
    // STRATEGY 2: Extract most common meaningful keyword across all podcasts
    const descriptionTexts = podcasts.map(p => p.description || p.description_original || '').join(' ');
    const keywords = extractKeywords(descriptionTexts, 10)
      .filter(kw => kw && kw.length > 3 && !publishersToFilter.has(kw.toLowerCase()));
    
    if (keywords.length > 0) {
      allQueries.push({
        q: keywords[0], // Use the top keyword
        type: 'podcast',
        sort_by_date: 0,
        page_size: 20, // Increased page size
        only_in: 'description',
        safe_mode: 0
      });
    }
    
    // STRATEGY 3 (Fallback): If we have two themes, use the second one too
    if (themes.length > 1) {
      allQueries.push({
        q: themes[1],
        type: 'podcast',
        sort_by_date: 0,
        page_size: 20,
        only_in: 'description',
        safe_mode: 0
      });
    }
    
    // Remove duplicate queries and return
    return removeDuplicateQueries(allQueries);
  } catch (error) {
    console.error('Error generating diverse queries:', error.message);
    return [];
  }
};

/**
 * Extract themes from podcasts (using descriptions only)
 * @param {Array<Object>} podcasts Array of podcasts
 * @returns {Array<string>} Array of themes
 */
const extractThemesFromPodcasts = (podcasts) => {
  // Extract topics from podcast descriptions only
  const allTopics = podcasts.flatMap(podcast => {
    const descriptionText = podcast.description || podcast.description_original || '';
    return extractTopics(descriptionText, 10).map(topic => topic.term);
  });
  
  // Count topic frequencies
  const topicFrequency = {};
  allTopics.forEach(topic => {
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });
  
  // Get top themes (topics mentioned in multiple podcasts)
  return Object.entries(topicFrequency)
    .filter(([_, count]) => count > 1) // Topics that appear in multiple podcasts
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 3) // Take top 3
    .map(([topic]) => topic);
};

/**
 * Extract pairs of genres that often appear together
 * @param {Array<Object>} podcasts Array of podcasts
 * @returns {Array<Array<number>>} Array of genre ID pairs
 */
const extractGenrePairs = (podcasts) => {
  // Get genre frequencies from podcasts
  const genreMap = new Map();
  podcasts.forEach(podcast => {
    const genreIds = podcast.genre_ids || [];
    genreIds.forEach(genreId => {
      genreMap.set(genreId, (genreMap.get(genreId) || 0) + 1);
    });
  });
  
  // Get most common genres
  const commonGenres = [...genreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2) // Only take top 2 to reduce API calls
    .map(([genreId]) => genreId);
  
  // Just return individual genres, not pairs
  // This reduces API call complexity
  return commonGenres.map(genre => [genre]);
};

/**
 * Extract unique publishers from podcasts
 * @param {Array<Object>} podcasts Array of podcasts
 * @returns {Array<string>} Array of unique publishers
 */
const extractUniquePublishers = (podcasts) => {
  // Get unique publishers, filtering out null/undefined values
  const publishers = podcasts
    .map(podcast => podcast.publisher || podcast.publisher_original)
    .filter(Boolean);
  
  return [...new Set(publishers)].slice(0, 1); // Only return top 1 to reduce API calls
};

/**
 * Remove duplicate queries
 * @param {Array<Object>} queries Array of query objects
 * @returns {Array<Object>} Array of unique query objects
 */
const removeDuplicateQueries = (queries) => {
  const seen = new Set();
  return queries.filter(query => {
    const key = JSON.stringify(query);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = {
  generateDiverseQueries
}; 