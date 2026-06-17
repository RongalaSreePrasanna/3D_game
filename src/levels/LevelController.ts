/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AvatarConfig, LEVELS } from '../types';

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}

export interface LevelCallbacks {
  onScoreChange: (score: number, maxScore: number) => void;
  onStatusMessage: (message: string) => void;
  onComplete: (stars: number) => void;
  onFail: (reason: string) => void;
  onHitQuestionBlock?: (blockIndex: number) => void;
}

interface ForestPlatform {
  mesh: THREE.Mesh;
  width: number;
  height: number;
  depth: number;
  isMoving: boolean;
  moveAxis: 'x' | 'y' | 'z';
  moveRange: number;
  moveSpeed: number;
  basePos: THREE.Vector3;
}

interface ForestCoin {
  mesh: THREE.Mesh;
  collected: boolean;
  baseY: number;
  spinSpeed: number;
}

interface QuestionBlock {
  mesh: THREE.Mesh;
  index: number; // 0, 1, 2
  solved: boolean;
  baseY: number;
  sparkMesh: THREE.Mesh | null;
}

export class LevelController {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  avatar: AvatarConfig;
  callbacks: LevelCallbacks;
  levelId: number;

  // Active game states
  health: number = 100;
  levelScore: number = 0; // Represents collected coins
  levelTarget: number = 5;  // Core coins objective target
  isPaused: boolean = false;
  
  // Platform physics parameters
  playerGroup!: THREE.Group;
  playerVelocity: THREE.Vector3 = new THREE.Vector3();
  isGrounded: boolean = false;
  playerSpeed: number = 7.5;
  jumpForce: number = 8.5;
  gravityForce: number = -22.0;
  playerRadius: number = 0.45;

  // Checkpoint coordinate tracking
  lastSafeCheckpoint: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);

  // Lists of procedural 3D elements
  platforms: ForestPlatform[] = [];
  coins: ForestCoin[] = [];
  questionBlocks: QuestionBlock[] = [];
  fireflies: THREE.Points | null = null;
  decorations: THREE.Object3D[] = [];

  // Question blocks configuration state tracking
  solvedBlocksMask: boolean[] = [false, false, false];

  // Moving obstacles (Mushroom hazards)
  mushrooms: Array<{ mesh: THREE.Group; basePosition: THREE.Vector3; hazard: boolean; bounceTimer: number }> = [];

  // Level 10 Boss variables
  bossGroup: THREE.Group | null = null;
  bossRings: Array<{ mesh: THREE.Mesh; radius: number; maxRadius: number; speed: number }> = [];
  bossPulseTimer: number = 0;

  constructor(
    levelId: number,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    avatar: AvatarConfig,
    callbacks: LevelCallbacks
  ) {
    this.levelId = levelId;
    this.scene = scene;
    this.camera = camera;
    this.avatar = avatar;
    this.callbacks = callbacks;

    // Build the beautiful 3D levels
    this.setupVisuals();
  }

  private setupVisuals() {
    // 1. Scene background color and thick mystical green haze
    this.scene.background = new THREE.Color(0x061510); // Deep forest twilight
    this.scene.fog = new THREE.FogExp2(0x061510, 0.024);

    // 2. Light parameters
    const ambient = new THREE.AmbientLight(0xdcfce7, 0.65); // Soft green tinted mood light
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.2); // Warm filtering sunshine
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Subtle colored spotlights to highlight start/end zones
    const spot = new THREE.SpotLight(0x10b981, 4, 30, Math.PI / 4, 0.5, 1);
    spot.position.set(0, 15, 0);
    this.scene.add(spot);

    // 3. Assemble Player model representation
    this.spawnPlayer();

    // 4. Decouple score updates
    this.levelTarget = this.levelId <= 3 ? 5 : this.levelId <= 7 ? 6 : 8; // coins collected target
    this.callbacks.onScoreChange(0, this.levelTarget);

    // 5. Procedurally generate the 3D Forest Platform Map
    this.generateForestPlatformerTrack();

    // 6. Draw Ambient Forest Atmosphere elements (trees, fireflies, mushrooms)
    this.addAmbientEnvironmentAssets();

    this.callbacks.onStatusMessage("Entering Forest Platformer! Use WASD/Arrows to run, SPACE to jump. Collect coins and hit all 3 ? blocks to solve AI concepts!");
  }

  private spawnPlayer() {
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.set(0, 0.5, 0);
    this.scene.add(this.playerGroup);

    // Customize material using user's primary/secondary/glow selection
    const priMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.avatar.primaryColor),
      roughness: 0.2,
      metalness: 0.1
    });
    const secMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.avatar.secondaryColor),
      roughness: 0.1,
      metalness: 0.3
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.avatar.glowColor) });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Select body shape dynamically
    let bodyMesh: THREE.Mesh;
    if (this.avatar.shape === 'box') {
      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), priMat);
    } else if (this.avatar.shape === 'cylinder') {
      bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.8, 16), priMat);
    } else if (this.avatar.shape === 'sphere') {
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), priMat);
    } else {
      bodyMesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.13, 16, 32), priMat);
    }
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.playerGroup.add(bodyMesh);

    // Eye lenses (facing toward POSITIVE Z axis)
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMat);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMat);
    eyeL.position.set(-0.16, 0.1, 0.32);
    eyeR.position.set(0.16, 0.1, 0.32);

    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(0.02, 0.02, 0.06);
    eyeL.add(shine);
    eyeR.add(shine.clone());
    this.playerGroup.add(eyeL, eyeR);

    // Render cute custom hats or antennas
    const auxGroup = new THREE.Group();
    auxGroup.position.y = 0.45;

    if (this.avatar.accessory === 'antenna') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25), secMat);
      pole.position.y = 0.12;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), glowMat);
      bulb.position.y = 0.24;
      auxGroup.add(pole, bulb);
    } else if (this.avatar.accessory === 'hat') {
      const hatRim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16), priMat);
      const hatCap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 16), secMat);
      hatCap.position.y = 0.2;
      auxGroup.add(hatRim, hatCap);
    } else if (this.avatar.accessory === 'headphones') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 8, 32, Math.PI), secMat);
      band.rotation.z = Math.PI;
      band.position.y = -0.3;
      const speakerL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), priMat);
      speakerL.rotation.z = Math.PI / 2;
      speakerL.position.set(-0.35, -0.3, 0);
      const speakerR = speakerL.clone();
      speakerR.position.x = 0.35;
      auxGroup.add(band, speakerL, speakerR);
    } else if (this.avatar.accessory === 'halo') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 16), glowMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.1;
      auxGroup.add(halo);
    }

    this.playerGroup.add(auxGroup);
  }

  private generateForestPlatformerTrack() {
    this.platforms = [];
    this.coins = [];
    this.questionBlocks = [];

    // Soil/Grass visual materials
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.9 }); // brown soil
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }); // glowing green grass top

    // 1. Spawn Starting Stable base
    this.addPlatformBox(-3, -0.4, -2, 6, 0.5, 5, grassMat, soilMat);

    // Calculate dynamic coordinates of track increments based on difficulty
    const isHardLevelMask = this.levelId >= 7;
    const isMedLevelMask = this.levelId >= 4 && this.levelId < 7;

    let segmentZ = 4.0;
    const maxZ = 55.0;
    let blockCount = 0;

    // Track platform sizes
    while (segmentZ < maxZ - 4) {
      const platformWidth = isHardLevelMask ? 2.5 : isMedLevelMask ? 3.5 : 4.5;
      const platformDepth = isHardLevelMask ? 3.0 : isMedLevelMask ? 4.0 : 5.0;
      
      // Calculate layout shift offset
      const xOffset = Math.sin(segmentZ * 0.25) * (isHardLevelMask ? 3.2 : isMedLevelMask ? 2.2 : 1.2);
      const yAltitude = Math.max(0.1, 0.8 + Math.cos(segmentZ * 0.15) * (isHardLevelMask ? 1.6 : isMedLevelMask ? 1.0 : 0.4));

      // Check if it's a moving branch log or stagnant soil platform
      const shouldMove = (isHardLevelMask && segmentZ > 12) || (isMedLevelMask && segmentZ > 20);
      const moveAxis = segmentZ % 2 === 0 ? 'x' : 'y';
      const moveRange = isHardLevelMask ? 3.0 : 1.8;
      const moveSpeed = 1.0 + Math.random() * 1.5;

      // Draw soil column platform
      this.addPlatformBox(
        xOffset - platformWidth / 2,
        yAltitude - 0.5,
        segmentZ,
        platformWidth,
        0.5,
        platformDepth,
        grassMat,
        soilMat,
        shouldMove,
        moveAxis,
        moveRange,
        moveSpeed
      );

      // Scatter 1-2 rotating yellow coins on this segment
      const numCoins = Math.random() > 0.4 ? 2 : 1;
      for (let c = 0; c < numCoins; c++) {
        const coinX = xOffset + (Math.random() - 0.5) * (platformWidth - 1.0);
        const coinZ = segmentZ + (Math.random() - 0.4) * (platformDepth - 1.0);
        const coinY = yAltitude + 0.42 + Math.random() * 0.3;
        this.addCollectableCoin(coinX, coinY, coinZ);
      }

      // Procedural spacing gaps between platforms
      const jumpGap = isHardLevelMask ? 4.5 : isMedLevelMask ? 3.8 : 3.0;
      segmentZ += platformDepth + jumpGap;
    }

    // 2. Add Finish Goal Platform
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    this.addPlatformBox(-3.5, 0.0, maxZ - 3, 7, 0.4, 6, grassMat, portalMat);

    // 3. Spawning Exactly 3 interactive Question Mark (?) blocks
    // Placed directly on top of the grass of actual platforms
    const targetZRegions = [14.0, 28.0, 42.0];

    targetZRegions.forEach((targetZ, idx) => {
      // Find the platform generated closest in Z to targetZ
      let bestPlatform = this.platforms[0];
      let minDistance = Infinity;

      this.platforms.forEach((p) => {
        // Skip index 0 (initial start platform base)
        if (p.basePos.z < 3) return;

        const distZ = Math.abs(p.basePos.z - targetZ);
        if (distZ < minDistance) {
          minDistance = distZ;
          bestPlatform = p;
        }
      });

      // Place Question block directly at the horizontal center on top of the grass of this platform
      const parentGroup = bestPlatform.mesh.parent;
      if (parentGroup) {
        // Relative coordinates inside the platform's group:
        // center coordinate is of relative X=0, h/2 + half block height (0.375) so it stands on grass, Z=0
        const localY = bestPlatform.height / 2 + 0.38;
        this.createAndRegisterQuestionBlock(0, localY, 0, idx, parentGroup);
      } else {
        // Fallback to absolute space
        const surfaceY = bestPlatform.basePos.y + bestPlatform.height / 2;
        this.createAndRegisterQuestionBlock(bestPlatform.basePos.x, surfaceY + 0.38, bestPlatform.basePos.z, idx);
      }
    });

    // 4. Build Finish Portal assembly (Glowing Gate)
    this.createPortalStructure(0, 0.2, maxZ);

    // 5. Boss Fight Area setup for final Level 10
    if (this.levelId === 10) {
      this.spawnBossOverlord(0, 3.2, maxZ - 1.0);
    }
  }

  private addPlatformBox(
    x: number, y: number, z: number,
    w: number, h: number, d: number,
    topMat: THREE.Material, sideMat: THREE.Material,
    isMoving = false, moveAxis: 'x' | 'y' | 'z' = 'x', moveRange = 0, moveSpeed = 0
  ) {
    const parentGroup = new THREE.Group();
    parentGroup.position.set(x + w / 2, y + h / 2, z + d / 2);
    this.scene.add(parentGroup);

    // Grass Top plate
    const topGeo = new THREE.BoxGeometry(w, 0.1, d);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = h / 2 - 0.05;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    parentGroup.add(topMesh);

    // Soil Base block
    const baseGeo = new THREE.BoxGeometry(w, h - 0.1, d);
    const baseMesh = new THREE.Mesh(baseGeo, sideMat);
    baseMesh.position.y = -0.05;
    baseMesh.castShadow = true;
    parentGroup.add(baseMesh);

    // Register platform
    this.platforms.push({
      mesh: topMesh, // We keep reference of top mesh to track Y landing plane
      width: w,
      height: h,
      depth: d,
      isMoving,
      moveAxis,
      moveRange,
      moveSpeed,
      basePos: parentGroup.position.clone()
    });

    // Save logs as decorations if moving
    if (isMoving) {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
      const woodRing = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, w + 0.1, 8), woodMat);
      woodRing.rotation.z = Math.PI / 2;
      woodRing.position.y = -h / 2;
      parentGroup.add(woodRing);
    }
  }

  private addCollectableCoin(x: number, y: number, z: number) {
    const coinGroup = new THREE.Group();
    coinGroup.position.set(x, y, z);
    this.scene.add(coinGroup);

    // Yellow golden torus coin mesh
    const coinGeo = new THREE.TorusGeometry(0.24, 0.08, 8, 24);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden glowing color
      emissive: 0xeab308,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.1
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.rotation.y = Math.random() * Math.PI;
    coinMesh.castShadow = true;
    coinGroup.add(coinMesh);

    // Small interior star or diamond geometry core to make it premium
    const coreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    coinGroup.add(coreMesh);

    this.coins.push({
      mesh: coinMesh,
      collected: false,
      baseY: y,
      spinSpeed: 2.0 + Math.random() * 1.5
    });
  }

  private createAndRegisterQuestionBlock(x: number, y: number, z: number, index: number, parent: THREE.Object3D = this.scene) {
    const blockGroup = new THREE.Group();
    blockGroup.position.set(x, y, z);
    parent.add(blockGroup);

    // Classic orange Question Block box structure
    const blockGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const qMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange active
      emissive: 0xeab308,
      emissiveIntensity: 0.3,
      roughness: 0.1,
      metalness: 0.3
    });
    const blockMesh = new THREE.Mesh(blockGeo, qMat);
    blockMesh.castShadow = true;
    blockGroup.add(blockMesh);

    // Visual glowing ? wireframe rings above the box for visual accessibility
    const ringGeo = new THREE.TorusGeometry(0.35, 0.02, 6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const wireRing = new THREE.Mesh(ringGeo, ringMat);
    wireRing.rotation.x = Math.PI / 2;
    wireRing.position.y = 0.5;
    blockGroup.add(wireRing);

    // Add a pulsing point light under the question mark block
    const qLight = new THREE.PointLight(0xeab308, 1.2, 3);
    qLight.position.y = -0.1;
    blockGroup.add(qLight);

    // Store references
    this.questionBlocks.push({
      mesh: blockMesh,
      index,
      solved: false,
      baseY: y,
      sparkMesh: wireRing
    });
  }

  private portalGateLoop: THREE.Mesh | null = null;
  private portalFlameLight: THREE.PointLight | null = null;

  private createPortalStructure(x: number, y: number, z: number) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, y, z - 1);
    this.scene.add(gateGroup);

    // Twin stone obsidian pillars bordering the gate
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const colL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 0.5), pillarMat);
    colL.position.set(-1.8, 1.75, 0);
    colL.castShadow = true;
    const colR = colL.clone();
    colR.position.x = 1.8;

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.4, 0.6), pillarMat);
    lintel.position.set(0, 3.5, 0);
    gateGroup.add(colL, colR, lintel);

    // The glowing circular portal aperture inside pillars
    const gateGeo = new THREE.TorusGeometry(1.3, 0.12, 12, 32);
    // Translucent teal material representing inter-dimensional bridge
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15 // Default dim, fully activates on all questions cleared!
    });
    this.portalGateLoop = new THREE.Mesh(gateGeo, gateMat);
    this.portalGateLoop.position.set(0, 1.6, 0.05);
    gateGroup.add(this.portalGateLoop);

    // Dynamic light inside portal to illuminate exit
    this.portalFlameLight = new THREE.PointLight(0x0284c7, 0.1, 8);
    this.portalFlameLight.position.set(0, 1.6, 0.2);
    gateGroup.add(this.portalFlameLight);
  }

  private spawnBossOverlord(x: number, y: number, z: number) {
    this.bossGroup = new THREE.Group();
    this.bossGroup.position.set(x, y, z);
    this.scene.add(this.bossGroup);

    // Floating giant mechanical brain/eye core
    const shellGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.2,
      metalness: 0.8
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    this.bossGroup.add(shell);

    // Giant central crimson analytical lens
    const lensGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 0.95);
    this.bossGroup.add(lens);

    // Orbiting holographic logic rings
    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    halo1.rotation.y = Math.PI / 4;
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    halo2.rotation.x = Math.PI / 4;
    this.bossGroup.add(halo1, halo2);

    // Dynamic warning spotlight below boss
    const bLight = new THREE.PointLight(0xef4444, 1.5, 10);
    this.bossGroup.add(bLight);
  }

  private addAmbientEnvironmentAssets() {
    this.decorations = [];

    // 1. Spawning dynamic starry fireflies (Spark particles)
    const fireflyCount = 70;
    const fireflyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);

    const rangeX = 14.0;
    const rangeYMin = 0.5;
    const rangeYMax = 6.0;
    const rangeZ = 58.0;

    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * rangeX;
      positions[i * 3 + 1] = rangeYMin + Math.random() * (rangeYMax - rangeYMin);
      positions[i * 3 + 2] = Math.random() * rangeZ;
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const fireflyMat = new THREE.PointsMaterial({
      color: 0x86efac, // neon light green forest spirits
      size: 0.18,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    this.scene.add(this.fireflies);

    // 2. Spawn Pine Trees along borders of platforms
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });

    const numTrees = 28;
    for (let t = 0; t < numTrees; t++) {
      const treeZ = Math.random() * 56;
      // Alternate left and right borders of the platforms track
      const leftSided = t % 2 === 0;
      const treeX = leftSided ? -5.5 - Math.random() * 3 : 5.5 + Math.random() * 3;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(treeX, 0, treeZ);
      this.scene.add(treeGroup);

      // Wooden trunk column
      const trunkH = 1.4 + Math.random() * 1.5;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, trunkH, 8), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Layered pine cone foliage
      const leafCount = 3;
      for (let l = 0; l < leafCount; l++) {
        const rad = 0.95 - l * 0.22;
        const h = 1.1 - l * 0.15;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 8), leafMat);
        cone.position.y = trunkH + l * 0.6;
        cone.castShadow = true;
        treeGroup.add(cone);
      }

      this.decorations.push(treeGroup);
    }

    // 3. Spawning small cute red mushrooms on platforms
    const shroomCount = 20;
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2 });

    for (let m = 0; m < shroomCount; m++) {
      // Find a platform to spawn onto
      const targetPlat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
      if (!targetPlat) continue;

      const mX = targetPlat.basePos.x + (Math.random() - 0.5) * (targetPlat.width - 0.8);
      const mZ = targetPlat.basePos.z + (Math.random() - 0.5) * (targetPlat.depth - 0.8);
      const mY = targetPlat.basePos.y + 0.25;

      const shroom = new THREE.Group();
      shroom.position.set(mX, mY, mZ);
      this.scene.add(shroom);

      // Small cylindrical stalk
      const baseStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.2), stemMat);
      baseStem.position.y = 0.1;
      shroom.add(baseStem);

      // Red round toadstool cap
      const baseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.02, 0.12, 10), capMat);
      baseCap.position.y = 0.2;
      shroom.add(baseCap);

      this.mushrooms.push({
        mesh: shroom,
        basePosition: shroom.position.clone(),
        hazard: false,
        bounceTimer: Math.random() * Math.PI
      });
    }

    // Spawning 4 active TOXIC Mushroom hazards in high levels (Level 7+)
    if (this.levelId >= 7) {
      const hazardColor = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.1 }); // purple toxic glow
      const hazardTrunk = new THREE.MeshStandardMaterial({ color: 0x4c1d95 });

      const hazardPositions = [
        { x: 0, z: 18.0 },
        { x: -0.8, z: 24.0 },
        { x: 0.8, z: 34.0 },
        { x: 0, z: 47.0 },
      ];

      hazardPositions.forEach((hp) => {
        const hazardShroom = new THREE.Group();
        // Check local ground altitude base
        let groundY = 0.3;
        const matchingPlat = this.platforms.find(p => Math.abs(p.basePos.z - hp.z) < p.depth / 2);
        if (matchingPlat) {
          groundY = matchingPlat.basePos.y + 0.25;
        }
        hazardShroom.position.set(hp.x, groundY, hp.z);
        this.scene.add(hazardShroom);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45), hazardTrunk);
        stem.position.y = 0.22;
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), hazardColor);
        cap.position.y = 0.45;
        hazardShroom.add(stem, cap);

        this.mushrooms.push({
          mesh: hazardShroom,
          basePosition: hazardShroom.position.clone(),
          hazard: true,
          bounceTimer: Math.random() * Math.PI
        });
      });
    }
  }

  // Solve block externally when core modal answers correctly!
  public markQuestionSolved(blockIndex: number) {
    const qBlock = this.questionBlocks.find(b => b.index === blockIndex);
    if (!qBlock) return;

    qBlock.solved = true;
    this.solvedBlocksMask[blockIndex] = true;

    // Change visual style of the hit ? block to a dull metal state
    (qBlock.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x64748b);
    (qBlock.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x334155);
    (qBlock.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;

    // Hide or dim the wireframe light
    if (qBlock.sparkMesh) {
      qBlock.sparkMesh.visible = false;
    }

    // Trigger fireworks or happy confetti particles at the block location
    const qbWorld = new THREE.Vector3();
    qBlock.mesh.getWorldPosition(qbWorld);
    this.burstSparkConfetti(qbWorld.x, qbWorld.y + 0.5, qbWorld.z);

    // Audit Portal status
    const allSolved = this.solvedBlocksMask.every(v => v);
    const solvedCount = this.solvedBlocksMask.filter(v => v).length;

    if (allSolved && this.levelScore >= this.levelTarget) {
      this.callbacks.onStatusMessage("Success! All 3 AI Concept Quiz blocks solved & Coins target satisfied! Cross the Finish Portal gateway!");
      
      // Open / illuminate Portal exit
      if (this.portalGateLoop) {
        (this.portalGateLoop.material as THREE.MeshBasicMaterial).color.setHex(0x10b981); // Emerald green!
        (this.portalGateLoop.material as THREE.MeshBasicMaterial).opacity = 0.85;
      }
      if (this.portalFlameLight) {
        this.portalFlameLight.color.setHex(0x10b981);
        this.portalFlameLight.intensity = 2.5;
      }
    } else {
      this.callbacks.onStatusMessage(`Block ${blockIndex + 1} verified! (${solvedCount}/3 solved). Current parameters balance metrics beautifully.`);
    }
  }

  private burstParticles: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }> = [];

  private burstSparkConfetti(x: number, y: number, z: number) {
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const colors = [0x10b981, 0x3b82f6, 0xfacc15, 0xec4899];

    for (let i = 0; i < 15; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed * 0.4,
        (0.5 + Math.random()) * speed * 0.5,
        Math.sin(angle) * speed * 0.4
      );

      this.burstParticles.push({
        mesh,
        vel,
        life: 0.8 + Math.random() * 0.4
      });
    }
  }

  // Update loop ticks 3D coordinate changes every timestep
  public update(delta: number, inputs: PlayerInput) {
    if (this.isPaused) return;

    // Check death limits
    if (this.health <= 0) {
      return;
    }

    // 1. Process active burst particles logic
    this.updateBurstParticles(delta);

    // 2. Animate environmental props (spinning coins, floating tree branches, cute shrooms)
    this.animateEnvironmentAssets(delta);

    // 3. Move Platform Log segments dynamically
    this.updateMovingPlatforms(delta);

    // 4. Mario Player Movement Physics Control
    this.updatePlayerPhysics(delta, inputs);

    // 5. Boss Overlord firing pulses in Level 10
    if (this.levelId === 10) {
      this.updateBossLaserRings(delta);
    }

    // 6. Camera follows the player group seamlessly in 3D
    const desiredCameraPos = new THREE.Vector3(
      this.playerGroup.position.x,
      this.playerGroup.position.y + 4.2,
      this.playerGroup.position.z - 7.5 // standard third-person overhead chase projection
    );
    this.camera.position.lerp(desiredCameraPos, 0.08);
    this.camera.lookAt(new THREE.Vector3(
      this.playerGroup.position.x,
      this.playerGroup.position.y + 0.5,
      this.playerGroup.position.z + 1.5
    ));
  }

  private updateBurstParticles(delta: number) {
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const p = this.burstParticles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y += -9.8 * delta; // small friction gravity
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.burstParticles.splice(i, 1);
      }
    }
  }

  private animateEnvironmentAssets(delta: number) {
    // Spin coins in air
    this.coins.forEach((c) => {
      if (!c.collected) {
        c.mesh.rotation.y += c.spinSpeed * delta;
        // Soft floating bounce
        c.mesh.position.y = c.baseY + Math.sin(Date.now() * 0.003 + c.baseY) * 0.15;
      }
    });

    // Make mushrooms bounce or sway cute-like
    this.mushrooms.forEach((m) => {
      m.bounceTimer += delta * 2.0;
      m.mesh.scale.y = 1.0 + Math.sin(m.bounceTimer) * 0.08;
      m.mesh.scale.x = 1.0 - Math.sin(m.bounceTimer) * 0.05;
    });

    // Fireflies hovering noise drifting drift coordinates
    if (this.fireflies) {
      const positions = this.fireflies.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      const time = Date.now() * 0.0005;

      for (let i = 0; i < count; i++) {
        positions[i * 3] += Math.sin(time + i) * 0.02 * (Math.random() > 0.5 ? 1 : -1);
        positions[i * 3 + 1] += Math.cos(time + i * 2) * 0.01;
        // Keep within Z tracks
        if (positions[i * 3 + 2] < 0) positions[i * 3 + 2] = 58;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateMovingPlatforms(delta: number) {
    const time = Date.now() * 0.0015;

    this.platforms.forEach((p) => {
      if (p.isMoving) {
        // Group offset parent
        const parent = p.mesh.parent;
        if (!parent) return;

        const cycle = Math.sin(time * p.moveSpeed) * p.moveRange;
        if (p.moveAxis === 'x') {
          parent.position.x = p.basePos.x + cycle;
        } else if (p.moveAxis === 'y') {
          parent.position.y = p.basePos.y + cycle;
        } else {
          parent.position.z = p.basePos.z + cycle;
        }
      }
    });
  }

  private updatePlayerPhysics(delta: number, inputs: PlayerInput) {
    // A. WASD Horizontal Movement relative to Z track
    const moveZ = (inputs.forward ? 1 : 0) - (inputs.backward ? 1 : 0);
    const moveX = (inputs.left ? 1 : 0) - (inputs.right ? 1 : 0); // reverse coordinates for intuitive feel

    // Map velocity inputs
    this.playerVelocity.x = moveX * this.playerSpeed;
    this.playerVelocity.z = moveZ * this.playerSpeed;

    // Apply Gravity pull
    this.playerVelocity.y += this.gravityForce * delta;

    // Jump logic trigger
    if (inputs.space && this.isGrounded) {
      this.playerVelocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Capture old coordinate state to resolve walls
    const oldPos = this.playerGroup.position.clone();

    // Resolve preliminary position step
    this.playerGroup.position.x += this.playerVelocity.x * delta;
    this.playerGroup.position.z += this.playerVelocity.z * delta;
    this.playerGroup.position.y += this.playerVelocity.y * delta;

    // Rotate player model towards the running方向 (running direction)
    if (Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01) {
      const angle = Math.atan2(this.playerVelocity.x, this.playerVelocity.z);
      this.playerGroup.rotation.y = angle;
    }

    // B. Handle platform physical collisions
    this.isGrounded = false;
    
    // Find absolute bounds of character cube
    const pY = this.playerGroup.position.y;
    const pX = this.playerGroup.position.x;
    const pZ = this.playerGroup.position.z;

    this.platforms.forEach((p) => {
      // Find dynamic location of the model group
      const parent = p.mesh.parent;
      if (!parent) return;

      const halfW = p.width / 2;
      const halfD = p.depth / 2;

      // Current exact platform top limits taking moving axes into calculation
      const platX = parent.position.x;
      const platY = parent.position.y + p.height / 2; // actual top grass sheet
      const platZ = parent.position.z;

      // Checking horizontal overlap
      const withinX = pX >= platX - halfW - 0.28 && pX <= platX + halfW + 0.28;
      const withinZ = pZ >= platZ - halfD - 0.28 && pZ <= platZ + halfD + 0.28;

      if (withinX && withinZ) {
        // Checking if falling downward onto surface plane
        const dY = pY - platY;
        if (dY >= -0.2 && dY <= 0.45 && this.playerVelocity.y <= 0) {
          // Landing snap!
          this.playerGroup.position.y = platY + 0.15;
          this.playerVelocity.y = 0;
          this.isGrounded = true;

          // Record as last safe platform coordinate to recover from falling void
          this.lastSafeCheckpoint.set(platX, platY + 0.5, platZ);
        }
      }
    });

    // C. Collision with interactive Question blocks!
    this.questionBlocks.forEach((qb) => {
      if (qb.solved) return;

      const qbWorldPos = new THREE.Vector3();
      qb.mesh.getWorldPosition(qbWorldPos);
      const dist = this.playerGroup.position.distanceTo(qbWorldPos);
      if (dist < 1.05) {
        // HIT TARGET!
        // Pause simulation and raise quiz callback panel
        this.isPaused = true;
        
        // Bounce player down Mario-style
        this.playerVelocity.y = -2.5; 
        this.playerGroup.position.y -= 0.1;

        if (this.callbacks.onHitQuestionBlock) {
          this.callbacks.onHitQuestionBlock(qb.index);
        }
      }
    });

    // D. Collect gold coins collision detection
    this.coins.forEach((c) => {
      if (c.collected) return;

      const dist = this.playerGroup.position.distanceTo(c.mesh.parent ? c.mesh.parent.position : c.mesh.position);
      if (dist < 0.85) {
        // Coin claimed!
        c.collected = true;
        c.mesh.visible = false;
        if (c.mesh.parent) {
          c.mesh.parent.visible = false;
        }

        // Celebrate with confetti Sparks
        this.burstSparkConfetti(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z);

        // Update score count
        this.levelScore += 1;
        this.callbacks.onScoreChange(this.levelScore, this.levelTarget);

        const solvedCount = this.solvedBlocksMask.filter(v => v).length;
        this.callbacks.onStatusMessage(`Gold Coin collected! Score: ${this.levelScore}/${this.levelTarget}. (${solvedCount}/3 quiz blocks solved)`);
      }
    });

    // E. Toxic hazard mushroom collision (High difficulty levels)
    this.mushrooms.forEach((m) => {
      if (m.hazard) {
        const dist = this.playerGroup.position.distanceTo(m.mesh.position);
        if (dist < 0.78) {
          // Player took damage!
          this.health = Math.max(0, this.health - 25);
          this.callbacks.onStatusMessage("Ouch! Absorbed toxic mushroom poisons! Diagnostics took heavy damage (-25 HP).");
          
          // Knockback movement
          this.playerVelocity.z = -5.0;
          this.playerVelocity.y = 4.0;
          this.playerGroup.position.y += 0.2;

          // Relocate mushroom temporarily out of screen
          m.mesh.position.setY(-10.0);
          setTimeout(() => {
            m.mesh.position.copy(m.basePosition);
          }, 3000);

          if (this.health <= 0) {
            this.callbacks.onFail("Primary systems collapsed! Forest toxins overshot character buffer limits.");
          }
        }
      }
    });

    // F. Safe boundaries fallback check
    if (this.playerGroup.position.y < -4.2) {
      // Fell in deep forest bog voids!
      this.health = Math.max(0, this.health - 20);
      this.playerVelocity.set(0, 0, 0);

      if (this.health <= 0) {
        this.callbacks.onFail("Primary fuel units collapsed! You fell off into the dark swamp floor too many times.");
      } else {
        // Reboot onto last safe checkpoint coordinates!
        this.playerGroup.position.copy(this.lastSafeCheckpoint);
        this.callbacks.onStatusMessage("Void detected! Teleporting back to safe checkpoint coordinates (-20 HP). Jump timing is crucial!");
      }
    }

    // G. Victory portal detection
    const distToPortal = this.playerGroup.position.z;
    if (distToPortal >= 52.5) {
      const allQuestionsSolved = this.solvedBlocksMask.every(v => v);
      const coinRequirementSatisfied = this.levelScore >= this.levelTarget;

      if (allQuestionsSolved && coinRequirementSatisfied) {
        // Complete current stage trigger!
        // Determine star rating based on outstanding achievements:
        let stars = 1;
        if (this.levelScore >= this.levelTarget + 4) stars = 3;
        else if (this.levelScore >= this.levelTarget + 1) stars = 2;

        this.callbacks.onComplete(stars);
      } else {
        // Notify player of missing requirements
        const unsolvedCount = 3 - this.solvedBlocksMask.filter(v => v).length;
        if (unsolvedCount > 0) {
          this.callbacks.onStatusMessage(`Exit block is closed! You must bump and solve the remaining ${unsolvedCount} interactive ? Blocks!`);
        } else {
          this.callbacks.onStatusMessage(`Almost there! You require at least ${this.levelTarget} coins. You have ${this.levelScore} coins.`);
        }
        // Force slide slightly back to prevent infinite collision loops
        this.playerGroup.position.z = 51.5;
        this.playerVelocity.set(0, 0, 0);
      }
    }
  }

  private updateBossLaserRings(delta: number) {
    if (!this.bossGroup) return;

    this.bossPulseTimer += delta;

    // Periodic pulse launch (every 4 seconds)
    if (this.bossPulseTimer >= 4.0) {
      this.bossPulseTimer = 0;
      this.launchOverlordLaserRing();
    }

    // Animate expanding shockwave rings and check character proximity collisions
    const pX = this.playerGroup.position.x;
    const pZ = this.playerGroup.position.z;
    const pY = this.playerGroup.position.y;

    const bX = this.bossGroup.position.x;
    const bZ = this.bossGroup.position.z;

    for (let r = this.bossRings.length - 1; r >= 0; r--) {
      const ring = this.bossRings[r];
      ring.radius += ring.speed * delta;
      ring.mesh.scale.set(ring.radius, ring.radius, 1);

      // Check distance interface
      const playerDistToBoss = Math.sqrt((pX - bX) * (pX - bX) + (pZ - bZ) * (pZ - bZ));
      const ringThickness = 0.45;

      if (Math.abs(playerDistToBoss - ring.radius) < ringThickness) {
        // Player is horizontally on the ring!
        // Player MUST jump (y coordinate above ring height to dodge!)
        // The ring floats at y = 0.8 altitude
        if (pY < 1.0) {
          // OUCH! Caught by physical pulse wave
          this.health = Math.max(0, this.health - 15);
          this.callbacks.onStatusMessage("Laser ring alert! Overlord wave caught your ground armor: absorbed -15 HP!");
          
          // Visual spark confetti on damage
          this.burstSparkConfetti(pX, pY + 0.3, pZ);

          // Force ring collapse early
          this.scene.remove(ring.mesh);
          this.bossRings.splice(r, 1);

          if (this.health <= 0) {
            this.callbacks.onFail("Overlord AI overshot your defense algorithms: rebooting required!");
          }
          continue;
        }
      }

      // Max lifecycle decay
      if (ring.radius >= ring.maxRadius) {
        this.scene.remove(ring.mesh);
        this.bossRings.splice(r, 1);
      }
    }
  }

  private launchOverlordLaserRing() {
    if (!this.bossGroup) return;

    // Red expanding circular line
    const rGeo = new THREE.TorusGeometry(1.0, 0.08, 6, 24);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(rGeo, rMat);
    
    // Rotate horizontal to expand along track plane
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(this.bossGroup.position.x, 0.4, this.bossGroup.position.z);
    this.scene.add(ringMesh);

    this.bossRings.push({
      mesh: ringMesh,
      radius: 1.0,
      maxRadius: 18.0,
      speed: 4.5
    });

    this.callbacks.onStatusMessage("Warning! Overlord Neurona fired a deep adaptive crimson laser wave! Jump to clear!");
  }
}
