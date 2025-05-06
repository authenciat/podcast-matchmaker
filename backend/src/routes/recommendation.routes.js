const express = require('express');
const { 
  getCandidatePodcasts, 
  generateRecommendations,
  standardizeFavorites
} = require('../services/recommendations');

/**
 * Setup recommendation routes with the API client
 * @param {Object} listenNotesClient - Axios instance for Listen Notes API
 * @returns {Object} Express router with recommendation routes
 */
const setupRecommendationRoutes = (listenNotesClient) => {
  const router = express.Router();

  // Generate recommendations
  router.post('/', async (req, res, next) => {
    try {
      console.log('Received recommendation request');
      const { favorites } = req.body;
      
      // Debug: Check for complete favorite podcast objects
      console.log('Received favorites data:', JSON.stringify(favorites, null, 2));
      
      if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
        return res.status(400).json({ 
          message: 'Favorites list is required and must be an array',
          recommendations: []
        });
      }

      // Standardize favorite podcasts to ensure all required fields are present
      const standardizedFavorites = standardizeFavorites(favorites);
      console.log(`Processing ${standardizedFavorites.length} favorite podcasts`);
      
      // Step 1: Get candidate podcasts based on user's favorites
      const candidates = await getCandidatePodcasts(standardizedFavorites, listenNotesClient);
      
      if (!candidates || candidates.length === 0) {
        return res.status(404).json({ 
          message: 'No potential recommendations found. Try adding more diverse podcasts to your favorites.',
          recommendations: []
        });
      }
      
      console.log(`Found ${candidates.length} candidate podcasts for recommendation`);
      
      // Step 2: Generate recommendations with NLP processing
      console.log('Generating recommendations with NLP...');
      const recommendations = await generateRecommendations(standardizedFavorites, candidates);
      
      if (!recommendations || recommendations.length === 0) {
        return res.status(404).json({ 
          message: 'Could not generate meaningful recommendations. Try adding different podcasts to your favorites.',
          recommendations: []
        });
      }
      
      console.log(`Successfully generated ${recommendations.length} recommendations`);
      res.json({ recommendations });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = setupRecommendationRoutes; 