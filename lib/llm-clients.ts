import { OpenAI } from 'openai';
import axios from 'axios';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function callClaude(prompt: string) {
  const result = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  return result.data;
}
