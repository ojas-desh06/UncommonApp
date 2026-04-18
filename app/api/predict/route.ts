import { NextResponse } from "next/server";
import {
  predictResponseSchema,
  studentProfileSchema,
  type PredictResponse,
} from "@/lib/types";
import { generateMockPrediction } from "@/lib/mock-prediction";
import { savePrediction } from "@/lib/prediction-cache";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = studentProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const id = crypto.randomUUID();
  const prediction = generateMockPrediction(id, parsed.data);
  savePrediction(prediction);

  const response: PredictResponse = predictResponseSchema.parse({
    id,
    prediction,
  });
  return NextResponse.json(response);
}
