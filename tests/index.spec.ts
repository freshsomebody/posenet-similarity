import * as funcs from '../src/index';
import mockPoseData from './mock-pose-data.json';
import { Pose, Options, WeightOption } from '../src/types'

describe('index.ts', () => {
  const badPoseErrMsg = new RegExp(/Bad pose parameters/);
  const badStrategyErrMsg = new RegExp(/Bad strategy option/);
  const badCustomWeightErrMsg = new RegExp(/Bad customWeight option/);

  test('poseSimilarity throws error if receiving bad pose objects', () => {
    expect(() => {
      funcs.poseSimilarity({} as Pose, mockPoseData[1])
    }).toThrow(badPoseErrMsg);

    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], {} as Pose)
    }).toThrow(badPoseErrMsg);

    expect(() => {
      funcs.poseSimilarity({ keypoints: [] }, mockPoseData[1])
    }).toThrow(badPoseErrMsg);

    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], { keypoints: [] })
    }).toThrow(badPoseErrMsg);

    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], {
        keypoints: [
          {
            "position": {
              "x": 0,
              "y": 3
            },
            "part": "nose",
            "score": 0.002
          }
        ]
      })
    }).toThrow(badPoseErrMsg);
  });

  test('poseSimilarity throws error if receiving a bad strategy option', () => {
    // bad string strategies
    let options = {
      strategy: 'badStrategy'
    }
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)
    }).toThrow(badStrategyErrMsg);

    // bad types of strategies
    options.strategy = 1;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)
    }).toThrow(badStrategyErrMsg);

    options.strategy = true;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)
    }).toThrow(badStrategyErrMsg);

    options.strategy = [1, 2];
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)
    }).toThrow(badStrategyErrMsg);
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
    }).toThrow(badCustomWeightErrMsg);

    // bad mode
    badOption.customWeight = { mode: 'bad', scores: { nose: 1 } } as WeightOption;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(badCustomWeightErrMsg);

    // bad scores
    badOption.customWeight = { mode: 'multiply', scores: 1 } as WeightOption;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(badCustomWeightErrMsg);

    badOption.customWeight.scores = '{ nose: 1 }';
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(badCustomWeightErrMsg);

    badOption.customWeight.scores = true;
    expect(() => {
      funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], badOption)
    }).toThrow(badCustomWeightErrMsg);
  });

  test('poseSimilarity returns correct result with default strategy', () => {
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1])).toBeCloseTo(0.68, 2);
  });

  test('poseSimilarity returns correct result with strategy cosineDistance', () => {
    const options: Options = {
      strategy: 'cosineSimilarity'
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBeCloseTo(0.5, 2);
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

  test('poseSimilarity returns correct result with a function type of strategy', () => {
    const options = {
      strategy: () => 1
    }
    expect(funcs.poseSimilarity(mockPoseData[0], mockPoseData[1], options)).toBe(1);
  });
});
