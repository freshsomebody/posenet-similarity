import { Pose, Options, WeightOption } from './types'

export function poseSimilarity(pose1: Pose, pose2: Pose, overridenOptions?: Options): number | Error {
  // check inputted poses
  if (
    !pose1 || !pose1.keypoints || pose1.keypoints.length === 0 ||
    !pose2 || !pose2.keypoints || pose2.keypoints.length === 0
  ) {
    throw new Error('[Bad pose parameters] Please check your pose objects again.');
  }

  // merge options
  const defaultOptions: Options = {
    strategy: 'weightedDistance'
  };
  const options = Object.assign({}, defaultOptions, overridenOptions);

  let [vectorPose1XY, vecotPose1Transform, vectorPose1Confidences] = convertPoseToVectors(pose1, options.customWeight);
  let [vectorPose2XY, vecotPose2Transform] = convertPoseToVectors(pose2);

  vectorPose1XY = scaleAndTranslate(vectorPose1XY, vecotPose1Transform);
  vectorPose2XY = scaleAndTranslate(vectorPose2XY, vecotPose2Transform);

  vectorPose1XY = L2Normalization(vectorPose1XY);
  vectorPose2XY = L2Normalization(vectorPose2XY);

  // execute strategy
  switch(options.strategy) {
    case 'cosineDistance':
      return cosineDistanceMatching(cosineSimilarity(vectorPose1XY, vectorPose2XY));
    case 'weightedDistance':
      return weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorPose1Confidences);
    default:
      throw new Error(`[Bad strategy option] It should be either 'cosineDistance' or 'weightedDistance' (default).`);
  }
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
  let mode: string, scores: any;
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

export function cosineSimilarity(vectorPose1XY: number[], vectorPose2XY: number[]): number {
  let v1DotV2 = 0;
  let absV1 = 0;
  let absV2 = 0;

  vectorPose1XY.forEach((v1, index) => {
    const v2 = vectorPose2XY[index];
    v1DotV2 += v1 * v2;
    absV1 += v1 * v1;
    absV2 += v2 * v2;
  })
  absV1 = Math.sqrt(absV1);
  absV2 = Math.sqrt(absV2);

  return v1DotV2 / (absV1 * absV2);
}

export function cosineDistanceMatching(cosSimilarity: number): number {
  return Math.sqrt(2 * (1 - cosSimilarity));
}

export function weightedDistanceMatching(vectorPose1XY: number[], vectorPose2XY: number[], vectorConfidences: number[]): number {
  const summation1 = 1 / vectorConfidences[vectorConfidences.length - 1];

  let summation2 = 0;
  for (let i = 0; i < vectorPose1XY.length; i++) {
    let confIndex = Math.floor(i / 2);
    summation2 += vectorConfidences[confIndex] * Math.abs(vectorPose1XY[i] - vectorPose2XY[i]);
  }

  return summation1 * summation2;
}
