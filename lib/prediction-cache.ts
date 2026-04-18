import type { AdultPrediction, Prediction } from "./types";

export type AnyPrediction = Prediction | AdultPrediction;

const globalStore = globalThis as unknown as {
  __verdictPredictionCache?: Map<string, AnyPrediction>;
};

function cache(): Map<string, AnyPrediction> {
  if (!globalStore.__verdictPredictionCache) {
    globalStore.__verdictPredictionCache = new Map();
  }
  return globalStore.__verdictPredictionCache;
}

export function savePrediction(prediction: AnyPrediction): void {
  cache().set(prediction.id, prediction);
}

export function getPrediction(id: string): AnyPrediction | undefined {
  return cache().get(id);
}
