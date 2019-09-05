import { Pose, Options } from './types';
import { vectorizeAndNormalize } from './libs/vectorizeAndNormalize';
import { cosineDistanceMatching, weightedDistanceMatching } from './libs/strategies';

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

  let [vectorPose1XY, vectorPose1Confidences] = vectorizeAndNormalize(pose1, options);
  let [vectorPose2XY] = vectorizeAndNormalize(pose2, options);

  // execute strategy
  switch(options.strategy) {
    case 'cosineDistance':
      return cosineDistanceMatching(vectorPose1XY, vectorPose2XY);
    case 'weightedDistance':
      return weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorPose1Confidences);
    default:
      throw new Error(`[Bad strategy option] It should be either 'cosineDistance' or 'weightedDistance' (default).`);
  }
}

export { vectorizeAndNormalize } from './libs/vectorizeAndNormalize';
