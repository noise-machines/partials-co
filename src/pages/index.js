import React from 'react'
import * as tf from '@tensorflow/tfjs'

const scale = (imageData, multiplier) => {
  if (multiplier === 1) {
    return imageData
  }

  let size = imageData.shape[0]
  return imageData
    .expandDims(2)
    .tile([1, 1, multiplier, 1])
    .reshape([size, size * multiplier, 3])
    .expandDims(1)
    .tile([1, multiplier, 1, 1])
    .reshape([size * multiplier, size * multiplier, 3])
}

class TensorFlowCanvas extends React.Component {
  componentDidMount () {
    this.updateCanvas()
  }
  componentDidUpdate () {
    this.updateCanvas()
  }
  updateCanvas () {
    if (!this.props.imageData) return
    const canvas = this.refs.canvas
    tf.toPixels(this.props.imageData, canvas).then(() => {
      console.log('Canvas updated')
    })
  }
  render () {
    return (
      <canvas width={this.props.width} height={this.props.height} ref='canvas'>
        Hello world!
      </canvas>
    )
  }
}

class ModelRenderer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      imageData: null,
      latentPoint: null
    }
  }
  componentDidMount () {
    const latentPoint = tf.randomNormal([1, modelMetadata.latentDimensions])
    this.setState({ latentPoint })
  }
  componentDidUpdate (prevProps, prevState) {
    if (
      this.props.xOffset !== prevProps.xOffset ||
      this.props.yOffset !== prevProps.yOffset ||
      (!prevState.latentPoint && this.state.latentPoint)
    ) {
      this.updateImageData()
    }
  }
  updateImageData () {
    const { model, modelMetadata, xOffset, yOffset } = this.props
    if (!model) return
    const imageData = tf.tidy(() => {
      const latentPoint = this.state.latentPoint
        .add(tf.scalar(xOffset))
        .div(tf.scalar(2))
      const unscaledImageData = model
        .predict(latentPoint)
        .squeeze()
        .transpose([1, 2, 0])
        .div(tf.scalar(2))
        .add(tf.scalar(0.5))
      const imageData = scale(unscaledImageData, modelMetadata.scalingFactor)
      return imageData
    })
    this.setState({ imageData })
  }
  render () {
    const modelMetadata = this.props.modelMetadata
    const size = modelMetadata.size * modelMetadata.scalingFactor
    return (
      <TensorFlowCanvas
        imageData={this.state.imageData}
        width={size}
        height={size}
      />
    )
  }
}

const modelMetadata = {
  description: 'DCGAN, 64x64 (16 MB)',
  url: 'https://storage.googleapis.com/store.alantian.net/tfjs_gan/chainer-dcgan-celebahq-64/tfjs_SmoothedGenerator_50000/model.json',
  size: 64,
  latentDimensions: 128,
  scalingFactor: 4,
  animateFrame: 200
}

class MousePosition extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      x: 0,
      y: 0
    }
  }
  componentDidMount () {
    document.onmousemove = e => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      this.setState({ x, y })
    }
  }
  componentWillUnmount () {
    document.onmousemove = null
  }
  render () {
    return this.props.children(this.state)
  }
}

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      model: null
    }
  }
  componentDidMount () {
    tf.loadModel(modelMetadata.url).then(model => {
      this.setState({ model })
    })
  }
  render () {
    const mouseModel = (
      <MousePosition>
        {mousePosition => (
          <ModelRenderer
            modelMetadata={modelMetadata}
            model={this.state.model}
            xOffset={mousePosition.x}
            yOffset={mousePosition.y}
          />
        )}
      </MousePosition>
    )

    const contents = this.state.model ? mouseModel : 'Loading'

    return (
      <div>
        {contents}
      </div>
    )
  }
}
