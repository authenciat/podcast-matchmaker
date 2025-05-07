# Podcast Recommendation App

A full-stack application that generates personalized podcast recommendations based on user favorites using semantic similarity and natural language processing techniques.

## Features

- Search for podcasts using the Listen Notes API
- Save favorite podcasts to build your profile
- Get AI-powered podcast recommendations based on your favorites
- Semantic matching based on content similarity
- Detailed explanation of why each podcast was recommended

## Technology Stack

### Frontend
- React with React Router
- Axios for API requests
- Tailwind CSS for styling

### Backend
- Node.js with Express
- Hugging Face Inference API for NLP and embeddings
- Listen Notes API for podcast data
- Natural and Stopword for text processing

## How It Works

The recommendation system works through several sophisticated steps:

1. **Data Collection**: When a user adds podcasts to their favorites, the system collects this data to understand their preferences.

2. **Candidate Generation**: When recommendations are requested, the system collects potential podcast candidates by:
   - Finding podcasts in similar genres
   - Searching for podcasts with keywords extracted from favorites
   - Including trending podcasts for discovery

3. **Text Processing**: Podcast descriptions and titles are preprocessed to remove noise and standardize text.

4. **Embedding Generation**: The system uses Hugging Face's Sentence Transformers model to convert podcast descriptions into numerical vectors that represent their semantic meaning.

5. **Similarity Calculation**: The system calculates cosine similarity between user favorites and candidate podcasts to find the best matches.

6. **Recommendation Ranking**: Candidates are ranked based on similarity scores and the most relevant podcasts are returned.

7. **Explanation Generation**: For each recommendation, the system explains why it was selected (shared topics, genre similarities, etc.).

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- NPM or Yarn
- API keys for:
  - Listen Notes API (https://www.listennotes.com/api/)
  - Hugging Face (https://huggingface.co/inference-api)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/podcast-recommendation-app.git
cd podcast-recommendation-app
```

2. Install dependencies for all parts of the application:
```bash
npm run install:all
```

3. Create environment configuration:
   - Create a file at `backend/config/.env` with the following contents:
   ```
   PORT=5000
   LISTEN_NOTES_API_KEY=your_listen_notes_api_key
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   ```

4. Start the application:
```bash
npm run dev
```

This will start both the frontend (on port 3000) and backend (on port 5000) simultaneously.

## Usage

1. **Search for Podcasts**: Use the search page to find podcasts by title, description, or topic.

2. **Add to Favorites**: Add podcasts you enjoy to your favorites to build your profile.

3. **Get Recommendations**: Navigate to the recommendations page and click the "Get Recommendations" button.

4. **Explore Recommendations**: Browse through your personalized recommendations and click "Listen Now" to check them out.

## Project Structure
```
podcast-recommendation-app/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── ...
├── backend/           # Node.js backend API
│   ├── config/        # Configuration files
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Express middleware
│   │   ├── services/  # Business logic services
│   │   ├── utils/     # Utility functions
│   │   ├── server.js  # Express server setup
│   │   └── nlp.js     # NLP and recommendation logic
│   └── ...
└── ...
```

## Project Documentation

For detailed information about this project, please refer to the following resources:

- **Project Report**: `project_report.pdf` - Comprehensive explanation of the NLP methodology, technical challenges, user testing results, and future improvements.

- **Video Demo**: [Watch on YouTube](https://youtu.be/tLPDVtwSLrs) - A short demonstration of the web application's features and functionality.

- **GitHub Repository**: [github.com/yourusername/podcast-recommendation-app](https://github.com/yourusername/podcast-recommendation-app) - Complete source code and documentation.

## Acknowledgements

- [Listen Notes API](https://www.listennotes.com/api/) for providing podcast data
- [Hugging Face](https://huggingface.co/) for their transformer models
- [Sentence Transformers](https://www.sbert.net/) for semantic embeddings 