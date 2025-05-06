/**
 * Validates that all required environment variables are present
 * @returns {boolean} True if all required variables are present, false otherwise
 */
const validateEnvironment = () => {
  const requiredVars = ['PORT', 'LISTEN_NOTES_API_KEY', 'HUGGING_FACE_API_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('Environment variables loaded successfully');
  return true;
};

module.exports = { validateEnvironment }; 