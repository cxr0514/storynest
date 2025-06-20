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
    if (name === 'species') updateCharacterPreview();
  };

  const handleSpeciesChipClick = (species: string) => {
    setFormData(prev => ({ ...prev, species }));
    updateCharacterPreview();
  };

  const handleTraitClick = (trait: string) => {
    const newTraits = formData.personalityTraits.includes(trait)
      ? formData.personalityTraits.filter(t => t !== trait)
      : [...formData.personalityTraits, trait];
    
    setFormData(prev => ({ ...prev, personalityTraits: newTraits }));
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

  const { filledFields, totalFields } = updateProgress();
  const progressPercentage = (filledFields / totalFields) * 100;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 via-blue-400 via-purple-400 to-cyan-400 bg-[length:400%_400%] animate-gradient-shift flex items-center justify-center p-5">
        <div className="max-w-2xl w-full bg-white/95 backdrop-blur-[20px] rounded-[32px] p-12 shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/30 text-center">
          <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 animate-[successBounce_0.8s_ease-out]">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h2 className="text-green-600 mb-3 text-[28px] font-bold">Character Created!</h2>
          <p className="text-gray-500 text-base">Your new character has been successfully created and is ready for adventures!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }

        @keyframes floatChar {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(90deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
          75% { transform: translateY(-25px) rotate(270deg); }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sectionSlideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.7; }
        }

        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes previewPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes successBounce {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-gradient-shift {
          animation: gradientShift 15s ease infinite;
        }

        .animate-float-char {
          animation: floatChar 8s ease-in-out infinite;
        }

        .animate-slide-in-scale {
          animation: slideInScale 1s ease-out;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out 0.3s both;
        }

        .animate-section-slide-in {
          opacity: 0;
          transform: translateX(30px);
          animation: sectionSlideIn 0.6s ease-out forwards;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-gradient-flow {
          animation: gradientFlow 4s ease-in-out infinite;
        }

        .animate-preview-pulse {
          animation: previewPulse 3s ease-in-out infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 via-blue-400 via-purple-400 to-cyan-400 bg-[length:400%_400%] animate-gradient-shift p-5 overflow-x-hidden font-['Inter',sans-serif]">
        {/* Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute w-full h-full">
            <div className="absolute text-4xl opacity-30 animate-float-char" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>🧙‍♂️</div>
            <div className="absolute text-4xl opacity-30 animate-float-char" style={{ top: '60%', left: '80%', animationDelay: '2s' }}>🦄</div>
            <div className="absolute text-4xl opacity-30 animate-float-char" style={{ top: '80%', left: '20%', animationDelay: '4s' }}>🐉</div>
            <div className="absolute text-4xl opacity-30 animate-float-char" style={{ top: '30%', left: '70%', animationDelay: '6s' }}>🤖</div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-[20px] rounded-[32px] p-12 shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/30 animate-slide-in-scale relative overflow-hidden">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-orange-400 via-blue-400 via-purple-400 to-cyan-400 bg-[length:300%_100%] animate-gradient-flow"></div>
          
          {/* Character Preview */}
          <div className="absolute top-7 left-7 w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-[32px] animate-preview-pulse">
            {characterEmoji}
          </div>
          
          {/* Progress Indicator */}
          <div className="absolute top-7 right-7 flex items-center gap-3 text-sm font-semibold text-gray-500">
            <span>{filledFields}/{totalFields} fields</span>
            <div className="w-25 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-down">
            <h1 className="text-[42px] font-bold bg-gradient-to-br from-red-400 to-purple-400 bg-clip-text text-transparent mb-3 relative">
              Create New Character
              <span className="absolute -right-12 -top-2 text-2xl animate-sparkle">✨</span>
            </h1>
            <p className="text-gray-500 text-lg">Bring your imagination to life with a unique story character</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Show child profile creation prompt if no profiles exist */}
          {childProfiles.length === 0 ? (
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200 rounded-lg p-6 text-center mb-6 animate-section-slide-in">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">👶</span>
              </div>
              <h3 className="text-xl font-bold text-orange-700 mb-2">Create a Child Profile First!</h3>
              <p className="text-orange-600 mb-4">You need to create a child profile before designing characters.</p>
              <button
                type="button"
                onClick={() => setShowChildProfileModal(true)}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Create Child Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Child Profile Section */}
              <div className="mb-8 animate-section-slide-in" style={{ animationDelay: '0.1s' }}>
                <div className="mb-6">
                  <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Child Profile <span className="text-red-500 text-base">*</span>
                  </label>
                  <select
                    name="childProfileId"
                    value={formData.childProfileId}
                    onChange={handleChange}
                    className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%27http%3a//www.w3.org/2000/svg%27%20fill%3d%27none%27%20viewBox%3d%270%200%2020%2020%27%3e%3cpath%20stroke%3d%27%236b7280%27%20stroke-linecap%3d%27round%27%20stroke-linejoin%3d%27round%27%20stroke-width%3d%271.5%27%20d%3d%27m6%208%204%204%204-4%27/%3e%3c/svg%3e')] bg-[right_12px_center] bg-no-repeat bg-[length:16px] pr-12"
                    required
                  >
                    <option value="">Select a child profile</option>
                    {childProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} (Age {profile.age})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowChildProfileModal(true)}
                    className="text-red-400 text-sm font-semibold inline-flex items-center gap-2 mt-2 transition-all duration-300 p-2 rounded-xl bg-red-50 hover:bg-red-100 hover:translate-x-1 before:content-['+'] before:text-lg before:font-bold"
                  >
                    Add New Child Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Character Name */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.2s' }}>
                  <div className="mb-6">
                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                      Character Name <span className="text-red-500 text-base">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px"
                      placeholder="Enter character name"
                      required
                    />
                  </div>
                </div>

                {/* Species */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.3s' }}>
                  <div className="mb-6">
                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                      Species <span className="text-red-500 text-base">*</span>
                    </label>
                    <input
                      type="text"
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px"
                      placeholder="e.g., Human, Dragon, Unicorn, Robot"
                      required
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { emoji: '🧑', name: 'Human' },
                        { emoji: '🐉', name: 'Dragon' },
                        { emoji: '🦄', name: 'Unicorn' },
                        { emoji: '🤖', name: 'Robot' },
                        { emoji: '🧚', name: 'Fairy' },
                        { emoji: '🧙', name: 'Wizard' }
                      ].map((species) => (
                        <div
                          key={species.name}
                          onClick={() => handleSpeciesChipClick(species.name)}
                          className="px-4 py-2 bg-gradient-to-br from-slate-50 to-slate-200 border border-gray-200 rounded-2xl text-[13px] text-gray-500 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-red-400 hover:to-orange-400 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,107,107,0.3)] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-red-100/20 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
                        >
                          {species.emoji} {species.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Character Age */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.4s' }}>
                  <div className="mb-6">
                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                      Age <span className="text-red-500 text-base">*</span>
                    </label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px"
                      placeholder="e.g., Young child, Teen, Adult"
                      required
                    />
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.5s' }}>
                  <div className="mb-6">
                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                      Personality Traits
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {[
                        { emoji: '😤', name: 'Brave', value: 'brave' },
                        { emoji: '😊', name: 'Kind', value: 'kind' },
                        { emoji: '🤔', name: 'Curious', value: 'curious' },
                        { emoji: '😄', name: 'Funny', value: 'funny' },
                        { emoji: '🧠', name: 'Wise', value: 'wise' },
                        { emoji: '🗺️', name: 'Adventurous', value: 'adventurous' }
                      ].map((trait) => (
                        <div
                          key={trait.value}
                          onClick={() => handleTraitClick(trait.value)}
                          className={`p-3 bg-white border-2 border-gray-200 rounded-2xl text-center text-sm font-medium cursor-pointer transition-all duration-300 ${
                            formData.personalityTraits.includes(trait.value)
                              ? 'bg-gradient-to-br from-red-400 to-orange-400 text-white border-red-400 scale-105'
                              : 'text-gray-500 hover:border-red-400 hover:text-red-400 hover:scale-105 hover:shadow-[0_4px_15px_rgba(255,107,107,0.2)]'
                          }`}
                        >
                          {trait.emoji} {trait.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="space-y-6">
                {/* Physical Features */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.6s' }}>
                  <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Physical Features <span className="text-red-500 text-base">*</span>
                  </label>
                  <textarea
                    name="physicalFeatures"
                    value={formData.physicalFeatures}
                    onChange={handleChange}
                    className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px min-h-[120px] resize-y font-[inherit]"
                    placeholder="Describe appearance: height, hair/fur color, eye color, distinctive features..."
                    required
                  />
                </div>

                {/* Clothing & Accessories */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.7s' }}>
                  <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Clothing & Accessories
                  </label>
                  <textarea
                    name="clothingAccessories"
                    value={formData.clothingAccessories}
                    onChange={handleChange}
                    className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px min-h-[120px] resize-y font-[inherit]"
                    placeholder="What does the character wear? Any special accessories?"
                  />
                </div>

                {/* Personality Description */}
                <div className="animate-section-slide-in" style={{ animationDelay: '0.8s' }}>
                  <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Personality Description <span className="text-red-500 text-base">*</span>
                  </label>
                  <textarea
                    name="personalityDescription"
                    value={formData.personalityDescription}
                    onChange={handleChange}
                    className="w-full p-[18px] border-2 border-gray-200 rounded-[20px] text-base bg-white transition-all duration-[400ms] focus:outline-none focus:border-red-400 focus:shadow-[0_0_0_6px_rgba(255,107,107,0.1)] focus:-translate-y-0.5 hover:border-gray-300 hover:-translate-y-px min-h-[120px] resize-y font-[inherit]"
                    placeholder="Describe the character's personality in detail..."
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-5 mt-12 justify-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-9 py-[18px] border-2 border-gray-200 bg-slate-50 text-gray-500 rounded-[20px] text-base font-semibold cursor-pointer transition-all duration-[400ms] min-w-[160px] hover:bg-gray-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-9 py-[18px] border-none bg-gradient-to-br from-red-400 to-orange-400 text-white rounded-[20px] text-base font-semibold cursor-pointer transition-all duration-[400ms] min-w-[160px] shadow-[0_8px_30px_rgba(255,107,107,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,107,107,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  {isSubmitting && (
                    <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  )}
                  {isSubmitting ? 'Creating Character...' : 'Create Character'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Child Profile Modal */}
        {showChildProfileModal && (
          <ChildProfileModal
            onClose={() => setShowChildProfileModal(false)}
            onSuccess={handleChildProfileSuccess}
          />
        )}
      </div>
    </>
  );
}
