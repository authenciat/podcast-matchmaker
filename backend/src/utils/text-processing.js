const natural = require('natural');
const stopword = require('stopword');

// Initialize natural language processing tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// List of common words to be excluded from keyword extraction
const commonWords = new Set([
  'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were',
  'this', 'that', 'these', 'those', 'it', 'they', 'we', 'you', 'he', 'she', 'his', 'her',
  'them', 'their', 'our', 'your', 'its', 'has', 'have', 'had', 'been', 'would', 'could', 
  'should', 'will', 'can', 'may', 'might', 'with', 'from', 'by', 'about', 'all', 'but', 'not',
  'what', 'when', 'where', 'who', 'how', 'why', 'which', 'podcast', 'show', 'episode', 'episodes',
  'season', 'seasons', 'listen', 'listening', 'host', 'hosts', 'guest', 'guests', 'talk', 'talks'
]);

/**
 * Preprocess text for NLP analysis
 * @param {string} text Text to preprocess
 * @returns {string} Preprocessed text
 */
const preprocessText = (text) => {
  if (!text) return '';
  
  // Convert to lowercase and normalize text
  return text.toLowerCase()
    .replace(/<[^>]*>/g, ' ')         // Remove HTML tags
    .replace(/[^\w\s]/g, ' ')         // Remove special characters
    .replace(/\s+/g, ' ').trim();     // Normalize whitespace
};

/**
 * Filter tokens to get meaningful words
 * @param {Array<string>} tokens Raw tokens
 * @returns {Array<string>} Filtered tokens
 */
const filterTokens = (tokens) => {
  if (!tokens || !tokens.length) return [];
  
  // Remove stopwords, short tokens, and numbers
  return stopword.removeStopwords(tokens)
    .filter(token => token.length > 3 && !commonWords.has(token) && isNaN(token));
};

/**
 * Extract topics from text using TF-IDF
 * @param {string} text Text to analyze for topics
 * @param {number} numTopics Number of topics to extract
 * @returns {Array<{term: string, score: number}>} Array of top topics with scores
 */
const extractTopics = (text, numTopics = 10) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }
  
  try {
    // Preprocess text and extract tokens
    const processed = preprocessText(text);
    const tokens = tokenizer.tokenize(processed);
    const significantTokens = filterTokens(tokens);
    
    // Create TF-IDF document
    const tfidf = new TfIdf();
    tfidf.addDocument(significantTokens.join(' '));
    
    // Extract top terms
    const topics = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.term.length > 2) { // Ensure terms are meaningful
        topics.push({
          term: item.term,
          score: item.tfidf
        });
      }
    });
    
    return topics.slice(0, numTopics); // Return top N topics
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
};

/**
 * Extract keywords from text with frequency-based scoring
 * @param {string} text Text to extract keywords from
 * @param {number} limit Maximum number of keywords to return
 * @returns {Array<string>} Array of keywords
 */
const extractKeywords = (text, limit = 10) => {
  if (!text) return [];
  
  try {
    const processed = preprocessText(text);
    const words = processed.split(' ');
    const filteredWords = filterTokens(words);
    
    // Count word frequency
    const wordFreq = {};
    filteredWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Return top keywords by frequency
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
};

/**
 * Extract meaningful keywords from favorite podcasts for search
 * @param {Array<Object>} favoritePodcasts Array of favorite podcasts
 * @param {number} limit Maximum number of keywords to return
 * @returns {string} Space-separated keywords
 */
const extractMeaningfulKeywords = (favoritePodcasts, limit = 8) => {
  if (!favoritePodcasts || !Array.isArray(favoritePodcasts) || favoritePodcasts.length === 0) {
    return '';
  }
  
  try {
    // Extract keywords per podcast first, then combine
    const podcastKeywords = favoritePodcasts.map(podcast => {
      const title = podcast.title || '';
      const description = podcast.description || podcast.description_original || '';
      const combinedText = `${title} ${description} ${description}`; // Weight description higher
      
      return extractKeywords(combinedText, 5); // Get top 5 keywords per podcast
    });
    
    // Count keyword frequency across all podcasts
    const keywordFreq = {};
    podcastKeywords.flat().forEach(word => {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    });
    
    // Weight keywords that appear across multiple podcasts higher
    const weightedKeywords = Object.entries(keywordFreq)
      .sort((a, b) => {
        // Prioritize keywords that appear in multiple podcasts
        const freqDiff = b[1] - a[1];
        return freqDiff !== 0 ? freqDiff : a[0].localeCompare(b[0]);
      })
      .slice(0, limit)
      .map(entry => entry[0]);
    
    return weightedKeywords.join(' ');
  } catch (error) {
    console.error('Error extracting meaningful keywords:', error);
    return '';
  }
};

/**
 * Generate recommendation reason based on similarity factors
 * @param {Object} candidate Candidate podcast
 * @param {Object} mostSimilarPodcast Most similar favorite podcast
 * @param {number} matchScore Similarity score
 * @param {number} topicSimilarity Topic similarity score
 * @returns {string} Explanation for the recommendation
 */
const generateMatchReason = (candidate, mostSimilarPodcast, matchScore, topicSimilarity) => {
  // Validate inputs to prevent "undefined" issues
  if (!mostSimilarPodcast || !mostSimilarPodcast.title) {
    return `Match score: ${Math.round(matchScore * 100)}%. This podcast matches your listening preferences.`;
  }
  
  // Check for genre and keyword overlap
  const candidateGenres = new Set(candidate.genre_ids || []);
  const favoriteGenres = new Set(mostSimilarPodcast.genre_ids || []);
  const commonGenres = [...candidateGenres].filter(g => favoriteGenres.has(g));
  
  const candidateKeywords = extractKeywords(candidate.description || '');
  const favoriteKeywords = extractKeywords(mostSimilarPodcast.description || '');
  const commonKeywords = candidateKeywords.filter(k => favoriteKeywords.includes(k));
  
  // Build explanation
  let reason = `Similar to "${mostSimilarPodcast.title}". `;
  
  if (commonGenres.length > 0) {
    reason += 'Shares the same genre. ';
  }
  
  if (commonKeywords.length > 0) {
    reason += `Discusses similar topics like ${commonKeywords.slice(0, 3).join(', ')}. `;
  }
  
  // Comment on topic similarity
  if (topicSimilarity > 0.4) {
    reason += 'Strong thematic similarity in content. ';
  } else if (topicSimilarity > 0.2) {
    reason += 'Some thematic overlap in content. ';
  }
  
  // Add similarity score context
  if (matchScore > 0.85) {
    reason += 'Very strong content match.';
  } else if (matchScore > 0.7) {
    reason += 'Strong content match.';
  } else if (matchScore > 0.5) {
    reason += 'Moderate content similarity.';
  } else {
    reason += 'Some content similarities.';
  }
  
  return reason;
};

module.exports = {
  preprocessText,
  extractTopics,
  extractKeywords,
  extractMeaningfulKeywords,
  generateMatchReason,
  commonWords
}; 