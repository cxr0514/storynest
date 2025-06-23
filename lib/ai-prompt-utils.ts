// lib/ai-prompt-utils.ts

export interface Character {
  name: string;
  species: string;
  traits: string[];
}

export interface Scene {
  location: string;
  action: string;
  lighting?: string;
}

/**
 * 🧾 Claude Prompt Generator Template (YAML)
 */
export function generateIllustrationPrompt(
  character: Character,
  scene: Scene,
  style: string = 'Pixar 3D'
): string {
  return `# ClaudePrompt
task: Generate illustration prompt
style: ${style}
character:
  name: ${character.name}
  species: ${character.species}
  traits:
    - ${character.traits.join('\n    - ')}
scene:
  location: "${scene.location}"
  action: "${scene.action}"
  lighting: "${scene.lighting ?? 'Soft magical glow'}"
instructions: >
  Match character traits exactly. Use ${style} rendering.`;
}

/**
 * ⚙️ Claude Preprocessor Utility
 * Removes markdown and formatting from GPT-generated output.
 */
export function cleanForClaude(input: string): string {
  return input
    .replace(/```(yaml|json|ts|js|md)?/g, '')
    .replace(/^# ClaudePrompt\s*/g, '')
    .replace(/\s+$/, '')
    .trim();
}

/**
 * 🧑‍🚀 Character Memory Injector
 * Injects character traits and background into system prompt.
 */
export function buildCharacterMemory(
  character: Character,
  notes?: string
): string {
  return `You are continuing a story or image involving this consistent character:

Character Profile:
- Name: ${character.name}
- Species: ${character.species}
- Traits:
  ${character.traits.map((t) => `- ${t}`).join('\n  ')}

${notes ? `Additional Notes:\n- ${notes}` : ''}

Always match visual and narrative traits. Do not improvise new features.`;
}
