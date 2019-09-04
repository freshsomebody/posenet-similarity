# PosenetSimilarity
A package helps to quickly get the similarity (distance) between two poses estimated by [tfjs Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet).

## Installation
```
npm install posenet-similarity
```

## Usage
```js
import { poseSimilarity } from 'posenet-similarity';

// posenet setup and estimation of poses

// calculate with the default strategy
const weightedDistance = poseSimilarity(pose1, pose2);

// calculate with the specified strategy
const cosineDistance = poseSimilarity(pose1, pose2, { strategy: 'cosineDistance' });
```

### Syntax
```js
poseSimilarity(pose1, pose2[, options])
```
#### Parameters
pose1, pose2 : Object
- The single-pose objects estimated by Posenet
- Example structure can be referred under [Posenet README](https://github.com/tensorflow/tfjs-models/tree/master/posenet#single-person-pose-estimation)

options : Object (optional)
```js
{
  strategy: string,
  customWeight: {
    mode: string,
    scores: Object | Number[]
  }
}
```
- strategy: string
  - Determines which strategy is used to calculate the similarity (distance).
  - Accepts **'cosineDistance'** or **'weightedDistance'** (default).
  - More details can be checked in Move Mirror Blogpost of Refereces below.
- customWeight: Object (added in v0.3.0)
  - Customizes the scores of each keypoint which will be used and only work with strategy **'weightedDistance'**.
  - mode: string
    - Determines how the socres will be modified.
    - Accepts **'multiply'**, **'replace'** or **'add'** and must be specified when setting the customWeight option.
    - 'multiply' mode will multiply the original keypoint scores by the custom socres given below.
    - 'replace' mode will replace the original keypoint scores with the custom scores given below.
    - 'add' mode will sum up the original keypoint scores and the custom scores given below.
  - scores: Object | Array
    - The custom scores to manipulate the original keypoint scores which accept Object or Number[]
    - When giving an Object, the keys are the [part names of keypoints](https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints) to be modified, and values are numbers to manipulate the original scores, e.g., { nose: 0.1, leftEye: 0.2 } will only modify the scores of nose and leftEye.
    - When giving a Number[], the elements are numbers to manipuate the original scores and their indexes are corresponded with [ids of keypoints](https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints), e.g., [0.1, 0.2] will only modify the scores of nose and leftEye.
  - Assume we have a simplified set of keypoints as below
```js
[
  {
    "position": {
      "y": 1,
      "x": 1
    },
    "part": "nose",
    "score": 0.1
  },
  {
    "position": {
      "y": 2,
      "x": 2
    },
    "part": "leftEye",
    "score": 0.2
  },
  {
    "position": {
      "y": 3,
      "x": 3
    },
    "part": "rightEye",
    "score": 0.3
  }
]
```
The results of modified scores in different modes will be as below:
```js
/*
{
  customWeight: { mode: 'multiply', scores: { leftEye: 2} }
             or { mode: 'multiply', scores: [1, 2] }
}
*/

[
  {
    "position": {
      "y": 1,
      "x": 1
    },
    "part": "nose",
    "score": 0.1
  },
  {
    "position": {
      "y": 2,
      "x": 2
    },
    "part": "leftEye",
    "score": 0.4 // 0.2 * 2
  },
  {
    "position": {
      "y": 3,
      "x": 3
    },
    "part": "rightEye",
    "score": 0.3
  }
]
```

```js
/*
{
  customWeight: { mode: 'replace', scores: { leftEye: 2} }
             or { mode: 'replace', scores: [0.1, 2] }
}
*/

[
  {
    "position": {
      "y": 1,
      "x": 1
    },
    "part": "nose",
    "score": 0.1
  },
  {
    "position": {
      "y": 2,
      "x": 2
    },
    "part": "leftEye",
    "score": 2 // replaced by 2
  },
  {
    "position": {
      "y": 3,
      "x": 3
    },
    "part": "rightEye",
    "score": 0.3
  }
]
```

```js
/*
{
  customWeight: { mode: 'add', scores: { leftEye: 2} }
             or { mode: 'add', scores: [0, 2] }
}
*/

[
  {
    "position": {
      "y": 1,
      "x": 1
    },
    "part": "nose",
    "score": 0.1
  },
  {
    "position": {
      "y": 2,
      "x": 2
    },
    "part": "leftEye",
    "score": 2.2 // 0.2 + 2
  },
  {
    "position": {
      "y": 3,
      "x": 3
    },
    "part": "rightEye",
    "score": 0.3
  }
]
```



#### Returns
similarity/ distance : Number
- **Bigger** the value means **more similar** when using **similarity based strategies**
- **Smaller** the value means **more similar** when using **distance based strategies** (e.g. cosineDistance and weightedDistance)

## References
- [tfjs-models/Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
- [Move Mirror Blogpost](https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23)
