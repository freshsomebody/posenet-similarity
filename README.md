# PosenetSimilarity
A package helps to quickly get the similarity/ distance between two poses estimated by [tfjs Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet).

## Installation
via script tag
```html
<script src="https://cdn.jsdelivr.net/npm/posenet-similarity/dist/posenet-similarity.min.js"></script>
```

via NPM
```
npm install posenet-similarity
```

## Example usages
> NOTE: PosenetSimilarity doesn't need Posenet to be installed and work together. The examples just show how you might chain the outputs of Posenet with PosenetSimilarity.

When using PosenetSimilarity in the browsers, it will expose **pns** globally for accessing the APIs.
```html
<html>
  <head>
    <!-- Load TensorFlow.js -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <!-- Load Posenet -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet"></script>
    <!-- Load posenet-similarity -->
    <script src="https://cdn.jsdelivr.net/npm/posenet-similarity/dist/posenet-similarity.min.js"></script>
 </head>

  <body>
    <img id='pose1' src='/images/pose1.jpg '/>
    <img id='pose2' src='/images/pose2.jpg '/>
  </body>

  <script>
    var pose1ImageElement = document.getElementById('pose1');
    var pose2ImageElement = document.getElementById('pose2');

    // For more detailed Posenet setup, please refer its own document.
    // Load Posenet model
    posenet.load().then(function(net) {
      // Estimate the two poses
      return Promise.all([
        net.estimateSinglePose(pose1),
        net.estimateSinglePose(pose2)
      ])
    }).then(function(poses){
      // Calculate the weighted distance between the two poses
      var weightedDistance = pns.poseSimilarity(poses[0], poses[1]);
      console.log(weightedDistance)
    })
  </script>
</html>
```

via NPM
```js
import * as posenet from '@tensorflow-models/posenet';
import { poseSimilarity } from 'posenet-similarity';

// For more detailed Posenet setup, please refer its own document.
async function estimatePoseOnImage(imageElement) {
  // load the posenet model from a checkpoint
  const net = await posenet.load();
  // Estimate the pose on the imageElement
  const poses = await net.estimateSinglePose(imageElement);
  return pose;
}

const pose1ImageElement = document.getElementById('pose1');
const pose2ImageElement = document.getElementById('pose2');

Promise.all([
  estimatePoseOnImage(pose1ImageElement),
  estimatePoseOnImage(pose2ImageElement)
]).then(poses => {
  // Calculate the weighted distance between the two poses
  const weightedDistance = poseSimilarity(poses[0], poses[1]);
  console.log(weightedDistance)
});
```

## API
### poseSimilarity(pose1, pose2[, options]): number
As the main and entry method of this package, it accepts 2 pose objects which were the predictive results from [tfjs PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) and returns a numeric value of the similarity or distance between them.
```js
import { poseSimilarity } from 'posenet-similarity';

// calculate with the default strategy
const weightedDistance = poseSimilarity(pose1, pose2);
```
Some optional features can be specified by the third parameter, options, and we will introduce them below.

#### options
```js
{
  strategy: string | Function,
  customWeight: {
    mode: string,
    scores: Object | number[]
  }
}
```

#### strategy: string | Function
Without specifying a strategy, poseSimilarity uses weightedDistance to calculate the distance between pose1 and pose2 in default, but you can still choose to use other build-in or your own algorithms by setting this strategy option.

It accepts string and Function types of inputs. When using string, strategy accepts **'weightedDistance'** (default), **'cosineDistance'** or **'cosineSimilarity'**.
```js
// use weightedDistance
const weightedDistance = poseSimilarity(pose1, pose2, { strategy: 'weightedDistance' });

// use cosineDistance
const cosineDistance = poseSimilarity(pose1, pose2, { strategy: 'cosineDistance' });

// use cosineSimilarity
const cosineSimilarity = poseSimilarity(pose1, pose2, { strategy: 'cosineSimilarity' });
```
- **Bigger** the return value means **more similar** when using **similarity based strategies** (e.g. cosineSimilarity)
- **Smaller** the return value means **more similar** when using **distance based strategies** (e.g. cosineDistance and weightedDistance)


If none of above algorithms suit your needs, you can pass your own strategy function. poseSimilarity will normalize the poses before passing to your strategy function, so you only need to focus on how to compare the two poses. To keep this page short, please refer the [Algorithms page](https://github.com/freshsomebody/posenet-similarity/wiki/Algorithms) for more details about what the 3 parameters are.
```js
function myStrategy(vectorPose1XY, vectorPose2XY, vectorPose1Scores) {
  // ...
}

const myCalculation = poseSimilarity(pose1, pose2, { strategy: myStrategy });
```

#### customWeight: Object
```js
const options = {
  customWeight: {
    mode: string,
    scores: Object | number[]
  }
}

const weightedDistance = poseSimilarity(pose1, pose2, options);
```
When using weighted strategies, e.g., weightedDistance, the weights are the confident scores of each keypoint in default. However, you can manipulate the scores by setting customWeight option, and it can be useful when you want to emphasize some keypoints.
> NOTE: Only weighted strategies, e.g., weightedDistance, and your own strategy function will be affected by the changes made by customWeight.

customWeight requires **mode** and **scores** properties. mode accepts **'multiply'**, **'replace'** or **'add'** which decides how you manipulate the original scores, and you must specified a mode when setting the customWeight option.
- **'multiply'** mode will multiply the original keypoint scores by your custom scores.
- **'replace'** mode will replace the original keypoint scores with your custom scores.
- **'add'** mode will sum up the original keypoint scores and your custom scores.

Your custom scores can be set in the **scores** property which accepts an Object or number[].
- When giving an Object, the keys are the [part names of keypoints](https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints) to be modified, and values are numbers to manipulate the original scores, e.g., { nose: 0.1, leftEye: 0.2 } will only modify the scores of nose and leftEye.
- When giving a number[], the elements are numbers to manipuate the original scores and their indexes are corresponded with [ids of keypoints](https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints), e.g., [0.1, 0.2] will only modify the scores of nose and leftEye.

Let's take a look at a simple example. Assume we have a simplified set of keypoints as below.
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
The results of modified scores in different modes will be:
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

## References
- [tfjs-models/Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
- [Move Mirror Blogpost](https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23)
