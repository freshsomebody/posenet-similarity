import { Pose, Options } from './types'

export function poseSimilarity(pose1: Pose, pose2: Pose, overridenOptions?: Options): number | string {
  let [vectorPose1XY, vecotPose1Transform, vectorPose1Confidences] = convertPoseToVectors(pose1);
  let [vectorPose2XY, vecotPose2Transform] = convertPoseToVectors(pose2);

  vectorPose1XY = scaleAndTranslate(vectorPose1XY, vecotPose1Transform);
  vectorPose2XY = scaleAndTranslate(vectorPose2XY, vecotPose2Transform);

  vectorPose1XY = L2Normalization(vectorPose1XY);
  vectorPose2XY = L2Normalization(vectorPose2XY);

  // merge options
  const defaultOptions: Options = {
    strategy: 'weightedDistance'
  };
  const options = Object.assign({}, defaultOptions, overridenOptions)

  switch(options.strategy) {
    case 'cosineDistance':
      return cosineDistanceMatching(cosineSimilarity(vectorPose1XY, vectorPose2XY));
    case 'weightedDistance':
      return weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorPose1Confidences);
    default:
      return `[Wrong strategy option] It should be either 'cosineDistance' or 'weightedDistance' (default).`
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
 * [2] = The confidences (score) of pose keypoints and the sum of them
 *          [confidence1, confidence2, ..., confidence17, sumOfConfidences]
 */
export function convertPoseToVectors(pose: Pose): number[][] {
  let vectorPoseXY: number[] = [];

  let translateX = Number.POSITIVE_INFINITY;
  let translateY = Number.POSITIVE_INFINITY;
  let scaler = -1;

  let vectorConfidenceSum = 0;
  let vectorConfidences: number[] = [];

  pose.keypoints.forEach(point => {
    const x: number = point.position.x;
    const y: number = point.position.y;

    vectorPoseXY.push(x, y);

    translateX = Math.min(translateX, x);
    translateY = Math.min(translateY, y);
    scaler = Math.max(scaler, Math.max(x, y));

    vectorConfidenceSum += point.score;
    vectorConfidences.push(point.score);
  });
  vectorConfidences.push(vectorConfidenceSum);

  return [
    vectorPoseXY,
    [translateX / scaler, translateY / scaler, scaler],
    vectorConfidences
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
