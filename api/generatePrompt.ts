import { generateIllustrationPrompt, cleanForClaude } from '@/lib/ai-prompt-utils';
import { callClaude, openai } from '@/lib/llm-clients';

export async function generateClaudeIllustrationPrompt() {
  const rawPrompt = generateIllustrationPrompt(
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

  const cleanPrompt = cleanForClaude(rawPrompt);
  const result = await callClaude(cleanPrompt);

  return result;
}
