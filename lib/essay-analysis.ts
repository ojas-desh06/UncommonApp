import Anthropic from "@anthropic-ai/sdk";

export type EssayScores = {
  overall: number;
  authenticity: number;
  specificity: number;
  narrative: number;
  summary: string;
};

const SYSTEM_PROMPT = `You are an experienced college admissions counselor with 20+ years reviewing personal statements at selective US universities.

Evaluate the essay on four dimensions (1–10 each):
- overall: Overall strength and memorability
- authenticity: Genuine voice vs. generic/performative writing
- specificity: Concrete details and scenes vs. vague generalities
- narrative: Clear arc, compelling structure, goes somewhere

Return ONLY a valid JSON object with no other text:
{"overall": N, "authenticity": N, "specificity": N, "narrative": N, "summary": "one sentence on the essay's key strength or most important weakness"}`;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export async function analyzeEssay(
  essayText: string,
  pdfBase64?: string | null,
): Promise<EssayScores | null> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here") {
    return null;
  }

  const hasPdf = pdfBase64 && pdfBase64.length > 0;
  const hasText = essayText.trim().length > 50;
  if (!hasPdf && !hasText) return null;

  try {
    const userContent: Anthropic.MessageParam["content"] = hasPdf
      ? [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64! },
          } as Anthropic.DocumentBlockParam,
          { type: "text", text: "Analyze the college application personal essay in this PDF." },
        ]
      : [{ type: "text", text: `Essay:\n\n${essayText}` }];

    const response = await getClient().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return JSON.parse(text) as EssayScores;
  } catch {
    return null;
  }
}
