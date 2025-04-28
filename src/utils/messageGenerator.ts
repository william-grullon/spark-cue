import fs from 'fs';
import path from 'path';
import { generateMessage } from '@/lib/openai';

const templatesPath = path.resolve(process.cwd(), 'data', 'fallbackTemplates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8')) as Record<string, string[]>;

interface Profile {
  id?: number;
  name: string;
  bio?: string;
  location?: string;
  pictures: { description: string }[];
  avatar_url?: string;
}

export async function generateOrFallback(profile: Profile, persona: string) {
  const prompt = `Generate a ${persona.toLowerCase()} opener message for ${profile.name} based on their pictures: ${profile.pictures.map(p => p.description).join(', ')}${profile.location ? ` and location ${profile.location}` : ''}. Keep it concise.`;
  try {
    const aiMessage = await generateMessage(prompt);
    return { message: aiMessage, source: 'AI' as const };
  } catch (err) {
    console.error('AI message generation failed:', err);
    const fallback = getFallbackMessage(profile, persona);
    return { message: fallback, source: 'Fallback' as const };
  }
}

export function getFallbackMessage(profile: Profile, persona: string) {
  const personaTemplates = templates[persona] || [];
  if (!personaTemplates.length) {
    throw new Error(`No templates for persona: ${persona}`);
  }
  const template = personaTemplates[Math.floor(Math.random() * personaTemplates.length)];
  return template
    .replace(/\${name}/g, profile.name)
    .replace(/\${location}/g, profile.location || '')
    .replace(/\${pictures\[(\d+)\]\.description}/g, (_, idx) => profile.pictures[+idx]?.description || '');
}