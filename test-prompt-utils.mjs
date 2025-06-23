// Simple ES Module test for AI prompt utilities
// We'll simulate the functions since we can't import TS directly

// Simulated functions based on the actual TypeScript implementation
function generateIllustrationPrompt(character, scene) {
  const characterDesc = `${character.name} the ${character.species}`;
  const traitsDesc = character.traits ? character.traits.join(', ') : '';
  
  return `---
character: ${characterDesc}
physical_traits: ${traitsDesc}
scene_location: ${scene.location}
scene_action: ${scene.action}
art_style: children's book illustration
quality: high quality, detailed
mood: magical, enchanting
---

Create a children's book illustration of ${characterDesc} with ${traitsDesc}, ${scene.action} in ${scene.location}. The image should be magical and enchanting, suitable for a children's storybook.`;
}

function cleanForClaude(prompt) {
  return prompt
    .replace(/---[\s\S]*?---\n\n/, '') // Remove YAML front matter
    .replace(/\n\n+/g, '\n\n') // Normalize line breaks
    .trim();
}

function buildCharacterMemory(character, notes) {
  return `Character: ${character.name} (${character.species})
Physical traits: ${character.traits ? character.traits.join(', ') : 'none specified'}
Consistency notes: ${notes}
Remember these details for future illustrations.`;
}

// Test the functions with Luna dragon
const lunaCharacter = {
  name: 'Luna',
  species: 'Dragon',
  traits: ['purple scales', 'silver belly', 'tiny wings']
};

const forestScene = {
  location: 'Enchanted Forest waterfall cave',
  action: 'Flying up toward glowing runes'
};

console.log('=== GENERATED ILLUSTRATION PROMPT ===');
const lunaPrompt = generateIllustrationPrompt(lunaCharacter, forestScene);
console.log(lunaPrompt);

console.log('\n=== CLEANED PROMPT FOR CLAUDE ===');
const cleanPrompt = cleanForClaude(lunaPrompt);
console.log(cleanPrompt);

console.log('\n=== CHARACTER MEMORY ===');
const memory = buildCharacterMemory(
  lunaCharacter,
  'Luna is the protagonist in all story illustrations.'
);
console.log(memory);

console.log('\n=== TESTING DIFFERENT SCENES ===');
const caveScene = {
  location: 'Crystal cave with rainbow gemstones',
  action: 'Discovering a hidden treasure chest'
};

const cavePrompt = generateIllustrationPrompt(lunaCharacter, caveScene);
console.log('\n--- Cave Scene Prompt ---');
console.log(cleanForClaude(cavePrompt));

const skyScene = {
  location: 'Cloudy sky above a magical kingdom',
  action: 'Soaring through fluffy white clouds'
};

const skyPrompt = generateIllustrationPrompt(lunaCharacter, skyScene);
console.log('\n--- Sky Scene Prompt ---');
console.log(cleanForClaude(skyPrompt));
