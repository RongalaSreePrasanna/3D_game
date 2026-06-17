export interface AvatarConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  description: string;
  shape: 'box' | 'cylinder' | 'sphere' | 'torus';
  accessory: 'antenna' | 'hat' | 'headphones' | 'halo';
}

export interface LevelConfig {
  id: number;
  title: string;
  concept: string;
  subtitle: string;
  description: string;
  outcome: string;
  environmentName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Hard' | 'Expert';
}

export interface UserProfile {
  username: string;
  chosenAvatarId: string;
  currentLevel: number;
  highestLevelUnlocked: number;
  scores: Record<number, number>; // level id -> stars (1-3) or percentage score
  completedAt: Record<number, string>;
}

export const AVATARS: AvatarConfig[] = [
  {
    id: 'cyber_bot',
    name: 'Cyber Robo-Bot',
    primaryColor: '#ff007f', // hot pink
    secondaryColor: '#00f0ff', // cyan
    glowColor: '#ff007f',
    description: 'A cute futuristic robot helper who emits cozy neon sparks.',
    shape: 'box',
    accessory: 'antenna'
  },
  {
    id: 'bouncy_slime',
    name: 'Gloop Slime',
    primaryColor: '#4eec24', // bright green
    secondaryColor: '#0c8200', // forest green
    glowColor: '#4eec24',
    description: 'An adorable jelly slime with giant round glossy eyes that bounces with joy.',
    shape: 'sphere',
    accessory: 'headphones'
  },
  {
    id: 'magic_chibi',
    name: 'Astral Mage',
    primaryColor: '#7a22ff', // royal violet
    secondaryColor: '#ffaa00', // gold
    glowColor: '#7a22ff',
    description: 'A miniature star-wanderer with an ancient cybernetic wizard cone.',
    shape: 'cylinder',
    accessory: 'hat'
  },
  {
    id: 'cosmic_donut',
    name: 'Glitz Torus',
    primaryColor: '#ff9000', // neon orange
    secondaryColor: '#ff0055', // pink glow
    glowColor: '#ff9000',
    description: 'A high-energy hovering toroidal pet spinning with learning parameters.',
    shape: 'torus',
    accessory: 'halo'
  }
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Decision Tree Warfare",
    concept: "Decision Trees",
    subtitle: "Branching Logic Combat",
    description: "Align your helper companion's logic tree to choose the best tactical action (Attack, Defend, Retreat, Heal) based on enemy status. Collect floating parameter runes to fix the broken branches!",
    outcome: "AI takes decisions step-by-step using split logic nodes based on features.",
    environmentName: "Cyber-Pastel Forest Arena",
    difficulty: "Beginner"
  },
  {
    id: 2,
    title: "Regression Racer",
    concept: "Regression & Prediction",
    subtitle: "Data-driven Continuous Prediction",
    description: "Steer your futuristic hovercar through the digital race-lane. Collect active data point spheres to fit your regression curve (Linear vs Quadratic) to smooth out path gaps and soar across ramps!",
    outcome: "Predicting continuous values (y) based on training input data (x).",
    environmentName: "Vector Synthwave Expressway",
    difficulty: "Beginner"
  },
  {
    id: 3,
    title: "Cluster Battlefield",
    concept: "Clustering Algorithms (K-Means)",
    subtitle: "Unsupervised Pattern Discovery",
    description: "An army of gray pixel aliens is invading! Fire your K-Means clustering ray to group them by structural signals (height & armor). Once clustered, eliminate the centroid swarm leaders to dissolve the squads!",
    outcome: "Unsupervised learning groups unlabeled data points by structural similarity.",
    environmentName: "Prismatic Neon Volcano Arena",
    difficulty: "Intermediate"
  },
  {
    id: 4,
    title: "Neural Network Arena",
    concept: "Artificial Neural Networks",
    subtitle: "Multi-layered Signal Forwarding",
    description: "Hack the cyber security grid. Gather network pulses to activate neurons in the Input, Hidden, and Output layers. Tune the glowing synaptic wire weights to trigger super weapon blasters!",
    outcome: "Information processing through weights, biases, and activation layers.",
    environmentName: "Cozy Grid Cyber Matrix",
    difficulty: "Intermediate"
  },
  {
    id: 5,
    title: "Computer Vision City",
    concept: "Computer Vision & Object Detection",
    subtitle: "Real-time Bounding Box Drive",
    description: "Drive through a cute voxel city. Scan moving pedestrians, vehicles, stoplights, and barricades. Manually label false-positives to train your visual net so your autopilot can cruise safely!",
    outcome: "Deep learning models classify pixel matrices and draw localized bounding targets.",
    environmentName: "Kawaii Retro Sandbox City",
    difficulty: "Intermediate"
  },
  {
    id: 6,
    title: "RL Dungeon Crawler",
    concept: "Reinforcement Learning (Q-Learning)",
    subtitle: "Markov Decision Reward Grid",
    description: "Guide a cute automated slime to reach the glowing Golden Key. Drop delicious cookies (+R) or warning fences (-R) onto the floor tiles to update its Q-learning values and find the optimal path!",
    outcome: "Agents learn sequence policy solutions entirely through positive and negative rewards.",
    environmentName: "Deep Obsidian Crypt",
    difficulty: "Hard"
  },
  {
    id: 7,
    title: "Genetic Evolution Arena",
    concept: "Genetic Algorithms",
    subtitle: "Survival of the Fittest Traits",
    description: "Fight waves of cute mutant balloons that reproduce and mutate speed/defense traits each round! Defeat the fast, tiny, or heavy survivors and watch the next generation adapt directly to your attacks.",
    outcome: "Selection, crossover, and mutation drive traits toward optimization over generations.",
    environmentName: "Voxel Sky-Floating Stadium",
    difficulty: "Hard"
  },
  {
    id: 8,
    title: "NLP Detective Cyber",
    concept: "Natural Language Processing",
    subtitle: "Tokenization & Sentiment Analysis",
    description: "We have intercepted an encrypted boss transmissions! Gather vocabulary token blocks, sort them into Positive/Negative sentiment basins, and decode the grammatical sequence to clear path-gates.",
    outcome: "Converting raw phrases to numeric lexical tokens and analyzing semantic affinity.",
    environmentName: "Hazy Cyberpunk Megacity District",
    difficulty: "Hard"
  },
  {
    id: 9,
    title: "Generative AI Forge",
    concept: "Generative Adversarial Nets & Diffusion",
    subtitle: "Procedural Mesh Matrix Synthesis",
    description: "Step into the magical AI crafting voxel forge. Enter dynamic magic prompt combinations to synthesise neon weapons and procedural crystalline shields of diverse dimensions. Beat wave tests!",
    outcome: "Generative networks train to output synthetic data that matches distribution bounds.",
    environmentName: "Ethereal Spark Crafting Sanctum",
    difficulty: "Expert"
  },
  {
    id: 10,
    title: "Adaptive AI Final Boss",
    concept: "Adaptive Systems & Deep RL",
    subtitle: "The Ultimate Deep Battle",
    description: "Duel the Overlord Neurona! The boss real-time analyzes your combat stance, shielding against repeating tricks. Dodge adaptive lasers and grab Adversarial Distraction patches to blind her sensor arrays!",
    outcome: "Real-world autonomous AI structures analyze adversarial gameplay patterns and respond.",
    environmentName: "Neon Core Overlord Chamber",
    difficulty: "Expert"
  }
];
