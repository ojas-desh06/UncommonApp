import { NextResponse } from "next/server";
import { analyzeEssay } from "@/lib/essay-analysis";

export async function POST(req: Request) {
  let body: { essay?: string; essay_pdf_base64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_api_key_here";
  if (!hasKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }

  const scores = await analyzeEssay(body.essay ?? "", body.essay_pdf_base64 ?? null);
  if (!scores) {
    return NextResponse.json(
      { error: "Claude API call failed — check the server terminal for the specific error." },
      { status: 500 },
    );
  }
  return NextResponse.json(scores);
}
