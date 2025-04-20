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
  ACTIVATIONS = {
    'linear': (x) => x,
    'relu': (x) => Math.max(0, x),
    'leaky-relu': (x) => x > 0 ? x : this.alpha * x,
    'elu': (x) => x >= 0 ? x : this.alpha * (Math.exp(x) - 1),
    'sigmoid': (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x)),
    'tanh': (x) => Math.tanh(x),
  };

  constructor(n_inputs, n_nodes, activationType = 'relu', dropoutRate = 0, alpha = 0.01) {
    this.n_inputs = n_inputs
    this.n_nodes = n_nodes
    this.weights = new FloatMatrix(n_nodes, n_inputs)
    this.biases = new Float64Array(n_nodes)
    this.nodes = new Float64Array(n_nodes)

    // Nuevos parámetros
    this.activationType = activationType; // 'relu', 'leaky-relu', 'linear'
    this.dropoutRate = dropoutRate; // 0-1 (ej: 0.2 = 20% de dropout)
    this.alpha = alpha
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
    const activator = this.ACTIVATIONS[this.activationType] || this.ACTIVATIONS.relu;
    this.nodes = this.nodes.map(activator);
  }

  applyDropout() {
    if (this.dropoutRate > 0) {
      const scale = 1 / (1 - this.dropoutRate); // Scaling para mantener misma magnitud en entrenamiento
      this.nodes = this.nodes.map(node =>
        Math.random() < this.dropoutRate ? 0 : node * scale
      );
    }
  }

  clone() {
    const newLayer = new Layer(
      this.n_inputs,
      this.n_nodes,
      this.activationType,
      this.dropoutRate
    );
    newLayer.weights = this.weights.clone();
    newLayer.biases = new Float64Array(this.biases);
    return newLayer;
  }
}

export default class NeuralNetwork {
  constructor(networkShape, options = {}) {
    this.networkShape = networkShape
    this.options = {
      activation: options.activation || 'relu', // Activación por defecto
      dropout: options.dropout || 0 // Dropout por defecto
    };
    /**
     * @type {Layer[]}
     */
    this.layers = new Array(networkShape.length - 1)
    this.awake()
  }

  awake() {
    for (let i = 0; i < this.layers.length; i++) {
      const isOutputLayer = i === this.layers.length - 1;
      const activation = isOutputLayer ? 'linear' : this.options.activation;
      const dropout = isOutputLayer ? 0 : this.options.dropout;

      this.layers[i] = new Layer(
        this.networkShape[i],
        this.networkShape[i + 1],
        activation,
        dropout
      );
    }
  }

  brain(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      const entryValues = i === 0 ? inputs : this.layers[i - 1].nodes;
      this.layers[i].forward(entryValues);

      if (i !== this.layers.length - 1) {
        this.layers[i].activation();
        this.layers[i].applyDropout(); // Aplicar dropout después de activación
      }
    }
    return this.layers[this.layers.length - 1].nodes;
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

  getModel() {
    return this.layers.map(layer => ({
      weights: layer.weights.n,
      biases: layer.biases
    }))
  }

  setModel(model) {
    model.forEach((layer, i) => {
      let j = 0
      for (const key in layer.weights) {
        this.layers[i].weights.n[j] = layer.weights[key]
        j++
      }
      j = 0
      for (const key in layer.biases) {
        this.layers[i].biases[j] = layer.biases[key]
        j++
      }
    });
  }
}