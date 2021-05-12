export function cosineSimilarity (vectorPose1XY: number[], vectorPose2XY: number[]): number {
  let v1DotV2 = 0
  let absV1 = 0
  let absV2 = 0

  vectorPose1XY.forEach((v1, index) => {
    const v2 = vectorPose2XY[index]
    v1DotV2 += v1 * v2
    absV1 += v1 * v1
    absV2 += v2 * v2
  })
  absV1 = Math.sqrt(absV1)
  absV2 = Math.sqrt(absV2)

  return v1DotV2 / (absV1 * absV2)
}

export function cosineDistanceMatching (vectorPose1XY: number[], vectorPose2XY: number[]): number {
  const cosSimilarity = cosineSimilarity(vectorPose1XY, vectorPose2XY)

  return Math.sqrt(2 * (1 - cosSimilarity))
}

export function weightedDistanceMatching (vectorPose1XY: number[], vectorPose2XY: number[], vectorConfidences: number[]): number {
  const summation1 = 1 / vectorConfidences[vectorConfidences.length - 1]

  let summation2 = 0
  for (let i = 0; i < vectorPose1XY.length; i++) {
    const confIndex = Math.floor(i / 2)
    summation2 += vectorConfidences[confIndex] * Math.abs(vectorPose1XY[i] - vectorPose2XY[i])
  }

  return summation1 * summation2
}
