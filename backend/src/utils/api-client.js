const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config/.env') });

// Environment variables
const LISTEN_NOTES_API_KEY = process.env.LISTEN_NOTES_API_KEY;
const LISTEN_NOTES_API_BASE_URL = 'https://listen-api.listennotes.com/api/v2';

// Create API client for Listen Notes
const createListenNotesClient = () => {
  if (!LISTEN_NOTES_API_KEY) {
    console.error('Missing LISTEN_NOTES_API_KEY environment variable');
    throw new Error('API key for Listen Notes is required');
  }

  return axios.create({
    baseURL: LISTEN_NOTES_API_BASE_URL,
    headers: {
      'X-ListenAPI-Key': LISTEN_NOTES_API_KEY
    }
  });
};

module.exports = {
  createListenNotesClient
}; 