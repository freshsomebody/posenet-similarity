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
  strategy?: string | Function,
  customWeight?: WeightOption
};

export interface WeightOption {
  mode: string,
  scores: Record<string, number> | number[]
}
