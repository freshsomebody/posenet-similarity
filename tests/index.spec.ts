import * as funcs from '../src/index';
import mockPoseData from './mock-pose-data.json';

describe('index.ts', () => {
  test('poseSimilarity returns correct result with default strategy', () => {
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1])).toBeCloseTo(0.68, 2);
  });

  test('poseSimilarity returns correct result with strategy cosineDistance', () => {
    const options = {
      strategy: 'cosineDistance'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(1, 2);
  });

  test('poseSimilarity returns correct result with strategy weightedDistance', () => {
    const options = {
      strategy: 'weightedDistance'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.68, 2);
  });

  test('poseSimilarity returns error message if passing a wrong strategy option', () => {
    const options = {
      strategy: 'wrongStrategy'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toMatch(/Wrong strategy option/);
  });

  test('convertPoseToVectors returns correct results', () => {
    expect(funcs.convertPoseToVectors(mockPoseData[0])).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 0.9, 0.7, (0.9 + 0.9 + 0.7)]
    ]);
  });

  test('scaleAndTranslate returns correct result', () => {
    const mockVectorPoseXY = [4, 8, 2, 4];
    const mocktTansformValues = [0.25, 0.5, 8]
    expect(funcs.scaleAndTranslate(mockVectorPoseXY, mocktTansformValues)).toEqual([0.25, 0.5, 0, 0])
  });

  test('L2Normalization returns correct result', () => {
    const mockVectorPoseXY = [3, 4];
    expect(funcs.L2Normalization(mockVectorPoseXY)).toEqual([3 / 5, 4 / 5]);
  });

  test('cosineSimilarity returns correct result', () => {
    const vector1 = [1, 0, 1, 1, 1];
    const vector2 = [0, 1, 1, 1, 1];
    expect(funcs.cosineSimilarity(vector1, vector2)).toBe(0.75);
  });

  test('cosineDistanceMatching returns correct result', () => {
    const cosSimilarity = 0.75
    expect(funcs.cosineDistanceMatching(cosSimilarity)).toBeCloseTo(0.7, 1);
  });

  test('weightedDistanceMatching returns correct result', () => {
    const vector1 = [1, 0, 1, 1, 1, 0];
    const vector2 = [0, 1, 1, 1, 1, 0];
    const vectorConfidences = [0.9, 0.9, 0.7, 2.5];
    expect(funcs.weightedDistanceMatching(vector1, vector2, vectorConfidences)).toBeCloseTo(0.72, 2);
  });
});
