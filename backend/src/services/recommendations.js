const { 
  extractTopics, 
  extractMeaningfulKeywords, 
  generateMatchReason 
} = require('../utils/text-processing');

const {
  generateEmbedding,
  calculateCosineSimilarity,
  calculateTopicSimilarity,
  createWeightedText,
  WEIGHTS
} = require('../utils/similarity');

const { generateDiverseQueries } = require('../utils/search-util');

/**
 * Get candidate podcasts for recommendations with optimized API usage
 * @param {Array<Object>} favoritePodcasts User's favorite podcasts
 * @param {Object} apiClient Axios instance configured for Listen Notes API
 * @returns {Promise<Array<Object>>} Array of candidate podcasts
 */
const getCandidatePodcasts = async (favoritePodcasts, apiClient) => {
  if (!favoritePodcasts || favoritePodcasts.length === 0) {
    return [];
  }
  
  // Extract genres from favorite podcasts
  const genres = [...new Set(favoritePodcasts.flatMap(p => p.genre_ids || []))];
  
  // Extract IDs to exclude from recommendations
  const favoriteIds = favoritePodcasts.map(p => p.id);
  
  // Get publishers to filter out from keywords
  const publishersToFilter = new Set(
    favoritePodcasts
      .map(p => p.publisher || p.publisher_original)
      .filter(Boolean)
      .map(p => p.toLowerCase())
  );
  
  // Store all candidates
  const candidates = [];
  
  // Helper function to execute API calls safely
  const fetchSafely = async (endpoint, params, logMsg) => {
    try {
      const response = await apiClient.get(endpoint, { params });
      if (response.data) {
        const results = endpoint === 'search' ? response.data.results : 
                      endpoint === 'best_podcasts' ? response.data.podcasts :
                      response.data.similar_podcasts;
                      
        if (results && results.length) {
          console.log(`Found ${results.length} podcasts for ${logMsg}`);
          candidates.push(...results);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error in ${logMsg}:`, error.message);
      return false;
    }
  };

  // STRATEGY 1: Start with highest priority genre-based calls (most reliable)
  // Process only top 2 genres to reduce API calls
  const genresToProcess = genres.slice(0, 2);
  
  for (const genreId of genresToProcess) {
    await fetchSafely('best_podcasts', { 
      genre_id: genreId, 
      page_size: 20,
      sort: 'listen_score' 
    }, `curated podcasts for genre ${genreId}`);
  }
  
  // STRATEGY 2: Always use content-based search regardless of candidate count
  // Get diverse queries with higher priority on content matching
  const diverseQueries = generateDiverseQueries(favoritePodcasts);
  console.log(`Generated ${diverseQueries.length} content-based search queries`);
  
  // Run all available content queries (max 2-3 as limited by search-util.js)
  for (const queryParams of diverseQueries) {
    // Modify query to only search in descriptions
    const modifiedParams = {
      ...queryParams,
      only_in: 'description'
    };
    
    await fetchSafely('search', modifiedParams, `content query: ${queryParams.q}`);
  }
  
  // Remove duplicates by podcast ID
  const uniqueCandidates = [];
  const seenIds = new Set();
  
  for (const podcast of candidates) {
    if (!seenIds.has(podcast.id) && !favoriteIds.includes(podcast.id)) {
      seenIds.add(podcast.id);
      uniqueCandidates.push(podcast);
    }
  }
  
  console.log(`Found ${uniqueCandidates.length} unique candidate podcasts for recommendation`);
  return uniqueCandidates;
};

/**
 * Rank candidates based on similarity to favorites
 * @param {Array<Object>} favoritePodcasts User's favorite podcasts
 * @param {Array<Object>} candidatePodcasts Potential recommendation candidates
 * @returns {Promise<Array<Object>>} Ranked recommendations with explanations
 */
const rankCandidates = async (favoritePodcasts, candidatePodcasts) => {
  // Validate inputs
  if (!favoritePodcasts?.length || !candidatePodcasts?.length) {
    console.error('Invalid inputs to rankCandidates');
    return [];
  }
  
  // Generate embeddings for favorite podcasts with weighted text
  const favoriteEmbeddings = await Promise.all(
    favoritePodcasts.map(async podcast => {
      const weightedText = createWeightedText(podcast);
      const description = podcast.description || podcast.description_original || '';
      
      return {
        podcast,
        embedding: await generateEmbedding(weightedText || 'podcast content'),
        topics: extractTopics(description, 15)
      };
    })
  );
  
  // Process each candidate and calculate similarity
  const rankedCandidates = await Promise.all(
    candidatePodcasts.map(async candidate => {
      // Generate embedding and topics for candidate
      const weightedText = createWeightedText(candidate);
      const description = candidate.description || candidate.description_original || '';
      const candidateEmbedding = await generateEmbedding(weightedText || 'podcast content');
      const candidateTopics = extractTopics(description, 15);
      
      // Calculate similarity with each favorite podcast
      const similarities = favoriteEmbeddings.map(fav => {
        // Calculate similarity scores
        const semanticScore = calculateCosineSimilarity(fav.embedding, candidateEmbedding);
        const topicScore = calculateTopicSimilarity(fav.topics, candidateTopics);
        const combinedScore = (semanticScore * 0.7) + (topicScore * WEIGHTS.TOPIC_MATCH * 0.3);
        
        return {
          favoriteId: fav.podcast.id,
          favoritePodcast: fav.podcast,
          semanticScore,
          topicScore,
          score: combinedScore
        };
      });
      
      // Calculate average similarity and find most similar podcast
      const avgSimilarity = similarities.reduce((sum, item) => sum + item.score, 0) / similarities.length;
      const mostSimilar = similarities.reduce((max, item) => item.score > max.score ? item : max, similarities[0]);
      
      return {
        podcast: candidate,
        similarityScore: avgSimilarity,
        mostSimilarPodcastId: mostSimilar.favoriteId,
        mostSimilarPodcast: mostSimilar.favoritePodcast,
        semanticScore: mostSimilar.semanticScore,
        topicScore: mostSimilar.topicScore,
        matchScore: mostSimilar.score
      };
    })
  );
  
  // Sort by similarity score (highest first)
  return rankedCandidates.sort((a, b) => b.similarityScore - a.similarityScore);
};

/**
 * Main function to generate recommendations
 * @param {Array<Object>} favorites User's favorite podcasts
 * @param {Array<Object>} candidates Candidate podcasts to rank
 * @returns {Promise<Array<Object>>} Final recommendations with explanations
 */
const generateRecommendations = async (favorites, candidates) => {
  if (!favorites?.length || !candidates?.length) {
    console.error("Missing required inputs for recommendations");
    return [];
  }
  
  try {
    // Rank candidates by similarity
    const rankedCandidates = await rankCandidates(favorites, candidates);
    
    if (!rankedCandidates?.length) {
      return [];
    }
    
    // Generate final recommendations with explanations
    const recommendations = rankedCandidates
      .map(candidate => {
        if (!candidate.podcast || !candidate.mostSimilarPodcast) {
          return null;
        }
        
        return {
          podcast: candidate.podcast,
          similarity_score: candidate.matchScore,
          semantic_score: candidate.semanticScore,
          topic_score: candidate.topicScore,
          reason: generateMatchReason(
            candidate.podcast, 
            candidate.mostSimilarPodcast, 
            candidate.semanticScore,
            candidate.topicScore
          ),
          most_similar_to: candidate.mostSimilarPodcastId
        };
      })
      .filter(Boolean);
    
    return recommendations.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    console.error("Error in generateRecommendations:", error);
    return [];
  }
};

/**
 * Helper function to standardize favorite podcast data
 * @param {Array<Object>} favorites Raw favorite podcasts data
 * @returns {Array<Object>} Standardized favorite podcasts
 */
const standardizeFavorites = (favorites) => {
  if (!Array.isArray(favorites) || favorites.length === 0) {
    return [];
  }
  
  return favorites.map(podcast => ({
    ...podcast,
    // Ensure standardized field names are present
    title: podcast.title || podcast.title_original || 'Unknown Podcast',
    description: podcast.description || podcast.description_original || 'No description available',
    publisher: podcast.publisher || podcast.publisher_original || 'Unknown Publisher',
    // Keep original fields too
    title_original: podcast.title_original,
    description_original: podcast.description_original,
    publisher_original: podcast.publisher_original
  }));
};

module.exports = {
  getCandidatePodcasts,
  rankCandidates,
  generateRecommendations,
  standardizeFavorites
}; 