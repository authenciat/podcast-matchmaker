const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

// Import utilities
const { validateEnvironment } = require('./utils/env-validator');
const { createListenNotesClient } = require('./utils/api-client');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error-handler');

// Import route setups
const setupPodcastRoutes = require('./routes/podcast.routes');
const setupRecommendationRoutes = require('./routes/recommendation.routes');

// Initialize app if environment variables are available
if (!validateEnvironment()) {
  console.error('Server initialization failed due to missing environment variables');
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize API client
const listenNotesClient = createListenNotesClient();

// Set up routes
app.use('/api/podcasts', setupPodcastRoutes(listenNotesClient));
app.use('/api/recommendations', setupRecommendationRoutes(listenNotesClient));
app.get('/api/genres', async (req, res, next) => {
  try {
    const response = await listenNotesClient.get('/genres');
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});
app.get('/api/trending', async (req, res, next) => {
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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 