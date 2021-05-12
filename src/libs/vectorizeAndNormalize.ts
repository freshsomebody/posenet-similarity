import { Pose, Options, WeightOption, WeightOptionMode } from '../types'

export function vectorizeAndNormalize (pose: Pose, options: Options): number[][] {
  let [vectorPoseXY, vecotPoseTransform, vectorPoseConfidences] = convertPoseToVectors(pose, options.customWeight)

  vectorPoseXY = scaleAndTranslate(vectorPoseXY, vecotPoseTransform)

  vectorPoseXY = L2Normalization(vectorPoseXY)

  return [
    vectorPoseXY,
    vectorPoseConfidences
  ]
}

/**
 * Covert the pose to a set of vectors
 *
 * @param pose The pose object to be converted.
 * @param weightOption The options to manipulate pose scores
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
export function convertPoseToVectors (pose: Pose, weightOption?: WeightOption): number[][] {
  const vectorPoseXY: number[] = []

  let translateX = Number.POSITIVE_INFINITY
  let translateY = Number.POSITIVE_INFINITY
  let scaler = Number.NEGATIVE_INFINITY

  let vectorScoresSum = 0
  const vectorScores: number[] = []

  // get weightOption if exists
  let mode: WeightOptionMode, scores: Record<string, number> | number[]
  if (weightOption) {
    mode = weightOption.mode
    if (!mode || typeof mode !== 'string') throw new TypeError('[Bad customWeight option] A mode must be specified and should be either \'multiply\', \'replace\' or \'add\'.')

    scores = weightOption.scores
    if (typeof scores !== 'object' && !Array.isArray(scores)) {
      throw new TypeError(`[Bad customWeight option] scores must be Object or Number[].
      Please refer the document https://github.com/freshsomebody/posenet-similarity to set it correctly.`)
    }
  }

  pose.keypoints.forEach((point, index) => {
    const x: number = point.position.x
    const y: number = point.position.y

    vectorPoseXY.push(x, y)

    translateX = Math.min(translateX, x)
    translateY = Math.min(translateY, y)
    scaler = Math.max(scaler, Math.max(x, y))

    let score = point.score
    // modify original score according to the weightOption
    if (mode && scores) {
      const scoreModifier: number = Array.isArray(scores) ? scores[index] : scores[point.part]

      // manipulate the original score
      if ((scoreModifier || scoreModifier === 0) && typeof scoreModifier === 'number') {
        switch (mode) {
          case 'multiply':
            score *= scoreModifier
            break
          case 'replace':
            score = scoreModifier
            break
          case 'add':
            score += scoreModifier
            break
          default:
            throw new Error(`[Bad customWeight option] A mode must be specified and should be either 'multiply', 'replace' or 'add'`)
        }
      }
    }

    vectorScoresSum += score
    vectorScores.push(score)
  })
  vectorScores.push(vectorScoresSum)

  return [
    vectorPoseXY,
    [translateX / scaler, translateY / scaler, scaler],
    vectorScores
  ]
}

/**
 * Scale and translate a pose to size 1*1
 *
 * @param vectorPoseXY The vector of pose keypoints x, y
 *        [x1, y1, x2, y2, ... , x17, y17]
 * @param transformValues The values to translate and scale pose keypoints x, y vector
 *        [translateX, translateY, scaler]
 *
 * @return An scaled and translated pose keypoints x, y vector in size 1*1
 *          [x1, y1, x2, y2, ... , x17, y17]
 */
export function scaleAndTranslate (vectorPoseXY: number[], transformValues: number[]): number[] {
  const [transX, transY, scaler] = transformValues

  return vectorPoseXY.map((position, index) => {
    return (index % 2 === 0
      ? position / scaler - transX
      : position / scaler - transY)
  })
}

/**
 * L2 nomalize a pose
 *
 * @param vectorPoseXY The vector of pose keypoints x, y
 *        [x1, y1, x2, y2, ... , x17, y17]
 *
 * @return An L2 normalized pose keypoints x, y vector in size 1*1
 *          [x1, y1, x2, y2, ... , x17, y17]
 */
export function L2Normalization (vectorPoseXY: number[]): number[] {
  let absVectorPoseXY = 0
  vectorPoseXY.forEach(position => {
    absVectorPoseXY += Math.pow(position, 2)
  })
  absVectorPoseXY = Math.sqrt(absVectorPoseXY)

  return vectorPoseXY.map(position => {
    return position / absVectorPoseXY
  })
}
