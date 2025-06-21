export interface StyleDefinition {
  key: string
  label: string
  promptPrefix: string
  sample: string
}

export const STYLE_PREFIXES: Record<string, string> = {
  storybook_soft: 'gentle watercolor children\'s storybook style',
  sora_cinema: '3-D animation film aesthetic, cinematic lighting',
  pixel_quest: '16-bit RPG pixel art',
  comic_bold: 'bold ink comic style with dynamic shading'
}

export const STYLES: StyleDefinition[] = [
  {
    key: 'storybook_soft',
    label: 'Storybook Soft',
    promptPrefix: 'gentle watercolor children\'s storybook style',
    sample: 'storybook_soft.png'
  },
  {
    key: 'sora_cinema',
    label: 'Sora Cinema',
    promptPrefix: '3-D animation film aesthetic, cinematic lighting',
    sample: 'sora_cinema.png'
  },
  {
    key: 'pixel_quest',
    label: 'Pixel Quest',
    promptPrefix: '16-bit RPG pixel art',
    sample: 'pixel_quest.png'
  },
  {
    key: 'comic_bold',
    label: 'Comic Bold',
    promptPrefix: 'bold ink comic style with dynamic shading',
    sample: 'comic_bold.png'
  }
]

export const getStyleByKey = (key: string): StyleDefinition | undefined => {
  return STYLES.find(style => style.key === key)
}
