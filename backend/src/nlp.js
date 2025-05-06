/**
 * Aggregated NLP module
 * This file imports and re-exports functionality from modular files
 * for backward compatibility and simplified imports.
 */

// Import utilities from text processing
const {
  preprocessText,
  extractTopics,
  calculateTopicSimilarity,
  extractKeywords,
  extractMeaningfulKeywords,
  generateMatchReason
} = require('./utils/text-processing');

// Import utilities from similarity
const {
  generateEmbedding,
  calculateCosineSimilarity,
  createWeightedText
} = require('./utils/similarity');

// Import recommendation functions
const {
  getCandidatePodcasts,
  rankCandidates,
  generateRecommendations
} = require('./services/recommendations');

// Re-export all functions
module.exports = {
  preprocessText,
  generateEmbedding,
  calculateCosineSimilarity,
  extractKeywords,
  extractMeaningfulKeywords,
  extractTopics,
  calculateTopicSimilarity,
  getCandidatePodcasts,
  rankCandidates,
  generateRecommendations
}; 