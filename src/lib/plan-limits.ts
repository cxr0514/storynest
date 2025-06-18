// Plan limits configuration for StoryNest subscription tiers

export interface PlanLimits {
  storiesPerMonth: number;
  imagesPerStory: number;
  childProfiles: number;
  charactersLimit: number;
  features: string[];
}

export function getPlanLimits(plan: string): PlanLimits {
  const plans: Record<string, PlanLimits> = {
    free: {
      storiesPerMonth: 3,
      imagesPerStory: 1,
      childProfiles: 1,
      charactersLimit: 3,
      features: ['basic-stories', 'reading-progress', 'low-res-images']
    },
    starter: {
      storiesPerMonth: 30,
      imagesPerStory: 3,
      childProfiles: 3,
      charactersLimit: -1, // unlimited
      features: ['character-creation', 'character-consistency', 'hd-images', 'priority-queue']
    },
    premium: {
      storiesPerMonth: 100,
      imagesPerStory: 5,
      childProfiles: -1, // unlimited
      charactersLimit: -1, // unlimited
      features: ['advanced-customization', 'audio-narration', 'offline-reading', 'early-access']
    },
    lifetime: {
      storiesPerMonth: 100,
      imagesPerStory: 5,
      childProfiles: -1, // unlimited
      charactersLimit: -1, // unlimited
      features: ['all-premium-features', 'annual-printed-book']
    }
  };

  return plans[plan] || plans.free;
}
