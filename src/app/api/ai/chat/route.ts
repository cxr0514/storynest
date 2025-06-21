import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Enhanced logging for debugging
function log(level: 'info' | 'error' | 'warn', message: string, data?: unknown) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [AI-CHAT] [${level.toUpperCase()}] ${message}`
  
  if (level === 'error') {
    console.error(logMessage, data || '')
  } else if (level === 'warn') {
    console.warn(logMessage, data || '')
  } else {
    console.log(logMessage, data || '')
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    log('info', 'AI chat request received')
    
    // Authentication (optional for chat helper)
    const session = await getServerSession(authOptions)
    if (session) {
      log('info', `Authenticated user: ${session.user?.email}`)
    } else {
      log('info', 'Anonymous chat request')
    }

    // Parse and validate request
    const body = await req.json()
    const { messages } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      log('error', 'Invalid request: No messages provided')
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
      log('error', 'Invalid message format detected', invalidMessages)
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

    log('info', `Processing chat request with ${messages.length} messages`)

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
      log('error', 'OpenAI API error', openaiError)
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
    log('info', `Chat response generated successfully in ${duration}ms`)
    
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
    log('error', `Chat request failed after ${duration}ms`, error)
    
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
