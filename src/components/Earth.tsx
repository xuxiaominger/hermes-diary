"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

// Earth texture URLs (free, high-res from Solar System Scope)
const EARTH_MAP =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png";
const EARTH_BUMP =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Whole_world_-_land_and_oceans_12000.jpg/1280px-Whole_world_-_land_and_oceans_12000.jpg";
const EARTH_SPECULAR =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Earth_specular_2002.jpg/1280px-Earth_specular_2002.jpg";
const CLOUD_MAP =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Earth_cloud_cover_2002.jpg/1280px-Earth_cloud_cover_2002.jpg";

export default function EarthScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ===== Scene Setup =====
    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ===== Starfield =====
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 4000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 1.5;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        // Blue-white
        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.6) {
        // Warm
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      } else {
        // White
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // ===== Earth =====
    const textureLoader = new THREE.TextureLoader();

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Main Earth
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load(EARTH_MAP),
      bumpMap: textureLoader.load(EARTH_BUMP),
      bumpScale: 0.02,
      specularMap: textureLoader.load(EARTH_SPECULAR),
      specular: new THREE.Color(0x333333),
      shininess: 5,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(1.008, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load(CLOUD_MAP),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(clouds);

    // Glass outer shell (frosted effect)
    const glassGeometry = new THREE.SphereGeometry(1.15, 48, 48);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x6366f1),
      transparent: true,
      opacity: 0.08,
      roughness: 0.1,
      metalness: 0.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      side: THREE.BackSide,
      envMapIntensity: 0.5,
    });
    const glassShell = new THREE.Mesh(glassGeometry, glassMaterial);
    earthGroup.add(glassShell);

    // Inner glow ring
    const glowGeometry = new THREE.RingGeometry(1.2, 2.0, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x6366f1),
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.1;
    earthGroup.add(glow);

    // ===== Lighting =====
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-3, -1, -3);
    scene.add(fillLight);

    // Slight blue rim light
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    rimLight.position.set(-2, 1, -4);
    scene.add(rimLight);

    // ===== Mouse Tracking =====
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / width - 0.5) * 2;
      mouseRef.current.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ===== Touch Support =====
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseRef.current.x = (touch.clientX / width - 0.5) * 2;
      mouseRef.current.y = (touch.clientY / height - 0.5) * 2;
    };
    window.addEventListener("touchmove", handleTouchMove);

    // ===== Resize =====
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ===== Animation Loop =====
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Earth auto-rotation
      earth.rotation.y += 0.0008;
      clouds.rotation.y += 0.0012;

      // Mouse-driven tilt and rotation
      const targetRotX = mouseRef.current.y * 0.15;
      const targetRotZ = mouseRef.current.x * 0.3;

      earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * 0.03;
      earthGroup.rotation.z += (targetRotZ - earthGroup.rotation.z) * 0.03;

      // Stars subtle rotation
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;

      // Cloud movement
      clouds.rotation.y += 0.001;

      // Glass shell breathing
      glassShell.scale.setScalar(
        1 + Math.sin(elapsed * 0.3) * 0.003
      );

      renderer.render(scene, camera);
    };

    animate();

    // ===== Cleanup =====
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="three-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
