'use client';

import React, { useState } from 'react';
import IllustrationPromptBuilder from '@/components/IllustrationPromptBuilder';

export default function TestPromptBuilderPage() {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Sample character description for testing
  const sampleCharacter = "Luna is a small purple dragon with sparkling silver scales on her belly, large emerald green eyes that glow softly in the dark, tiny rainbow-colored wings that shimmer when she flies, and a curious personality. She wears a small golden collar with a star-shaped pendant.";

  // Sample story page text for testing
  const sampleStoryPage = "Page 3: Luna discovered a hidden cave behind the waterfall in the Enchanted Forest. As she stepped inside, magical crystals began to glow all around her, illuminating ancient drawings on the cave walls. She spread her tiny wings and flew closer to examine the mysterious symbols.";

  const handlePromptGenerated = (prompt: string) => {
    setGeneratedPrompt(prompt);
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`${timestamp}: Prompt generated (${prompt.length} characters)`, ...prev.slice(0, 4)]);
    console.log('Generated prompt:', prompt);
  };

  const loadSampleData = () => {
    // This will trigger the component to generate a prompt with sample data
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: Sample data loaded`, ...prev.slice(0, 4)]);
  };

  const clearResults = () => {
    setTestResults([]);
    setGeneratedPrompt('');
  };

  const copyPromptToClipboard = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setTestResults(prev => [`${new Date().toLocaleTimeString()}: Prompt copied to clipboard`, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            IllustrationPromptBuilder Test Page
          </h1>
          
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={loadSampleData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Load Sample Data
              </button>
              <button 
                onClick={copyPromptToClipboard}
                disabled={!generatedPrompt}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Copy Prompt
              </button>
              <button 
                onClick={clearResults}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Data Display */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sample Test Data</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Sample Character:</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{sampleCharacter}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Sample Story Page:</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{sampleStoryPage}</p>
              </div>
            </div>
          </div>

          {/* The Component Under Test */}
          <div className="bg-white rounded-lg shadow-md">
            <IllustrationPromptBuilder
              initialCharacterDescription={sampleCharacter}
              initialStoryPageText={sampleStoryPage}
              onPromptGenerated={handlePromptGenerated}
            />
          </div>

          {/* Generated Prompt Analysis */}
          {generatedPrompt && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Prompt Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-medium text-blue-800">Character Count</div>
                  <div className="text-blue-600">{generatedPrompt.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-medium text-green-800">Word Count</div>
                  <div className="text-green-600">{generatedPrompt.split(' ').length}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-medium text-purple-800">Lines</div>
                  <div className="text-purple-600">{generatedPrompt.split('\n').length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
