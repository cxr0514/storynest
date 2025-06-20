import OpenAI from 'openai'
import { Character, StoryGenerationRequest } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStoryWithOpenAI(
  request: StoryGenerationRequest,
  characters: Character[]
): Promise<{
  title: string
  pages: Array<{
    pageNumber: number
    content: string
    characterDescriptions: Record<string, string>
  }>
  summary: string
}> {
  const characterDescriptions = characters.map(char => 
    `${char.name}: ${char.species}, ${char.personalityDescription}. ${char.physicalFeatures}`
  ).join('\n')

  const pageCount = request.pageCount || 5

  const prompt = `Create a children's bedtime story with the following specifications:

Theme: ${request.theme}
Characters: ${characterDescriptions}
Moral Lesson: ${request.moralLesson || 'friendship and kindness'}
Additional Details: ${request.customPrompt || 'A magical adventure'}
Story Length: Exactly ${pageCount} pages

Requirements:
- Create exactly ${pageCount} pages of story content
- Each page should be 2-3 sentences suitable for children aged 3-8
- Maintain character consistency throughout
- Include character descriptions for each page that work well for Pixar-style illustrations
- Keep content wholesome and age-appropriate
- End with a positive resolution that teaches the moral lesson
- Design each page to work well as an illustrated scene

Return the response in this exact JSON format:
{
  "title": "Story Title Here",
  "summary": "Brief story summary",
  "pages": [
    {
      "pageNumber": 1,
      "content": "Page 1 content here...",
      "characterDescriptions": {
        "character-id": "How the character appears and behaves on this page"
      }
    },
    // ... continue for all ${pageCount} pages
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional children's book author who creates engaging, age-appropriate stories with consistent characters and positive messages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    const storyData = JSON.parse(content)
    return storyData
  } catch (error) {
    console.error('Error generating story with OpenAI:', error)
    throw new Error('Failed to generate story')
  }
}

export async function generateIllustrationPrompt(
  pageContent: string,
  characters: Character[],
  theme: string
): Promise<string> {
  const characterDescriptions = characters.map(char => 
    `${char.name}: ${char.physicalFeatures}, ${char.clothingAccessories}`
  ).join('. ')

  const prompt = `Create a DALL-E prompt for a Pixar-style children's book illustration based on:

Page Content: ${pageContent}
Characters: ${characterDescriptions}
Theme: ${theme}

Requirements:
- Pixar animation style (3D rendered, vibrant, warm lighting)
- Child-friendly, whimsical art style
- Bright, vibrant colors with excellent contrast
- Safe, positive imagery suitable for ages 3-8
- Consistent character appearance matching descriptions
- Professional children's book illustration quality
- Expressive character faces with emotions
- Rich environmental details that support the story
- Cinematic composition with clear focal points

Generate a detailed prompt for DALL-E 3 that will create a beautiful Pixar-style illustration for this page.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating DALL-E prompts for children's book illustrations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content || 'A whimsical children\'s book illustration'
  } catch (error) {
    console.error('Error generating illustration prompt:', error)
    throw new Error('Failed to generate illustration prompt')
  }
}

export async function generateIllustration(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Pixar-style 3D rendered children's book illustration: ${prompt}. Art style: Disney/Pixar animation quality, vibrant colors, warm lighting, expressive characters, cinematic composition, child-friendly, storybook art with rich environmental details`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    })

    return response.data?.[0]?.url || ''
  } catch (error) {
    console.error('Error generating illustration:', error)
    throw new Error('Failed to generate illustration')
  }
}
