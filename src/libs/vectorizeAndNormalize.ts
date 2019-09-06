import { Pose, Options, WeightOption } from '../types';

export function vectorizeAndNormalize(pose: Pose, options: Options): number[][] {
  let [vectorPoseXY, vecotPoseTransform, vectorPoseConfidences] = convertPoseToVectors(pose, options.customWeight);

  vectorPoseXY = scaleAndTranslate(vectorPoseXY, vecotPoseTransform);

  vectorPoseXY = L2Normalization(vectorPoseXY);

  return [
    vectorPoseXY,
    vectorPoseConfidences
  ]
}

/**
 * Covert the pose to a set of vectors
 * 
 * @param pose The pose object to be converted.
 * 
 * @return An array of vectors which stand for
 * [0] = The vector of pose keypoints x, y.
 *          [x1, y1, x2, y2, ... , x17, y17]
 * [1] = The values to translate and scale pose keypoints x, y vector.
 *          [translateX, translateY, scaler]
 * [2] = The scores of pose keypoints and the sum of them
 *          [score1, score2, ..., score17, sumOfScores]
 *          Will be used for the weightedDistance strategy
 */
export function convertPoseToVectors(pose: Pose, weightOption?: WeightOption): number[][] {
  let vectorPoseXY: number[] = [];

  let translateX = Number.POSITIVE_INFINITY;
  let translateY = Number.POSITIVE_INFINITY;
  let scaler = Number.NEGATIVE_INFINITY;

  let vectorScoresSum = 0;
  let vectorScores: number[] = [];

  // get weightOption if exists
  let mode: string, scores: Record<string, number> | number[];
  if (weightOption) {
    mode = weightOption.mode;
    if (typeof weightOption.scores !== 'object') throw new TypeError(`[Bad customWeight option] scores must be Object or Number[].
      Please refer the document https://github.com/freshsomebody/posenet-similarity to set it correctly.`);
    scores = weightOption.scores
  }

  pose.keypoints.forEach((point, index) => {
    const x: number = point.position.x;
    const y: number = point.position.y;

    vectorPoseXY.push(x, y);

    translateX = Math.min(translateX, x);
    translateY = Math.min(translateY, y);
    scaler = Math.max(scaler, Math.max(x, y));

    let score = point.score;
    // modify original score according to the weightOption
    if (scores) {
      let scoreModifier: boolean | number = false;
      // try to get scores from the weightOption
      if (scores[point.part] || scores[point.part] === 0) scoreModifier = scores[point.part]
      if (scores[index] || scores[index] === 0) scoreModifier = scores[index]

      // manipulate the original score
      if ((scoreModifier || scoreModifier === 0) && typeof scoreModifier === 'number') {
        switch (mode) {
          case 'multiply':
            score *= scoreModifier;
            break;
          case 'replace':
            score = scoreModifier;
            break;
          case 'add':
            score += scoreModifier;
            break;
          default:
            throw new Error(`[Bad customWeight option] A mode must be specified and should be either 'multiply', 'replace' or 'add'`)
        }
      }
    }

    vectorScoresSum += score;
    vectorScores.push(score);
  });
  vectorScores.push(vectorScoresSum);

  return [
    vectorPoseXY,
    [translateX / scaler, translateY / scaler, scaler],
    vectorScores
  ]
}

export function scaleAndTranslate(vectorPoseXY: number[], transformValues: number[]): number[] {
  const [transX, transY, scaler] = transformValues;

  return vectorPoseXY.map((position, index) => {
    return (index % 2 === 0 ?
      position / scaler - transX :
      position / scaler - transY);
  });
}

export function L2Normalization(vectorPoseXY: number[]): number[] {
  let absVectorPoseXY = 0;
  vectorPoseXY.forEach(position => {
    absVectorPoseXY += Math.pow(position, 2);
  });
  absVectorPoseXY = Math.sqrt(absVectorPoseXY);

  return vectorPoseXY.map(position => {
    return position / absVectorPoseXY;
  });
}