export interface Pose {
  keypoints: Keypoint[]
}

export interface Keypoint {
  position: {
    y: number
    x: number
  }
  part: string
  score: number
}

export type CustomStrategy = (vectorPose1XY: number[], vectorPose2XY: number[], vectorConfidences: number[]) => number

export interface Options {
  strategy?: 'cosineSimilarity' | 'cosineDistance' | 'weightedDistance' | CustomStrategy
  customWeight?: WeightOption
}

export interface WeightOption {
  mode: WeightOptionMode
  scores: Record<string, number> | number[]
}
export type WeightOptionMode = 'multiply' | 'replace' | 'add'
