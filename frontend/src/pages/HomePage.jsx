import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Welcome to Podcast Matchmaker</h2>
        <p className="text-gray-700 mb-6">
          Discover podcasts you'll love based on your preferences, powered by advanced Natural Language Processing.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/search" 
            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 text-center"
          >
            Search Podcasts
          </Link>
          <Link 
            to="/recommendations" 
            className="bg-green-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 text-center"
          >
            Get Recommendations
          </Link>
        </div>
      </section>
      
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-xl mb-2">1. Search & Save</h4>
            <p className="text-gray-700">Search for podcasts you enjoy and save them to your favorites.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-xl mb-2">2. Build Profile</h4>
            <p className="text-gray-700">The more podcasts you favorite, the better your recommendations will be.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-xl mb-2">3. Discover</h4>
            <p className="text-gray-700">Get personalized recommendations with detailed reasoning.</p>
          </div>
        </div>
      </section>
      
      <section className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Our Technology</h3>
        <p className="text-gray-700 mb-4">
          Podcast Matchmaker uses cutting-edge NLP (Natural Language Processing) technology to analyze podcast content and match you with shows that align with your interests.
        </p>
        <p className="text-gray-700">
          Our recommendation engine goes beyond simple genre matching—it understands the themes, topics, and style of podcasts to provide truly personalized suggestions.
        </p>
      </section>
    </div>
  );
};

export default HomePage; 