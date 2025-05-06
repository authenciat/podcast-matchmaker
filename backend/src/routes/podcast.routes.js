const express = require('express');
const router = express.Router();

/**
 * Setup podcast routes with the API client
 * @param {Object} listenNotesClient - Axios instance for Listen Notes API
 * @returns {Object} Express router with podcast routes
 */
const setupPodcastRoutes = (listenNotesClient) => {
  // Search podcasts
  router.get('/search', async (req, res, next) => {
    try {
      const { query, sort_by_date, len_min, len_max, genre_ids, page_size } = req.query;
      const searchParams = new URLSearchParams({
        q: query || '',
        sort_by_date: sort_by_date || 0,
        len_min: len_min || 0,
        len_max: len_max || -1,
        genre_ids: genre_ids || '',
        page_size: page_size || 10,
        type: 'podcast',
        only_in: 'title,description',
      });

      console.log(`Searching for podcasts with query: "${query}"`);
      const response = await listenNotesClient.get(`/search?${searchParams}`);

      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });

  // Get podcast details
  router.get('/:id', async (req, res, next) => {
    try {
      const response = await listenNotesClient.get(`/podcasts/${req.params.id}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });

  // Get podcast genres
  router.get('/genres', async (req, res, next) => {
    try {
      const response = await listenNotesClient.get('/genres');
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });

  // Get trending podcasts
  router.get('/trending', async (req, res, next) => {
    try {
      const { genre_id, page_size } = req.query;
      const params = new URLSearchParams({
        page_size: page_size || 10
      });
      
      if (genre_id) {
        params.append('genre_id', genre_id);
      }
      
      const response = await listenNotesClient.get(`/best_podcasts?${params}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = setupPodcastRoutes; 