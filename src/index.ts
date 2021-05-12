import { Pose, Options } from './types'
import { vectorizeAndNormalize } from './libs/vectorizeAndNormalize'
import { cosineSimilarity, cosineDistanceMatching, weightedDistanceMatching } from './libs/strategies'

export function poseSimilarity (pose1: Pose, pose2: Pose, overridenOptions?: Options): number | Error {
  // check inputted poses
  if (
    !pose1 || !pose1.keypoints ||
    !pose2 || !pose2.keypoints
  ) {
    throw new Error('[Bad pose parameters] Please check your pose objects again.')
  }

  if (pose1.keypoints.length === 0 || pose2.keypoints.length === 0) {
    throw new Error('[Bad pose parameters] Found pose object(s) with empty keypoint.')
  }

  if (pose1.keypoints.length !== pose2.keypoints.length) {
    throw new Error('[Bad pose parameters] The keypoint lengths of the two pose objects are not the same.')
  }

  // merge options
  const defaultOptions: Options = {
    strategy: 'weightedDistance'
  }
  const options = Object.assign({}, defaultOptions, overridenOptions)

  const [vectorPose1XY, vectorPose1Scores] = vectorizeAndNormalize(pose1, options)
  const [vectorPose2XY] = vectorizeAndNormalize(pose2, options)

  // execute strategy
  // if strategy is given by the string form
  if (typeof options.strategy === 'string') {
    switch (options.strategy) {
      case 'cosineSimilarity':
        return cosineSimilarity(vectorPose1XY, vectorPose2XY)
      case 'cosineDistance':
        return cosineDistanceMatching(vectorPose1XY, vectorPose2XY)
      case 'weightedDistance':
        return weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorPose1Scores)
      default:
        throw new Error(`[Bad strategy option] It should be either 'cosineSimilarity', 'cosineDistance' or 'weightedDistance' (default).`)
    }
  // if strategy is given by a custom function
  } else if (typeof options.strategy === 'function') {
    return options.strategy(vectorPose1XY, vectorPose2XY, vectorPose1Scores)
  } else {
    throw new TypeError('[Bad strategy option] It only accepts string or function types of values.')
  }
}

export { vectorizeAndNormalize } from './libs/vectorizeAndNormalize'
export { cosineSimilarity, cosineDistanceMatching, weightedDistanceMatching } from './libs/strategies'
