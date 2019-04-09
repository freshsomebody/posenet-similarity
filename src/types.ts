export interface Pose {
  keypoints: Keypoint[]
};

export interface Keypoint {
  position: {
    y: number,
    x: number
  },
  score: number
};

export interface Options {
  strategy: string
};