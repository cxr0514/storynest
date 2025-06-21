import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    logger.api('AI chat request received', { requestId })
    
    // Authentication (optional for chat helper)
    const session = await getServerSession(authOptions)
    if (session) {
      logger.oauth(`Authenticated user: ${session.user?.email || 'unknown'}`, { requestId, userId: session.user?.email || 'unknown' })
    } else {
      logger.info('Anonymous chat request', { requestId })
    }

    // Parse and validate request
    const body = await req.json()
    const { messages } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logger.error('Invalid request: No messages provided', undefined, { requestId })
      return NextResponse.json(
        { 
          success: false,
          error: 'No messages provided. Please include a messages array.',
          errorCode: 'MISSING_MESSAGES'
        }, 
        { status: 400 }
      )
    }

    // Validate message format
    const invalidMessages = messages.filter(msg => 
      !msg.role || !msg.content || 
      !['user', 'assistant'].includes(msg.role) ||
      typeof msg.content !== 'string'
    )

    if (invalidMessages.length > 0) {
      logger.error('Invalid message format detected', undefined, { requestId, invalidMessages })
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message format. Each message must have role and content.',
          errorCode: 'INVALID_MESSAGE_FORMAT'
        },
        { status: 400 }
      )
    }

    // Get the latest user message for context
    const userContent = messages[messages.length - 1].content
    const conversationContext = messages.slice(-3) // Keep last 3 messages for context

    logger.ai(`Processing chat request with ${messages.length} messages`, { requestId, messageCount: messages.length })

    // Enhanced system prompt for better story brainstorming
    const systemPrompt = `You are a magical story helper for children! Your job is to spark imagination and help kids brainstorm amazing story ideas.

Guidelines:
- Be playful, encouraging, and child-friendly
- Suggest creative, positive story concepts
- Keep responses short but inspiring (1-2 sentences)
- Ask follow-up questions to develop ideas further
- Include diverse characters and inclusive themes
- Avoid scary or inappropriate content

Current conversation context: The child is brainstorming story ideas.`

    // Call OpenAI with enhanced error handling
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext.slice(0, -1), // Include conversation history
          { role: 'user', content: userContent }
        ],
        max_tokens: 60,
        temperature: 0.8,
        presence_penalty: 0.3,
      })
    } catch (openaiError) {
      logger.error('OpenAI API error', openaiError, { requestId })
      return NextResponse.json(
        {
          success: false,
          error: 'AI service temporarily unavailable. Please try again.',
          errorCode: 'AI_SERVICE_ERROR'
        },
        { status: 503 }
      )
    }

    const reply = completion.choices[0]?.message?.content || 'How about a brave little mouse who goes on a magical adventure to help their friends?'
    
    // Log successful response
    const duration = Date.now() - startTime
    logger.performance('AI chat completion', startTime, { requestId, messageCount: messages.length })
    logger.success(`Chat response generated successfully`, { requestId, duration: `${duration}ms`, model: 'gpt-4o-mini' })
    
    return NextResponse.json({ 
      success: true,
      reply,
      metadata: {
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
        responseTime: duration
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(`Chat request failed after ${duration}ms`, error, { requestId, duration: `${duration}ms` })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Chat service encountered an unexpected error.',
        errorCode: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    )
  }
}
