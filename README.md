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
  strategy: string /* 
    Determines which strategy is used to calculate the similarity (distance).
    Accepts 'cosineDistance' or 'weightedDistance' (default).
    More details can be checked in Move Mirror Blogpost of Refereces below.
  */
}
```

#### Returns
similarity/ distance : Number
- **Bigger** the value means **more similar** when using **similarity based strategies**
- **Smaller** the value means **more similar** when using **distance based strategies** (e.g. cosineDistance and weightedDistance)

## References
- [tfjs-models/Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
- [Move Mirror Blogpost](https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23)
