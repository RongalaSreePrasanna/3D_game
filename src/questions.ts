/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LevelQuestionSet {
  levelId: number;
  topic: string;
  questions: MCQQuestion[];
}

export const AI_LEVEL_QUESTIONS: Record<number, MCQQuestion[]> = {
  1: [
    {
      id: 101,
      question: "What is the primary visual representation of a Decision Tree?",
      options: [
        "A series of circular orbits with gravitational pulling forces",
        "A branching tree-like model of decisions and their possible consequences",
        "A linear formula of weights and variables representing continuous slope",
        "A grid of rewards and penalties updated over iterative loops"
      ],
      correctAnswerIndex: 1,
      explanation: "Decision Trees split data at node boundaries resembling a branching tree where leaves represent ultimate decisions or labels."
    },
    {
      id: 102,
      question: "Which metric is commonly used to decide the best split variable in a Decision Tree?",
      options: [
        "Q-Value iteration maximum",
        "Bounding box intersection over union (IoU)",
        "Information Gain (or decrease in Entropy/Gini Impurity)",
        "Gradient descent momentum rate"
      ],
      correctAnswerIndex: 2,
      explanation: "Entropy and Gini Impurity measure how mixed or pure nodes are. We select splits that maximize Information Gain."
    },
    {
      id: 103,
      question: "What does it mean for a Decision Tree to overfit?",
      options: [
        "It fails to memorize any details from the training set",
        "It simplifies branches so much that it underperforms on training data",
        "It becomes too complex, memorizing noise in training data and generalizing poorly to new samples",
        "It converts into a deep neural layer processing continuous audio frequencies"
      ],
      correctAnswerIndex: 2,
      explanation: "Overfitting happens when a tree is too deep, tracing every specific training fluke instead of learning general rules."
    }
  ],
  2: [
    {
      id: 201,
      question: "What is the main objective of Linear Regression?",
      options: [
        "To group unlabeled scattered dots into a set of K centroid clusters",
        "To fit a straight line (y = mx + c) that minimizes the distance to all data points",
        "To train a system of sensory rewards by trial and error in a simulated environment",
        "To break down English paragraphs into smaller components called tokens"
      ],
      correctAnswerIndex: 1,
      explanation: "Linear Regression finds the ideal straight-line slope (m) and intercept (c) to predict continuous numeric outcomes."
    },
    {
      id: 202,
      question: "How does Polynomial Regression differ from Linear Regression?",
      options: [
        "It doesn't use input training data at all",
        "It fits a curved line by incorporating higher-degree power terms like x² or x³",
        "It is only used to classify binary labels like Yes/No",
        "It can only run inside 3D volcanic simulation environments"
      ],
      correctAnswerIndex: 1,
      explanation: "Polynomial Regression introduces curved coordinates by adding polynomial variables, letting us fit non-linear patterns."
    },
    {
      id: 203,
      question: "What loss function is standardly minimized to fit regression lines?",
      options: [
        "Mean Squared Error (MSE)",
        "Token Cosine Similarity",
        "Bellman Equation Reward Gap",
        "Bounding Box Overlay Ratio"
      ],
      correctAnswerIndex: 0,
      explanation: "Mean Squared Error calculates the average of squared vertical gaps. Minimizing MSE yields the line of best fit."
    }
  ],
  3: [
    {
      id: 301,
      question: "In K-Means Clustering, what does the variable 'K' represent?",
      options: [
        "The number of input training dimensions",
        "The learning rate constant multiplied with the gradient",
        "The pre-set number of target groups (clusters) to divide the unlabeled data into",
        "The speed modifier of floating player enemies"
      ],
      correctAnswerIndex: 2,
      explanation: "The 'K' in K-Means dictates exactly how many groups or clusters the algorithm will partition unlabeled datasets into."
    },
    {
      id: 302,
      question: "Which type of machine learning is Clustering classified under?",
      options: [
        "Supervised Learning with pre-defined ground-truth labels",
        "Unsupervised Learning, finding hidden patterns in unlabeled data",
        "Reinforcement Learning, based on dynamic environment rewards",
        "Sequence token modeling"
      ],
      correctAnswerIndex: 1,
      explanation: "Clustering is Unsupervised. The algorithm has no predefined tags and groups files purely based on spatial similarities."
    },
    {
      id: 303,
      question: "How does K-Means update the cluster locations in each step?",
      options: [
        "By adjusting neurons in three sequential activated layers",
        "By computing the average (mean) coordinates of all points in a cluster and moving the centroid there",
        "By throwing random mutation genes into the pixel environment",
        "By asking the player to type an adversarial text description"
      ],
      correctAnswerIndex: 1,
      explanation: "Once points are assigned to the nearest center, the algorithm updates each cluster's centroid to be the statistical mean of its members."
    }
  ],
  4: [
    {
      id: 401,
      question: "What are the three fundamental layers in a standard Feedforward Neural Network?",
      options: [
        "Input Layer, Hidden Layer, and Output Layer",
        "Decision Leaf, Linear Stem, and Centroid Base",
        "Positive Basin, Negative Basin, and Word Buffer",
        "Mutant Chromosome, Selection Wheel, and Crossover Joint"
      ],
      correctAnswerIndex: 0,
      explanation: "Simple artificial neural networks pass inputs through hidden computational layers to evaluate final outputs."
    },
    {
      id: 402,
      question: "What role does an 'Activation Function' (like ReLU or Sigmoid) play in a neuron?",
      options: [
        "It shuts down the server when a high error is detected",
        "It introduces non-linearity, enabling the network to learn complex non-linear patterns",
        "It resets all network weights to absolute zero on every frame",
        "It translates the neural weights directly into sound clips"
      ],
      correctAnswerIndex: 1,
      explanation: "Without activation functions, stackings of neural layers behave as a single giant linear regression. Activations permit non-linear curves."
    },
    {
      id: 403,
      question: "What is Backpropagation used for in Neural Networks?",
      options: [
        "To copy-paste the code backwards to fix syntax typos",
        "To calculate the prediction error and propagate it backwards to tune synapse weights and biases",
        "To teleport the player back to the starting forest block on collision",
        "To convert continuous audio frequencies into visual color blocks"
      ],
      correctAnswerIndex: 1,
      explanation: "Backpropagation passes errors backwards through the wire connections, using calculus gradients to optimize weights."
    }
  ],
  5: [
    {
      id: 501,
      question: "What is 'Object Detection' in computer vision?",
      options: [
        "Checking if the webcam is plugged in and recognized",
        "Identifying what objects are in an image AND drawing precise coordinate 'bounding boxes' around them",
        "Converting continuous words of text into vector representations",
        "Filing data entries inside spreadsheets automatically"
      ],
      correctAnswerIndex: 1,
      explanation: "Object Detection combines classification (what is it) with localization (where is it, bounded by a rectangle box)."
    },
    {
      id: 502,
      question: "Which deep neural architecture is standardly used for analyzing images?",
      options: [
        "Recurrent Neural Networks (RNN)",
        "Convolutional Neural Networks (CNN)",
        "Word2Vec models",
        "Q-Learning action state grids"
      ],
      correctAnswerIndex: 1,
      explanation: "CNNs use spatial convolution filters that slide over direct pixels, capturing visual traits like edges, shapes, and complex features."
    },
    {
      id: 503,
      question: "What is 'Intersection over Union' (IoU) used for in vision networks?",
      options: [
        "A formula to calculate rendering speed in frames per second",
        "Measuring how much an estimated bounding box overlaps with the true ground-truth box",
        "A system to merge words of similar sentiment analysis",
        "Counting how many coins a player has gathered in forest stages"
      ],
      correctAnswerIndex: 1,
      explanation: "IoU divides the overlap area of two boxes by their total combined area, helping determine prediction accuracy."
    }
  ],
  6: [
    {
      id: 601,
      question: "What are the three core components of any Reinforcement Learning problem?",
      options: [
        "Input, Hidden, and Output layers",
        "Agent, Environment, and Reward / Action signals",
        "Crossover, Mutation, and Tournament selection",
        "Tokenization, Sentiment, and Classification"
      ],
      correctAnswerIndex: 1,
      explanation: "In RL, an Agent interacts with an Environment, taking Actions and learning a policy based on numeric Feedback (Rewards/Penalties)."
    },
    {
      id: 602,
      question: "In Q-Learning, what does a 'Q-Value' represent?",
      options: [
        "The speed coefficient of the moving game camera",
        "The expected total future reward of taking a specific action in a given state",
        "The number of correct questions a user has completed on first try",
        "The color temperature of illuminated spotlights"
      ],
      correctAnswerIndex: 1,
      explanation: "Q stands for Quality. A Q-value estimates the long-term payoff of executing an action from a current position."
    },
    {
      id: 603,
      question: "What is the purpose of Exploration versus Exploitation in reinforcement learning?",
      options: [
        "Balancing trying random new actions to find better policies versus using actions known to yield good rewards",
        "Enabling players to use high-quality gamepad triggers during action sequences",
        "Adjusting camera scale parameters to zoom in on forest models",
        "Comparing local storage databases with remote Firestore rule sets"
      ],
      correctAnswerIndex: 0,
      explanation: "Exploration forces the bot to seek novel, unmapped pathways (like finding hidden items), while exploitation repeats known solid tactics."
    }
  ],
  7: [
    {
      id: 701,
      question: "What is a Genetic Algorithm modeled after?",
      options: [
        "The grammatical structures of natural organic languages",
        "The biological process of natural selection and evolution",
        "Calculus-driven backpropagation of error weights",
        "Electronic logic gates on silicon hardware boards"
      ],
      correctAnswerIndex: 1,
      explanation: "Genetic Algorithms solve optimization problems by replicating sexual reproduction, chromosomes, mutations, and survival of the fittest."
    },
    {
      id: 702,
      question: "What are the three main evolutionary operators in Genetic Algorithms?",
      options: [
        "Node Splitting, Pruning, and Leaf Labelling",
        "Selection, Crossover (recombination), and Mutation",
        "Tokenizing, Stemming, and Embedding",
        "Forward Pass, Loss Computation, and Backpropagation"
      ],
      correctAnswerIndex: 1,
      explanation: "Selection keeps top candidate structures, Crossover blends parent traits into offspring, and Mutation injects random changes."
    },
    {
      id: 703,
      question: "In evolutionary algorithms, what does a 'Fitness Function' do?",
      options: [
        "Tracks how fast a player can jump across floating logs",
        "Evaluates how well a specific candidate solution satisfies the target objective criteria",
        "Maintains the standard frame rate of modern GPU simulations",
        "Regulates the sound synthesis loops of ambient instruments"
      ],
      correctAnswerIndex: 1,
      explanation: "A fitness function measures and scores candidates. Higher scores raise chances of selection to pass traits down."
    }
  ],
  8: [
    {
      id: 801,
      question: "What is 'Tokenization' in Natural Language Processing?",
      options: [
        "Buying arcade credits to unlock modern platformer bonus stages",
        "Splitting a string of text into smaller individual pieces or words (tokens)",
        "Compiling TypeScript code files down to bundled Javascript outputs",
        "Attaching glowing neon spheres to 3D avatar meshes"
      ],
      correctAnswerIndex: 1,
      explanation: "Tokenization is the core entry step of NLP, slicing continuous sentences into list arrays of numeric-mapped words or symbols."
    },
    {
      id: 802,
      question: "What is the primary role of Sentiment Analysis?",
      options: [
        "Translating a typed sentence directly from French to English",
        "Determining whether a text passage expresses a positive, negative, or neutral viewpoint",
        "Calculating the speed multiplier of automated slimes",
        "Converting speech waveforms into three-dimensional point clouds"
      ],
      correctAnswerIndex: 1,
      explanation: "Sentiment analysis gauges underlying emotional tone in text (e.g. tagging a review as positive, critical, or supportive)."
    },
    {
      id: 803,
      question: "How do 'Word Embeddings' represent lexical meanings?",
      options: [
        "By setting up folder hierarchies in the file-tree config",
        "By mapping words into dense numeric vectors in a multi-dimensional space where close vectors share similar meanings",
        "By printing text characters on paper utilizing high-contrast ink",
        "By assigning a random integer to every key pressed during play"
      ],
      correctAnswerIndex: 1,
      explanation: "Embeddings map tokens to high-dimensional mathematical vector coordinates (e.g. 300 dimensions) where semantic cousins lay near."
    }
  ],
  9: [
    {
      id: 901,
      question: "How does a Generative Adversarial Network (GAN) produce synthetic data like realistic images?",
      options: [
        "By parsing a static decision tree with simple leaf triggers",
        "By pitting two networks (a Generator and a Discriminator) against each other in a feedback loops",
        "By fitting a single quadratic polynomial line across physical points",
        "By prompting players to jump on toxic mushrooms"
      ],
      correctAnswerIndex: 1,
      explanation: "The Generator crafts forged samples, and the Discriminator learns to detect fakes. Both hone each other's skills in a zero-sum game."
    },
    {
      id: 902,
      question: "What is the core principle of Diffusion Models in Generative AI?",
      options: [
        "Running physical fluid simulations over mesh models to blend colors",
        "Starting with pure random noise and iteratively refining/removing noise to synthesize clean content",
        "Encrypting text arrays using custom security keys",
        "Spawning multiple physical copies of the player on the map"
      ],
      correctAnswerIndex: 1,
      explanation: "Diffusion models learn the mathematical process of corrupting images with noise, then reverse that process to forge realistic results from noise."
    },
    {
      id: 903,
      question: "Which transformer component is vital for mapping prompt instructions to image details in models like Stable Diffusion?",
      options: [
        "A K-Means centroid grouping ray",
        "Cross-Attention mechanisms linking prompt text embeddings to latent image representations",
        "A simple recursive Boolean branch checker",
        "Gravity acceleration velocity physics calculators"
      ],
      correctAnswerIndex: 1,
      explanation: "Cross-Attention layers align linguistic prompt embeddings with spatial visual matrices, steering details to match descriptions."
    }
  ],
  10: [
    {
      id: 1001,
      question: "What makes an AI system 'Adaptive' in a real-time gaming or security setup?",
      options: [
        "Its visual color coordinates cycle through rainbow tints",
        "It dynamically registers user inputs and automatically alters its state, defense, or tactics in response",
        "It remains static, letting the player clear easily without changing parameters",
        "It stores user scores into standard client local storage files"
      ],
      correctAnswerIndex: 1,
      explanation: "Adaptive systems evolve in real-time. In game combat, of example, they counter repeating patterns or learn player weaknesses."
    },
    {
      id: 1002,
      question: "In Deep Reinforcement Learning (Deep RL), how is the action policy represented?",
      options: [
        "Through a small static spreadsheet of rows and columns",
        "By a Deep Neural Network mapping state inputs straight to predicted action values",
        "Through random mutation indices in floating bubble chromosomes",
        "By checking if a user has collected exactly three coins in forest zones"
      ],
      correctAnswerIndex: 1,
      explanation: "Deep RL swaps basic Q-table databases for neural networks, enabling agents to act in complex, high-dimensional spaces."
    },
    {
      id: 1003,
      question: "What is an 'Adversarial Attack' on a machine learning model?",
      options: [
        "A player hitting the model's 3D mesh representation in combat",
        "Feeding subtle, carefully engineered perturbations (noise) to trick a net into making confident errors",
        "Deleting the program source files from the developers workspace",
        "Adding additional CPU processors to speed up simulation cycles"
      ],
      correctAnswerIndex: 1,
      explanation: "Adversarial inputs are engineered to exploit a model's vulnerable decision boundaries, inducing fatal flaws like mislabeling shapes."
    }
  ]
};
