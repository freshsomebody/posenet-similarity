import * as funcs from '../../src/libs/vectorizeAndNormalize';
import mockPoseData from '../mock-pose-data.json';

describe('vectorizeAndNormalize.ts', () => {
  test('convertPoseToVectors returns correct results', () => {
    // without weightOption
    expect(funcs.convertPoseToVectors(mockPoseData[0])).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 0.9, 0.7, (0.9 + 0.9 + 0.7)]
    ]);

    // with weightOption in scale mode
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'multiply', scores: { leftEye: 2 } })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 1.8, 0.7, (0.9 + 1.8 + 0.7)]
    ]);
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'multiply', scores: [0, 2] })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0, 1.8, 0.7, (0 + 1.8 + 0.7)]
    ]);

    // with weightOption in replace mode
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'replace', scores: { leftEye: 2 } })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 2, 0.7, (0.9 + 2 + 0.7)]
    ]);
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'replace', scores: [0, 2] })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0, 2, 0.7, (0 + 2 + 0.7)]
    ]);

    // with weightOption in addition mode
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'add', scores: { leftEye: 2 } })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 2.9, 0.7, (0.9 + 2.9 + 0.7)]
    ]);
    expect(funcs.convertPoseToVectors(mockPoseData[0], { mode: 'add', scores: [0, 2] })).toEqual([
      [2, 0, 2, 2, 2, 0],
      [1, 0, 2],
      [0.9, 2.9, 0.7, (0.9 + 2.9 + 0.7)]
    ]);
  });

  test('scaleAndTranslate returns correct result', () => {
    const mockVectorPoseXY = [4, 8, 2, 4];
    const mockTransformValues = [0.25, 0.5, 8]
    expect(funcs.scaleAndTranslate(mockVectorPoseXY, mockTransformValues)).toEqual([0.25, 0.5, 0, 0])
  });

  test('L2Normalization returns correct result', () => {
    const mockVectorPoseXY = [3, 4];
    expect(funcs.L2Normalization(mockVectorPoseXY)).toEqual([3 / 5, 4 / 5]);
  });
});
