const { HfInference } = require('@huggingface/inference');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config/.env') });

// Get API key from environment variables
const API_KEY = process.env.HUGGING_FACE_API_KEY;

// Create Hugging Face inference instance
const hf = new HfInference(API_KEY);
const MODEL_ID = "sentence-transformers/all-mpnet-base-v2"; // Using a more powerful model

// Cache for embeddings to avoid repeated API calls
const embeddingCache = new Map();

// Configuration for recommendation weights
const WEIGHTS = {
  TITLE: 2.0,        // Title is weighted higher as it's a strong signal
  DESCRIPTION: 3.0,  // Description gets the highest weight as it has the most content
  PUBLISHER: 0.5,    // Publisher is a weaker signal
  TOPIC_MATCH: 1.5   // Topic match gets a good weight to boost thematic similarity
};

/**
 * Generate text embeddings using Hugging Face model
 * @param {string} text Text to generate embeddings for
 * @returns {Promise<Array<number>>} Vector embedding
 */
const generateEmbedding = async (text) => {
  if (!text) {
    return new Array(384).fill(0); // Return zero vector if no text
  }
  
  try {
    // Check cache first
    const cacheKey = text.substring(0, 100); // Use first 100 chars as key
    if (embeddingCache.has(cacheKey)) {
      return embeddingCache.get(cacheKey);
    }
    
    const response = await hf.featureExtraction({
      model: MODEL_ID,
      inputs: text.slice(0, 8000) // Limit input size to prevent errors
    });
    
    if (Array.isArray(response) && response.length > 0) {
      // Cache the result
      embeddingCache.set(cacheKey, response);
      return response;
    }
    
    console.warn("Invalid response from Hugging Face API");
    return new Array(384).fill(0);
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return new Array(384).fill(0); // Return zero vector on error
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array<number>} vec1 First vector
 * @param {Array<number>} vec2 Second vector
 * @returns {number} Similarity score (0-1)
 */
const calculateCosineSimilarity = (vec1, vec2) => {
  // Validate inputs
  if (!Array.isArray(vec1) || !Array.isArray(vec2) || 
      vec1.length === 0 || vec2.length === 0 || 
      vec1.length !== vec2.length) {
    return 0;
  }
  
  try {
    // Calculate dot product
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    
    // Calculate magnitudes
    const magnitudeA = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vec2.reduce((sum, b) => sum + b * b, 0));
    
    // Handle zero magnitudes
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    // Calculate cosine similarity
    return dotProduct / (magnitudeA * magnitudeB);
  } catch (error) {
    console.error("Error calculating similarity:", error.message);
    return 0;
  }
};

/**
 * Calculate topic similarity between two sets of topics
 * @param {Array<{term: string, score: number}>} topicsA First set of topics
 * @param {Array<{term: string, score: number}>} topicsB Second set of topics
 * @returns {number} Similarity score (0-1)
 */
const calculateTopicSimilarity = (topicsA, topicsB) => {
  if (!topicsA || !topicsB || topicsA.length === 0 || topicsB.length === 0) {
    return 0;
  }
  
  try {
    // Create maps of terms to scores for efficient lookup
    const topicMapA = new Map(topicsA.map(t => [t.term, t.score]));
    const topicMapB = new Map(topicsB.map(t => [t.term, t.score]));
    
    // Find common terms
    let matchScore = 0;
    let totalPossibleScore = 0;
    
    // Evaluate terms from A against B
    for (const [term, scoreA] of topicMapA.entries()) {
      totalPossibleScore += scoreA;
      if (topicMapB.has(term)) {
        // If both have the term, add the minimum of the two scores
        matchScore += Math.min(scoreA, topicMapB.get(term));
      }
    }
    
    // Normalize to 0-1 range
    return totalPossibleScore > 0 ? matchScore / totalPossibleScore : 0;
  } catch (error) {
    console.error("Error calculating topic similarity:", error.message);
    return 0;
  }
};

/**
 * Create weighted text for podcast embedding
 * @param {Object} podcast Podcast to create weighted text for
 * @returns {string} Weighted text for embedding
 */
const createWeightedText = (podcast) => {
  if (!podcast) return '';
  
  // Default to empty strings if fields are missing
  const title = podcast.title || podcast.title_original || '';
  const description = podcast.description || podcast.description_original || '';
  const publisher = podcast.publisher || podcast.publisher_original || '';
  
  // Create a weighted representation by repeating important fields
  return `${title} ${title} ${description} ${description} ${description} ${publisher}`;
};

module.exports = {
  generateEmbedding,
  calculateCosineSimilarity,
  calculateTopicSimilarity,
  createWeightedText,
  WEIGHTS
}; 