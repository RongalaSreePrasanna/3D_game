import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarConfig } from '../types';

interface AvatarCanvasProps {
  avatar: AvatarConfig;
}

export default function AvatarCanvas({ avatar }: AvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    
    // Transparent or soft background
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.set(0, 1.2, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 2);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(-5, 5, 5);
    scene.add(spotLight);

    // AVATAR GROUP
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // CREATE MODEL PROCEDURALLY
    const priMat = new THREE.MeshToonMaterial({ 
      color: new THREE.Color(avatar.primaryColor)
    });
    const secMat = new THREE.MeshToonMaterial({ 
      color: new THREE.Color(avatar.secondaryColor)
    });
    const blackMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 80 });
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(avatar.glowColor) });

    let mainMesh: THREE.Mesh | null = null;

    // Body Shapes
    if (avatar.shape === 'box') {
      const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      mainMesh = new THREE.Mesh(geo, priMat);
    } else if (avatar.shape === 'cylinder') {
      const geo = new THREE.CylinderGeometry(0.4, 0.5, 0.9, 16);
      mainMesh = new THREE.Mesh(geo, priMat);
    } else if (avatar.shape === 'sphere') {
      const geo = new THREE.SphereGeometry(0.5, 32, 32);
      mainMesh = new THREE.Mesh(geo, priMat);
    } else { // torus
      const geo = new THREE.TorusGeometry(0.4, 0.15, 16, 100);
      mainMesh = new THREE.Mesh(geo, priMat);
    }

    if (mainMesh) {
      avatarGroup.add(mainMesh);
    }

    // Cute Giant Face Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeo, blackMat);
    const eyeR = new THREE.Mesh(eyeGeo, blackMat);

    eyeL.position.set(-0.2, 0.05, 0.42);
    eyeR.position.set(0.2, 0.05, 0.42);
    
    // Add eye glints
    const glintGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glintL = new THREE.Mesh(glintGeo, glintMat);
    const glintR = new THREE.Mesh(glintGeo, glintMat);
    glintL.position.set(0.03, 0.03, 0.06);
    glintR.position.set(0.03, 0.03, 0.06);
    eyeL.add(glintL);
    eyeR.add(glintR);

    avatarGroup.add(eyeL);
    avatarGroup.add(eyeR);

    // Mouth / Visor
    if (avatar.id === 'cyber_bot') {
      const visorGeo = new THREE.BoxGeometry(0.65, 0.18, 0.1);
      const visor = new THREE.Mesh(visorGeo, glowMat);
      visor.position.set(0, -0.15, 0.41);
      avatarGroup.add(visor);
    } else {
      const mouthGeo = new THREE.RingGeometry(0.02, 0.05, 32, 1, 0, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.rotation.x = Math.PI;
      mouth.position.set(0, -0.12, 0.46);
      avatarGroup.add(mouth);
    }

    // Accessory Setup
    const accGroup = new THREE.Group();
    accGroup.position.y = 0.5;

    if (avatar.accessory === 'antenna') {
      const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
      const pole = new THREE.Mesh(poleGeo, secMat);
      pole.position.y = 0.15;
      
      const tipGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const tip = new THREE.Mesh(tipGeo, glowMat);
      tip.position.y = 0.3;
      accGroup.add(pole, tip);
    } else if (avatar.accessory === 'hat') {
      const ringGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 16);
      const rim = new THREE.Mesh(ringGeo, priMat);
      
      const coneGeo = new THREE.ConeGeometry(0.25, 0.5, 16);
      const cap = new THREE.Mesh(coneGeo, secMat);
      cap.position.y = 0.25;
      accGroup.add(rim, cap);
    } else if (avatar.accessory === 'headphones') {
      const bandGeo = new THREE.TorusGeometry(0.45, 0.04, 8, 32, Math.PI);
      const band = new THREE.Mesh(bandGeo, secMat);
      band.rotation.z = Math.PI;
      band.position.y = -0.35;
      
      const earPadGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
      const earL = new THREE.Mesh(earPadGeo, priMat);
      earL.rotation.z = Math.PI / 2;
      earL.position.set(-0.45, -0.35, 0);

      const earR = earL.clone();
      earR.position.x = 0.45;

      accGroup.add(band, earL, earR);
    } else if (avatar.accessory === 'halo') {
      const ringGeo = new THREE.TorusGeometry(0.32, 0.03, 8, 32);
      const halo = new THREE.Mesh(ringGeo, glowMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.1;
      accGroup.add(halo);
    }

    avatarGroup.add(accGroup);

    // Subtle floating stage platform
    const platformGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.1, 32);
    const platformMat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 40 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.7;
    scene.add(platform);

    const rimGeo = new THREE.TorusGeometry(0.8, 0.03, 8, 32);
    const rimMesh = new THREE.Mesh(rimGeo, glowMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = -0.65;
    scene.add(rimMesh);

    // ANIMATION LOOP
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Idle Rotation
      avatarGroup.rotation.y = elapsed * 0.7;

      // Cute squash & bounce for Slime, float for others
      if (avatar.shape === 'sphere') {
        const bounce = Math.abs(Math.sin(elapsed * 4)) * 0.15;
        avatarGroup.position.y = bounce;
        // Squash squeeze
        const scaleY = 1 - bounce * 0.4;
        const scaleXZ = 1 + bounce * 0.2;
        avatarGroup.scale.set(scaleXZ, scaleY, scaleXZ);
      } else {
        avatarGroup.scale.set(1.0, 1.0, 1.0);
        avatarGroup.position.y = Math.sin(elapsed * 2.5) * 0.06;
      }

      // Sparkle background effect
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [avatar]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[220px]" 
      id={`avatar-canvas-${avatar.id}`}
    />
  );
}
