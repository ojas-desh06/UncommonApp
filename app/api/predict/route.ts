import { NextResponse } from "next/server";
import {
  predictResponseSchema,
  studentProfileSchema,
  type PredictResponse,
} from "@/lib/types";
import { generatePrediction } from "@/lib/prediction";
import { savePrediction } from "@/lib/prediction-cache";
import { analyzeEssay } from "@/lib/essay-analysis";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const pdfBase64 = typeof body.essay_pdf_base64 === "string" ? body.essay_pdf_base64 : null;

  const parsed = studentProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const essayScores = await analyzeEssay(parsed.data.essay, pdfBase64);

  const id = crypto.randomUUID();
  const prediction = await generatePrediction(id, parsed.data, essayScores);
  savePrediction(prediction);

  const response: PredictResponse = predictResponseSchema.parse({
    id,
    prediction,
  });
  return NextResponse.json(response);
}
