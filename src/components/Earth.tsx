"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // ===== Starfield (denser, more distant) =====
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 6000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 30 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = 0.3 + Math.random() * 1.2;

      const tint = Math.random();
      if (tint < 0.3) {
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      } else if (tint < 0.6) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.8;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // ===== Holographic Earth Group =====
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // --- 1. Wireframe Globe (main holographic mesh) ---
    const wireGeo = new THREE.SphereGeometry(1, 32, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f0ff),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    earthGroup.add(wireframe);

    // --- 2. Inner glowing core ---
    const coreGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f0ff),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    earthGroup.add(core);

    // --- 3. Latitude/Longitude lines (custom wireframe) ---
    const linesGroup = new THREE.Group();
    earthGroup.add(linesGroup);

    function createLatLonLines() {
      const mat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.12,
      });

      // Latitudes
      for (let lat = -80; lat <= 80; lat += 20) {
        const phi = (90 - lat) * (Math.PI / 180);
        const points: THREE.Vector3[] = [];
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const x = Math.sin(phi) * Math.cos(theta);
          const y = Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(theta);
          points.push(new THREE.Vector3(x, y, z));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        linesGroup.add(line);
      }

      // Longitudes
      for (let lon = 0; lon < 360; lon += 20) {
        const theta = lon * (Math.PI / 180);
        const points: THREE.Vector3[] = [];
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const phi = (i / segments) * Math.PI;
          const x = Math.sin(phi) * Math.cos(theta);
          const y = Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(theta);
          points.push(new THREE.Vector3(x, y, z));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        linesGroup.add(line);
      }
    }
    createLatLonLines();

    // --- 4. Holographic glow aura (multi-layer) ---
    const auraMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f0ff),
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const auraGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const aura = new THREE.Mesh(auraGeo, auraMat);
    earthGroup.add(aura);

    const auraMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x0088ff),
      transparent: true,
      opacity: 0.02,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const auraGeo2 = new THREE.SphereGeometry(1.5, 32, 32);
    const aura2 = new THREE.Mesh(auraGeo2, auraMat2);
    earthGroup.add(aura2);

    // --- 5. Equatorial particle ring ---
    const ringParticles = 300;
    const ringGeo = new THREE.BufferGeometry();
    const ringPos = new Float32Array(ringParticles * 3);
    const ringSizes = new Float32Array(ringParticles);
    for (let i = 0; i < ringParticles; i++) {
      const angle = (i / ringParticles) * Math.PI * 2;
      const radius = 1.6 + Math.random() * 0.4;
      const yOffset = (Math.random() - 0.5) * 0.1;
      ringPos[i * 3] = Math.cos(angle) * radius;
      ringPos[i * 3 + 1] = yOffset;
      ringPos[i * 3 + 2] = Math.sin(angle) * radius;
      ringSizes[i] = 0.02 + Math.random() * 0.03;
    }
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    ringGeo.setAttribute("size", new THREE.BufferAttribute(ringSizes, 1));

    const ringMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.015,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const ringPoints = new THREE.Points(ringGeo, ringMat);
    earthGroup.add(ringPoints);

    // --- 6. Floating data points (random dots on surface) ---
    const dotCount = 200;
    const dotGeo = new THREE.BufferGeometry();
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.01;
      dotPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dotPos[i * 3 + 1] = r * Math.cos(phi);
      dotPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    earthGroup.add(dots);

    // --- 7. Scan line ring (sweeping) ---
    const scanGeo = new THREE.RingGeometry(1.1, 1.3, 64);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanRing = new THREE.Mesh(scanGeo, scanMat);
    scanRing.rotation.x = Math.PI / 2;
    earthGroup.add(scanRing);

    // --- 8. Vertical scanner line ---
    const scanLineGeo = new THREE.BufferGeometry();
    const scanLinePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      scanLinePoints.push(
        new THREE.Vector3(Math.cos(angle) * 1.05, 0, Math.sin(angle) * 1.05)
      );
    }
    scanLineGeo.setFromPoints(scanLinePoints);
    const scanLineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const scanLine = new THREE.Line(scanLineGeo, scanLineMat);
    earthGroup.add(scanLine);

    // ===== Lighting =====
    const ambientLight = new THREE.AmbientLight(0x003355, 0.3);
    scene.add(ambientLight);

    const blueLight = new THREE.DirectionalLight(0x4488ff, 0.6);
    blueLight.position.set(3, 2, 4);
    scene.add(blueLight);

    const backLight = new THREE.DirectionalLight(0x00ddff, 0.3);
    backLight.position.set(-3, -1, -3);
    scene.add(backLight);

    // ===== Mouse Tracking =====
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / width - 0.5) * 2;
      mouseRef.current.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseRef.current.x = (touch.clientX / width - 0.5) * 2;
      mouseRef.current.y = (touch.clientY / height - 0.5) * 2;
    };
    window.addEventListener("touchmove", handleTouchMove);

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

      // Auto-rotation
      earthGroup.rotation.y += 0.0015;

      // Mouse-driven tilt
      const targetRotX = mouseRef.current.y * 0.15;
      const targetRotZ = mouseRef.current.x * 0.3;
      earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * 0.03;
      earthGroup.rotation.z += (targetRotZ - earthGroup.rotation.z) * 0.03;

      // Wireframe pulse
      wireMat.opacity = 0.2 + Math.sin(elapsed * 0.5) * 0.08;

      // Core pulse
      coreMat.opacity = 0.1 + Math.sin(elapsed * 0.8) * 0.08;
      core.scale.setScalar(1 + Math.sin(elapsed * 0.6) * 0.05);

      // Aura breathing
      const auraScale = 1 + Math.sin(elapsed * 0.3) * 0.02;
      aura.scale.setScalar(auraScale);
      aura2.scale.setScalar(1 + Math.sin(elapsed * 0.4 + 1) * 0.03);

      // Scan ring oscillation
      scanRing.position.y = Math.sin(elapsed * 0.6) * 1.5;
      scanRing.rotation.z = Math.sin(elapsed * 0.3) * 0.1;
      scanMat.opacity = 0.08 + Math.sin(elapsed * 0.6) * 0.07;

      // Scan line rotation
      scanLine.rotation.x = Math.sin(elapsed * 0.4) * 0.3;
      scanLine.rotation.z = Math.sin(elapsed * 0.5) * 0.1;

      // Ring particles rotation
      ringPoints.rotation.y += 0.002;
      ringPoints.rotation.x = Math.sin(elapsed * 0.2) * 0.05;

      // Stars subtle rotation
      stars.rotation.y += 0.00005;

      // Dots twinkle
      dotMat.opacity = 0.2 + Math.sin(elapsed * 0.7) * 0.15;

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
