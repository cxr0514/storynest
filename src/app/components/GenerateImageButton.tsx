'use client';

import { useState } from 'react';
import { generateIllustrationPrompt } from '../../../lib/ai-prompt-utils';

// Simple notification system to replace sonner
const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${emoji} ${message}`);
  // Could also use a state-based notification system here
};

export default function GenerateImageButton() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    showNotification('Generating Luna dragon image...', 'info');

    try {
      // Generate the structured prompt using our AI utilities
      const payload = generateIllustrationPrompt(
        {
          name: 'Luna',
          species: 'Dragon',
          traits: ['purple scales', 'silver belly', 'glowing green eyes', 'tiny wings'],
        },
        {
          location: 'Behind the waterfall in the Enchanted Forest',
          action: 'Luna flies up toward glowing cave runes',
        }
      );

      console.log('🎨 Generated prompt payload:', payload);

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(data.imageUrl);
      showNotification('Luna dragon image generated successfully!', 'success');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      showNotification(`Failed to generate image: ${errorMessage}`, 'error');
      console.error('❌ Image generation error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🐉 Luna Dragon Generator
        </h2>
        <p className="text-gray-600 mb-4">
          Generate consistent character illustrations using AI prompt utilities
        </p>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Generating Luna...
          </>
        ) : (
          <>
            🎨 Generate Image
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">✅ Successfully generated Luna dragon image!</p>
          </div>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt="Luna the Dragon - purple scales, silver belly, glowing green eyes, tiny wings, flying toward glowing cave runes behind waterfall in Enchanted Forest"
              className="w-full h-auto"
              onLoad={() => console.log('🖼️ Image loaded successfully')}
              onError={() => {
                setError('Failed to load generated image');
                showNotification('Image failed to load', 'error');
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Character Details:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Name:</strong> Luna</li>
              <li>• <strong>Species:</strong> Dragon</li>
              <li>• <strong>Traits:</strong> Purple scales, silver belly, glowing green eyes, tiny wings</li>
              <li>• <strong>Scene:</strong> Flying toward glowing cave runes behind waterfall</li>
              <li>• <strong>Location:</strong> Enchanted Forest</li>
            </ul>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>Powered by AI Prompt Utilities + DALL-E 3</p>
      </div>
    </div>
  );
}
