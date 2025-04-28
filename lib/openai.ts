import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMessage(prompt: string, model = process.env.AI_MODEL || 'gpt-4-turbo') {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider !== 'openai') {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });
  const content = response.choices[0].message?.content;
  return content || '';
}