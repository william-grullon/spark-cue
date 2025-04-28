import OpenAI from "openai";

// Create a dummy API key for build time if the environment variable is missing
const apiKey = process.env.OPENAI_API_KEY || "dummy-key-for-build-time";

const openai = new OpenAI({
  apiKey,
});

export async function generateMessage(
  prompt: string,
  model = process.env.AI_MODEL || "gpt-4-turbo"
) {
  // Log the prompt being sent to OpenAI
  console.log("Sending prompt to OpenAI:", prompt);

  // Skip API calls during build time if using the dummy key
  if (apiKey === "dummy-key-for-build-time") {
    console.log("Skipping OpenAI API call during build time");
    return "This is a placeholder message for build time";
  }

  const provider = process.env.AI_PROVIDER || "openai";
  if (provider !== "openai") {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  const content = response.choices[0].message?.content;
  // Log the response from OpenAI
  console.log("Received response from OpenAI:", response);
  // Log the response content
  console.log("Response content:", content);

  return content || "";
}
