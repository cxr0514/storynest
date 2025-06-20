/*
  === IllustrationPromptBuilder Component ===
  
  A component for generating consistent Pixar-style illustration prompts
  for the StoryNest application. This ensures character consistency across
  all story pages by combining character descriptions with story content.
*/

import React, { useEffect, useState, useRef } from 'react';

interface IllustrationPromptBuilderProps {
  /** Pre-filled description of the character from user creation */
  initialCharacterDescription?: string;
  /** Pre-filled story page text when generating per page */
  initialStoryPageText?: string;
  /** Callback when a prompt has been generated */
  onPromptGenerated?: (prompt: string) => void;
}

export default function IllustrationPromptBuilder({
  initialCharacterDescription = '',
  initialStoryPageText = '',
  onPromptGenerated,
}: IllustrationPromptBuilderProps) {
  const [characterDescription, setCharacterDescription] = useState(initialCharacterDescription);
  const [storyPageText, setStoryPageText] = useState(initialStoryPageText);
  const [finalPrompt, setFinalPrompt] = useState('');
  
  // Use ref to store the callback to avoid dependency issues
  const onPromptGeneratedRef = useRef(onPromptGenerated);
  
  // Update ref when callback changes
  useEffect(() => {
    onPromptGeneratedRef.current = onPromptGenerated;
  }, [onPromptGenerated]);

  // Regenerate final prompt whenever inputs change
  useEffect(() => {
    if (characterDescription && storyPageText) {
      const prompt = `You are a Pixar-style illustrator for a children's storybook. Your goal is to generate a consistent 3D-rendered illustration based on the user's custom character and the specific scene described on this storybook page.

### Character Description:
${characterDescription}

This character's appearance must be preserved across all story pages. Be consistent with visual features such as size, fur/hair, eye color, clothing, accessories, and personality expressions.

### Story Page:
${storyPageText}

### Illustration Requirements:
- Show the character actively engaged in the action described on this page.
- Background must match the scene (e.g., enchanted forest, beach, mountain, bedroom, etc.).
- Use Pixar-style 3D rendering with warm, emotional lighting and soft, appealing colors.
- Maintain character proportions and style consistently across pages.
- Include cinematic elements like soft shadows, rim lighting, volumetric effects, and light rays where appropriate.
- Emphasize a mood that supports the narrative (e.g., magical, exciting, peaceful, mysterious).
- Do not invent or alter the character's design — always reflect the original character description.
- Illustration must fill the full page with no white margins.

### Output Format:
A single 3D-rendered storybook illustration matching the story moment, with the described character and cinematic style.`;
      setFinalPrompt(prompt);
      
      // Call the callback using the ref to avoid dependency issues
      if (onPromptGeneratedRef.current) {
        onPromptGeneratedRef.current(prompt);
      }
    }
  }, [characterDescription, storyPageText]);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Storybook Illustration Prompt Builder</h2>

      <div>
        <label className="block mb-1 font-medium">Character Description</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={characterDescription}
          onChange={(e) => setCharacterDescription(e.target.value)}
          placeholder="e.g. Marley is a fluffy golden puppy with sky-blue eyes, a curly tail, and a red collar."
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Story Page Text</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={storyPageText}
          onChange={(e) => setStoryPageText(e.target.value)}
          placeholder="e.g. Page 5: In the heart of the enchanted forest, Marley dashed through the trees, chasing butterflies."
        />
      </div>

      <div>
        <label className="block mt-4 mb-1 font-medium">Generated Prompt</label>
        <textarea
          className="w-full p-2 border rounded bg-gray-100"
          rows={10}
          value={finalPrompt}
          readOnly
        />
      </div>
    </div>
  );
}
