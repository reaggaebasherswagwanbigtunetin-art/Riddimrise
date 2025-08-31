import { openAiApiKey } from "./config";

export async function fetchOpenAiCompletion(prompt) {
  if (!openAiApiKey) {
    throw new Error("OpenAI API key not set");
  }
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      max_tokens: 50
    })
  });
  if (!response.ok) throw new Error("Failed to fetch OpenAI completion");
  return response.json();
}
