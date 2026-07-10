import { anthropicApiKey } from "./config";

// Calls Claude via the Anthropic Messages API and returns the reply text.
// Note: hitting the API directly from the app embeds the key in the shipped
// build — fine for prototyping, but move this behind a backend proxy before
// shipping to production. Requires an Anthropic API key from
// console.anthropic.com (this is separate from a Claude Max subscription).
export async function fetchClaudeCompletion(
  prompt,
  { maxTokens = 256, model = "claude-opus-4-8" } = {}
) {
  if (!anthropicApiKey) {
    throw new Error("Anthropic API key not set");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Claude request failed (${response.status})${detail ? `: ${detail}` : ""}`
    );
  }
  const json = await response.json();
  // The Messages API returns content as an array of blocks; join the text ones.
  return (json.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}
