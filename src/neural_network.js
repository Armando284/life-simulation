'use strict'

class FloatMatrix {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.n = new Float64Array(rows * cols).fill(0.0)
  }

  getValue(row, col) {
    return this.n[row * this.cols + col];
  }

  setValue(row, col, value) {
    this.n[row * this.cols + col] = value;
  }

  clone() {
    const matrixClone = new FloatMatrix(this.rows, this.cols)
    matrixClone.n = new Float64Array(this.n)
    return matrixClone
  }
}

class Layer {
  constructor(n_inputs, n_nodes) {
    this.n_inputs = n_inputs
    this.n_nodes = n_nodes
    this.weights = new FloatMatrix(n_nodes, n_inputs)
    this.biases = new Float64Array(n_nodes)
    this.nodes = new Float64Array(n_nodes)
  }

  forward(inputs) {
    if (inputs.length !== this.n_inputs) {
      throw new Error(`Wrong inputs amount. ${inputs.length} of ${this.n_inputs}`);
    }
    this.nodes.fill(0.0)

    for (let i = 0; i < this.n_nodes; i++) {
      //sum of weights times inputs
      for (let j = 0; j < this.n_inputs; j++) {
        this.nodes[i] += this.weights.getValue(i, j) * inputs[j];
      }
      //add the bias
      this.nodes[i] += this.biases[i];
    }
  }

  activation() {
    this.nodes = this.nodes.map(node => Math.max(node, 0))
  }

  clone() {
    const newLayer = new Layer(this.n_inputs, this.n_nodes);
    newLayer.weights = this.weights.clone();
    newLayer.biases = new Float64Array(this.biases);
    return newLayer;
  }
}

export default class NeuralNetwork {
  constructor(networkShape) {
    this.networkShape = networkShape
    this.layers = new Array(networkShape.length - 1)
    this.awake()
  }

  awake() {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i] = new Layer(this.networkShape[i], this.networkShape[i + 1]);
    }
  }

  brain(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      const entryValues = i === 0 ? inputs : this.layers[i - 1].nodes;
      this.layers[i].forward(entryValues);
      if (i !== this.layers.length - 1) {
        this.layers[i].activation();
      }
    }

    return (this.layers[this.layers.length - 1].nodes);
  }

  clone() {
    const newNetwork = new NeuralNetwork(this.networkShape);
    for (let i = 0; i < this.layers.length; i++) {
      newNetwork.layers[i] = this.layers[i].clone();
    }
    return newNetwork;
  }

  mutate(mutationRate = 0.1, mutationScale = 0.2) {
    for (const layer of this.layers) {
      // Mutate the weights
      for (let i = 0; i < layer.weights.n.length; i++) {
        if (Math.random() < mutationRate) {
          layer.weights.n[i] += mutationScale * (Math.random() * 2 - 1);
        }
      }

      // Mutate the biases
      for (let i = 0; i < layer.biases.length; i++) {
        if (Math.random() < mutationRate) {
          layer.biases[i] += mutationScale * (Math.random() * 2 - 1);
        }
      }
    }
  }

  toString() {
    return `${this.layers.reduce((prev, layer) => {
      return `${prev}${JSON.stringify(layer.weights.n)}${JSON.stringify(layer.biases)}-`
    }, '')}`.slice(0, -1)
  }
}