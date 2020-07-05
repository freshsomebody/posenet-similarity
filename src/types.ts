export interface Pose {
  keypoints: Keypoint[]
};

export interface Keypoint {
  position: {
    y: number,
    x: number
  },
  part: string,
  score: number
};

export interface Options {
  strategy?: 'cosineSimilarity' | 'cosineDistance' | 'weightedDistance' | Function,
  customWeight?: WeightOption
};

export interface WeightOption {
  mode: WeightOptionMode,
  scores: Record<string, number> | number[]
}
export type WeightOptionMode = 'multiply' | 'replace' | 'add'
