"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec3 u_color_primary;
  uniform vec3 u_color_accent;
  varying vec2 vUv;

  void main() {
    float ripple = sin((vUv.x - 0.5) * 10.0 + u_time * 2.0) * 0.5 + 0.5;
    float pulse = sin(u_time * 1.5) * 0.5 + 0.5;
    
    vec3 color = mix(u_color_primary, u_color_accent, ripple * pulse);
    
    float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    
    gl_FragColor = vec4(color * edgeFade, 1.0);
  }
`;

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 15);
    scene.add(camera);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Colors from CSS variables
    const style = getComputedStyle(document.documentElement);
    const primaryColor = new THREE.Color(`hsl(${style.getPropertyValue('--primary').trim()})`);
    const accentColor = new THREE.Color(`hsl(${style.getPropertyValue('--accent').trim()})`);

    // Shader Material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color_primary: { value: primaryColor },
        u_color_accent: { value: accentColor },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });
    
    // Geometry
    const boardGeometry = new THREE.BoxGeometry(30, 0.2, 4);
    const board = new THREE.Mesh(boardGeometry, shaderMaterial);
    board.position.y = 0;
    scene.add(board);

    const pinGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 16);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let i = 0; i < 9; i++) {
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.set(i * 1.5 - 6, 1.1, 0);
        scene.add(pin);
    }

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      shaderMaterial.uniforms.u_time.value = clock.getElapsedTime();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const setCameraView = (pos: [number, number, number]) => {
    if (controlsRef.current) {
        controlsRef.current.object.position.set(...pos);
    }
  }

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mountRef} className="h-full w-full" />
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <Button size="icon" variant="secondary" onClick={() => setCameraView([0, 4, 15])} aria-label="Vista Frontal">
                <Camera />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => setCameraView([15, 8, 0])} aria-label="Vista Lateral">
                <Camera />
            </Button>
             <Button size="icon" variant="secondary" onClick={() => setCameraView([0, 20, 0.1])} aria-label="Vista Superior">
                <Camera />
            </Button>
      </div>
    </div>
  );
};

export default ThreeScene;
