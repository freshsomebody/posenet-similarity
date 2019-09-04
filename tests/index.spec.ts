import * as funcs from '../src/index';
import mockPoseData from './mock-pose-data.json';
import { Pose, Options, WeightOption } from '../src/types'

describe('index.ts', () => {
  test('poseSimilarity throws error if receiving bad pose objects', () => {
    expect(() => {
      funcs.poseSimilarity({} as Pose, mockPoseData[1])
    }).toThrow(/Bad pose parameters/);

    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], {} as Pose)
    }).toThrow(/Bad pose parameters/);

    expect(() => {
      funcs.poseSimilarity({ keypoints: [] }, mockPoseData[1])
    }).toThrow(/Bad pose parameters/);

    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], { keypoints: [] })
    }).toThrow(/Bad pose parameters/);
  });

  test('poseSimilarity throws error if receiving a bad strategy option', () => {
    const options = {
      strategy: 'badStrategy'
    }
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)
    }).toThrow(/Bad strategy option/);
  });

  test('poseSimilarity throws error if receiving a bad customWeight option', () => {
    // set scores but mode
    let badOption: Options = {
      customWeight: {
        scores: { nose: 1 }
      } as WeightOption
    }
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(/Bad customWeight option/);

    // bad mode
    badOption.customWeight = { mode: 'bad', scores: { nose: 1 } } as WeightOption;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(/Bad customWeight option/);

    // bad scores
    badOption.customWeight = { mode: 'multiply', scores: 1 } as WeightOption;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(/Bad customWeight option/);

    badOption.customWeight.scores = '{ nose: 1 }';
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(/Bad customWeight option/);

    badOption.customWeight.scores = true;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(/Bad customWeight option/);
  });

  test('poseSimilarity returns correct result with default strategy', () => {
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1])).toBeCloseTo(0.68, 2);
  });

  test('poseSimilarity returns correct result with strategy cosineDistance', () => {
    const options: Options = {
      strategy: 'cosineDistance'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(1, 2);

    // cosineDistance does not affect by the customWeight
    // with customWeight in multiply mode
    options.customWeight = {
      mode: 'multiply',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(1, 2);

    // with customWeight in replace mode
    options.customWeight = {
      mode: 'replace',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(1, 2);

    // with customWeight in add mode
    options.customWeight = {
      mode: 'add',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(1, 2);
  });

  test('poseSimilarity returns correct result with strategy weightedDistance', () => {
    let options: Options = {
      strategy: 'weightedDistance'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.68, 2);

    // with customWeight in multiply mode
    options.customWeight = {
      mode: 'multiply',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.61, 2);

    // with customWeight in replace mode
    options.customWeight = {
      mode: 'replace',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.62, 2);

    // with customWeight in add mode
    options.customWeight = {
      mode: 'add',
      scores: { leftEye: 0.5 }
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.73, 2);
  });

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
