# Progress Bar Tool

Custom nodes are one of the biggest pain points in developing graph visualization applications. vGraph summarizes common custom node components from business and abstracts them into configurable tool methods to help everyone solve some visual effects that are not easy to implement.

As the name suggests, progress bars are often used to visually display the progress of ongoing events, completion rates, etc. vGraph encapsulates two styles of progress bars, a normal progress bar and a circular progress bar, and also adds the ability to update animations, achieving a visual experience comparable to a native UI. You can refer to the example of a [progress bar node](/vgraph/demo/nodes/progreessNode).

```javascript
import { ProgressUtils, Layer } from '@visactor/vgraph';

// container is the label container, which is generally the Layer parameter passed in by the node's custom method `shape`
const container = new Layer({...});

// Generate the progress bar
const progressLayer = ProgressUtils.init(container, progressOptions);

// Update the progress bar, recommended to be executed in the node's custom method `updateShapes`
ProgressUtils.update(progressLayer, updateOptions);
```
## Progress Bar Initialization Configuration

| Field | Type | Description |
| --- | --- | --- |
| x | number | \[Required] The horizontal position of the progress bar. For a horizontal progress bar, it is the leftmost coordinate; for a circular progress bar, it is the horizontal coordinate of the center. |
| y | number | \[Required] The vertical position of the progress bar. For a horizontal progress bar, it is the vertical coordinate of the center; for a circular progress bar, it is the vertical coordinate of the center. |
| percent | number | \[Required] The progress data, which should be between 0 and 1. |
| width | number | \[Required] The length of the progress bar graphic. |
| lineWidth | number | The width of the progress bar. |
| type | 'line' \| 'circle' | The type of the progress bar. |
| color | string | The color of the progress bar. |
| trailColor | string | The color of the remaining progress bar. |
| lineCap | 'butt' \| 'round' \| 'square' | The style of the line endpoints. The default is 'round'. |
| label | | The text configuration. By default, the text for a horizontal progress bar is on the right, while for a circular progress bar, it is in the center of the circle. |
| label.text | string | The displayed text. |
| label.fillStyle | string | The color of the displayed text. |
| label.fontSize | number | The font size of the displayed text. |
| label.fontWeight | number | The font weight of the displayed text. |
| label.lineHeight | number | The line height of the displayed text. |
| label.fontFamily | number | The font family of the displayed text. |
| label.width | number | The maximum width of the displayed text. |
| label.textOverflow | 'ellipsis' \| 'clip' | The text overflow handling method. The default is 'ellipsis'. |
| label.triggerId | string | Used with components like Tooltip. |

## Progress Bar Update Configuration
| Field | Type | Description |
| --- | --- | --- |
| percent | number | \[Required] The progress data, which should be between 0 and 1. |
| updateLabel | (percent: number) => string | If text is configured during initialization, this method can be used to update the text synchronously in the animation. |
| animate | boolean \| AnimateConfigs | The update animation configuration. |
| animate.duration | number | The duration of the animation, in ms. |
| animate.easing | 'easelinear' \| 'easeCubic' \| 'easePoly' \| 'easeQuad' \| 'easeSin' | The animation execution method. |
| animate.onFinish | () => void | The callback for when the animation is complete. |
