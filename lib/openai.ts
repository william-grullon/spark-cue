import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generateMessage(prompt: string, model = process.env.AI_MODEL || 'gpt-4-turbo') {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider !== 'openai') {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const response = await openai.createChatCompletion({
    model,
    messages: [{ role: 'user', content: prompt }],
  });
  const content = response.data.choices[0].message?.content;
  return content || '';
}