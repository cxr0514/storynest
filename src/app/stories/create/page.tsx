// File: src/app/stories/create/page.tsx

/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/ui/animated-page'
import { Badge } from '@/components/ui/badge'
import type { ChildProfile, Character, StoryTheme } from '@/types'

/* ──────────────────────────────────────────────────────────
   ░░   SELECT FIELD OPTIONS  –  Language, Story Type, etc.  ░░
   ──────────────────────────────────────────────────────── */
export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Swedish',
  'Japanese',
  'Chinese',
] as const

export const STORY_TYPE_OPTIONS = [
  'Bedtime Story: A classic.',
  'Fable: Moral lessons, talking animals.',
  'Fairytale: Magic, enchanting creatures, happy endings.',
  'Adventure: Exciting journeys, young heroes, challenges.',
  'Educational: Informative, age-appropriate facts, engaging.',
  'Mystery: Puzzles, clues, child detectives.',
  'Science fiction: Futuristic, imaginative worlds, exploration.',
  'Realistic fiction: Everyday life, relatable characters, emotions.',
] as const

export const WRITING_STYLE_OPTIONS = [
  'Imaginative: Creative, whimsical, fantastical elements.',
  'Funny: Humorous, witty, light-hearted tone.',
  'Heartwarming: Uplifting, positive messages, emotional connections.',
  'Action-packed: Fast-paced, thrilling, adventure-filled.',
  'Nostalgic: Familiar settings, relatable experiences, memories.',
  'Empowering: Confidence-building, inspiring, strong characters.',
  'Spooky: Mild scares, eerie settings, suspenseful.',
  'Educational: Informative, engaging, age-appropriate lessons.',
] as const

export const READER_AGE_OPTIONS = [
  '3 – 5 years',
  '5 – 7 years',
  '7 – 9 years',
  '8 – 10 years',
  '10 – 12 years',
] as const

/* ────────────────────────────────────────────────────────── */

export default function CreateStory() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedChildId = searchParams.get('childId')
  const { data: session } = useSession()

  /* Fetching state */
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* Form state */
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | ''>('')

  const [selectedLanguage, setSelectedLanguage] = useState<string>('English')
  const [selectedStoryType, setSelectedStoryType] = useState<string>('Bedtime Story: A classic.')
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string>('Imaginative: Creative, whimsical, fantastical elements.')
  const [selectedReaderAge, setSelectedReaderAge] = useState<string>('5 – 7 years')

  const [isGenerating, setIsGenerating] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')

  // Fetch child profiles and characters on mount
  useEffect(() => {
    if (!session?.user?.id) return

    Promise.all([
      fetch('/api/child-profiles').then((r) => r.json()),
      fetch('/api/characters').then((r) => r.json()),
    ]).then(([profiles, chars]) => {
      setChildProfiles(profiles)
      setAllCharacters(chars)
      setIsLoading(false)
      if (preSelectedChildId) setSelectedChild(preSelectedChildId)
    })
  }, [session?.user?.id, preSelectedChildId])

  /* Helpers */
  function toggleCharacter(id: string) {
    setSelectedCharacters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  /* Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedChild) return alert('Select a child profile first.')
    if (!selectedTheme) return alert('Select a story theme first.')

    setIsGenerating(true)
    setProgressMsg('Creating your story…')
    const res = await fetch('/api/stories/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: selectedTheme,
        characterIds: selectedCharacters,
        childProfileId: selectedChild,
        language: selectedLanguage,
        storyType: selectedStoryType,
        writingStyle: selectedWritingStyle,
        readerAge: selectedReaderAge,
      }),
    })
    if (!res.ok) {
      setIsGenerating(false)
      return alert('Failed to create story.')
    }
    const data = await res.json()
    router.push(`/stories/${data.story.id}`)
  }

  /* Characters filtered by selected child (optional) */
  const filteredCharacters = selectedChild
    ? allCharacters.filter((c) => c.childProfileId === selectedChild)
    : allCharacters

  /* UI */
  if (isLoading) return <p className="p-8">Loading…</p>

  return (
    <AnimatedPage>
      <Header />
      <div className="mx-auto max-w-screen-lg p-6 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Language · StoryType · Age · Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Selector
              label="Language"
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={LANGUAGE_OPTIONS}
            />
            <Selector
              label="Story type"
              value={selectedStoryType}
              onChange={setSelectedStoryType}
              options={STORY_TYPE_OPTIONS}
            />
            <Selector
              label="Reader age"
              value={selectedReaderAge}
              onChange={setSelectedReaderAge}
              options={READER_AGE_OPTIONS}
            />
            <Selector
              label="Writing style"
              value={selectedWritingStyle}
              onChange={setSelectedWritingStyle}
              options={WRITING_STYLE_OPTIONS}
            />
          </div>

          {/* Child profile selector */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Child Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {childProfiles.map((child) => (
                <button
                  type="button"
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`border rounded-lg p-3 text-left hover:border-blue-500 ${
                    selectedChild === child.id ? 'border-blue-600 ring-2 ring-blue-400' : ''
                  }`}
                >
                  <p className="font-semibold">{child.name}</p>
                  <p className="text-xs text-gray-500">Age {child.age}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Character selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Characters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredCharacters.length === 0 && (
                <p className="col-span-full text-sm text-gray-500">No characters found for this profile.</p>
              )}
              {filteredCharacters.map((char) => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => toggleCharacter(char.id)}
                  className={`border rounded-lg p-3 hover:border-blue-500 flex flex-col gap-2 ${
                    selectedCharacters.includes(char.id)
                      ? 'border-blue-600 ring-2 ring-blue-400'
                      : ''
                  }`}
                >
                  {/* If an image URL exists, show thumbnail */}
                  {char.imageUrl && (
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  )}
                  <span className="font-medium text-sm text-center">{char.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" disabled={isGenerating} className="w-full md:w-auto">
            {isGenerating ? 'Generating…' : 'Create Story'}
          </Button>
          {isGenerating && (
            <p className="text-center text-sm text-gray-600">{progressMsg}</p>
          )}
        </form>
      </div>
    </AnimatedPage>
  )
}

/* ────────────────────────── */
interface SelectorProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: readonly string[]
}
function Selector({ label, value, onChange, options }: SelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
