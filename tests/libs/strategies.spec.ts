import * as funcs from '../../src/libs/strategies';

test('cosineDistanceMatching returns correct result', () => {
  const vector1 = [1, 0, 1, 1, 1];
  const vector2 = [0, 1, 1, 1, 1];
  expect(funcs.cosineDistanceMatching(vector1, vector2)).toBeCloseTo(0.7, 1);
});

test('cosineSimilarity returns correct result', () => {
  const vector1 = [1, 0, 1, 1, 1];
  const vector2 = [0, 1, 1, 1, 1];
  expect(funcs.cosineSimilarity(vector1, vector2)).toBe(0.75);
});

test('weightedDistanceMatching returns correct result', () => {
  const vector1 = [1, 0, 1, 1, 1, 0];
  const vector2 = [0, 1, 1, 1, 1, 0];
  const vectorConfidences = [0.9, 0.9, 0.7, 2.5];
  expect(funcs.weightedDistanceMatching(vector1, vector2, vectorConfidences)).toBeCloseTo(0.72, 2);
});
