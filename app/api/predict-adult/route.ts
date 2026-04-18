import { NextResponse } from "next/server";
import {
  adultLearnerProfileSchema,
  adultPredictResponseSchema,
  type AdultPredictResponse,
} from "@/lib/types";
import { generateMockAdultPrediction } from "@/lib/mock-adult-prediction";
import { savePrediction } from "@/lib/prediction-cache";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = adultLearnerProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const id = crypto.randomUUID();
  const prediction = generateMockAdultPrediction(id, parsed.data);
  savePrediction(prediction);

  const response: AdultPredictResponse = adultPredictResponseSchema.parse({
    id,
    prediction,
  });
  return NextResponse.json(response);
}
