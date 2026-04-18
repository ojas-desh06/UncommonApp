import type { Prediction } from "./types";

const globalStore = globalThis as unknown as {
  __verdictPredictionCache?: Map<string, Prediction>;
};

function cache(): Map<string, Prediction> {
  if (!globalStore.__verdictPredictionCache) {
    globalStore.__verdictPredictionCache = new Map();
  }
  return globalStore.__verdictPredictionCache;
}

export function savePrediction(prediction: Prediction): void {
  cache().set(prediction.id, prediction);
}

export function getPrediction(id: string): Prediction | undefined {
  return cache().get(id);
}
