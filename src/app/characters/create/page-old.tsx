'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChildProfileModal } from '@/components/child-profile-modal';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
}

interface CharacterFormData {
  name: string;
  species: string;
  age: string;
  physicalFeatures: string;
  clothingAccessories: string;
  personalityTraits: string[];
  personalityDescription: string;
  specialAbilities: string;
  favoriteThings: string;
  speakingStyle: string;
  favoritePhrases: string;
  childProfileId: string;
  backstory: string;
  goals: string;
  quirks: string;
  catchphrase: string;
  illustrationPrompt?: string;
}

const initialFormData: CharacterFormData = {
  name: '',
  species: '',
  age: '',
  physicalFeatures: '',
  clothingAccessories: '',
  personalityTraits: [],
  personalityDescription: '',
  specialAbilities: '',
  favoriteThings: '',
  speakingStyle: '',
  favoritePhrases: '',
  childProfileId: '',
  backstory: '',
  goals: '',
  quirks: '',
  catchphrase: '',
  illustrationPrompt: ''
};

export default function CreateCharacterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<CharacterFormData>(initialFormData);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChildProfileModal, setShowChildProfileModal] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [characterEmoji, setCharacterEmoji] = useState('👤');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load child profiles
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const loadChildProfiles = async () => {
      try {
        const response = await fetch('/api/child-profiles');
        if (response.ok) {
          const profiles = await response.json();
          setChildProfiles(profiles);
          if (profiles.length > 0) {
            setFormData(prev => ({ ...prev, childProfileId: profiles[0].id }));
          }
        } else {
          setError('Failed to load child profiles');
        }
      } catch (error) {
        setError('Error loading child profiles');
        console.error('Error loading child profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChildProfiles();
  }, [session, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    updateProgress();
    if (name === 'species') updateCharacterPreview();
  };

  const handleSpeciesChipClick = (species: string) => {
    setFormData(prev => ({ ...prev, species }));
    updateCharacterPreview();
    updateProgress();
  };

  const handleTraitClick = (trait: string) => {
    const newTraits = formData.personalityTraits.includes(trait)
      ? formData.personalityTraits.filter(t => t !== trait)
      : [...formData.personalityTraits, trait];
    
    setFormData(prev => ({ ...prev, personalityTraits: newTraits }));
    updateProgress();
  };

  const updateCharacterPreview = () => {
    const species = formData.species.toLowerCase();
    const emojiMap: { [key: string]: string } = {
      'human': '🧑',
      'dragon': '🐉',
      'unicorn': '🦄',
      'robot': '🤖',
      'fairy': '🧚',
      'wizard': '🧙'
    };
    
    setCharacterEmoji(emojiMap[species] || '👤');
  };

  const updateProgress = () => {
    const fields = [
      formData.childProfileId,
      formData.name,
      formData.species,
      formData.age,
      formData.physicalFeatures,
      formData.personalityDescription,
      formData.personalityTraits.length > 0 ? 'selected' : ''
    ];

    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return { filledFields, totalFields: fields.length };
  };

  const handleChildProfileSuccess = async () => {
    setShowChildProfileModal(false);
    // Reload child profiles
    try {
      const response = await fetch('/api/child-profiles');
      if (response.ok) {
        const profiles = await response.json();
        setChildProfiles(profiles);
        if (profiles.length > 0) {
          setFormData(prev => ({ ...prev, childProfileId: profiles[0].id }));
        }
      }
    } catch (error) {
      console.error('Error reloading child profiles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.childProfileId) {
        throw new Error('Please select a child profile');
      }

      const characterData = {
        name: formData.name,
        species: formData.species,
        age: formData.age,
        physicalFeatures: formData.physicalFeatures,
        clothingAccessories: formData.clothingAccessories,
        personalityTraits: formData.personalityTraits,
        personalityDescription: formData.personalityDescription,
        specialAbilities: formData.specialAbilities || '',
        favoriteThings: formData.favoriteThings || '',
        speakingStyle: formData.speakingStyle || '',
        favoritePhrases: formData.favoritePhrases ? formData.favoritePhrases.split(',').map(p => p.trim()).filter(Boolean) : [],
        childProfileId: formData.childProfileId,
        ageGroups: ['3-6', '7-10'],
        appearances: []
      };

      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to create character: ${res.statusText}`);
      }
      
      const { id } = await res.json();
      
      // Show success animation
      setShowSuccess(true);
      
      // Redirect after success animation
      setTimeout(() => {
        router.push(`/characters/${id}`);
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create character';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine visual fields for prompt builder
  const visualDesc = [
    formData.physicalFeatures,
    formData.clothingAccessories,
    formData.personalityTraits,
    formData.favoriteThings
  ]
    .filter(Boolean)
    .join(', ');

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Character</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Show child profile creation prompt if no profiles exist */}
      {childProfiles.length === 0 ? (
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200 rounded-lg p-6 text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">👶</span>
          </div>
          <h3 className="text-xl font-bold text-orange-700 mb-2">Create a Child Profile First!</h3>
          <p className="text-orange-600 mb-4">You need to create a child profile before designing characters.</p>
          <button
            type="button"
            onClick={() => setShowChildProfileModal(true)}
            className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Create Child Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Child Profile Selection */}
          <div>
            <label className="block font-medium mb-2">Child Profile *</label>
            <select
              name="childProfileId"
              value={formData.childProfileId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a child profile...</option>
              {childProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} (Age {profile.age})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowChildProfileModal(true)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              + Add New Child Profile
            </button>
          </div>

          {/* Basic Character Fields */}
          <div>
            <label className="block font-medium">Character Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Species *</label>
            <input
              type="text"
              name="species"
              value={formData.species}
              onChange={handleChange}
              placeholder="e.g., Human, Dragon, Unicorn, Robot"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Age *</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., Young child, Teen, Adult"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Physical Features *</label>
            <textarea
              name="physicalFeatures"
              value={formData.physicalFeatures}
              onChange={handleChange}
              placeholder="Describe appearance: height, hair/fur color, eye color, distinctive features..."
              className="w-full p-2 border rounded h-20"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Clothing & Accessories</label>
            <textarea
              name="clothingAccessories"
              value={formData.clothingAccessories}
              onChange={handleChange}
              placeholder="What does the character wear? Any special accessories?"
              className="w-full p-2 border rounded h-16"
            />
          </div>

          <div>
            <label className="block font-medium">Personality Traits</label>
            <input
              type="text"
              name="personalityTraits"
              value={formData.personalityTraits}
              onChange={handleChange}
              placeholder="e.g., brave, kind, curious, funny"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Personality Description *</label>
            <textarea
              name="personalityDescription"
              value={formData.personalityDescription}
              onChange={handleChange}
              placeholder="Describe the character's personality in detail..."
              className="w-full p-2 border rounded h-20"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Special Abilities</label>
            <input
              type="text"
              name="specialAbilities"
              value={formData.specialAbilities}
              onChange={handleChange}
              placeholder="e.g., magic powers, super strength, talking to animals"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Favorite Things</label>
            <input
              type="text"
              name="favoriteThings"
              value={formData.favoriteThings}
              onChange={handleChange}
              placeholder="e.g., cookies, reading, adventures"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Character visual prompt builder */}
          <IllustrationPromptBuilder
            initialCharacterDescription={visualDesc}
            onPromptGenerated={handlePromptGenerated}
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Character'}
          </button>
        </form>
      )}

      {/* Child Profile Modal */}
      <ChildProfileModal
        isOpen={showChildProfileModal}
        onClose={() => setShowChildProfileModal(false)}
        onSuccess={handleChildProfileSuccess}
      />
    </div>
  );
}
