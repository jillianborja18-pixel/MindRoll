// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { getSymbol } from './GameEngine';

function createTextTexture(text, bgColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(4, 4, 248, 248, 28);
  } else {
    ctx.rect(4, 4, 248, 248);
  }
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
ctx.lineWidth = 8;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(4, 4, 248, 248, 28);
  } else {
    ctx.rect(4, 4, 248, 248);
  }
  ctx.stroke();

  // Emoji
  ctx.font = '110px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

ctx.fillStyle = "#111";   // darker emoji
ctx.fillText(text, 128, 130);

  return new THREE.CanvasTexture(canvas);
}

// Two shades per RPS type matching DiceNet
const faceShadeColors = {
  rock:     ['#4b5563', '#6b7280'],
  paper:    ['#1d4ed8', '#3b82f6'],
  scissors: ['#7e22ce', '#a855f7'],
};

function getFaceBgColor(faces, index) {
  const symbol = faces[index];
  let count = 0;
  for (let i = 0; i < index; i++) {
    if (faces[i] === symbol) count++;
  }
  const shades = faceShadeColors[symbol];
  return shades ? shades[Math.min(count, shades.length - 1)] : '#f5f5f4';
}


export default function Dice3D({ faces, spinning = false, rolling = false, rollDir = null, size = 200, className = '', onRollComplete }) {
  const mountRef = useRef(null);
  const cubeRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const rollStateRef = useRef({ active: false, target: null, progress: 0, dir: null });

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);

    const faceSymbols = faces || ['rock', 'rock', 'paper', 'paper', 'scissors', 'scissors'];

    // Three.js BoxGeometry face order: +x, -x, +y, -y, +z, -z
    // Our: [top(0), bottom(1), front(2), back(3), left(4), right(5)]
    // Mapping to THREE: right(+x)=5, left(-x)=4, top(+y)=0, bottom(-y)=1, front(+z)=2, back(-z)=3
    const mats = [
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[5]), getFaceBgColor(faceSymbols, 5)) }),
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[4]), getFaceBgColor(faceSymbols, 4)) }),
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[0]), getFaceBgColor(faceSymbols, 0)) }),
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[1]), getFaceBgColor(faceSymbols, 1)) }),
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[2]), getFaceBgColor(faceSymbols, 2)) }),
      new THREE.MeshPhongMaterial({ map: createTextTexture(getSymbol(faceSymbols[3]), getFaceBgColor(faceSymbols, 3)) }),
    ];

    const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const cube = new THREE.Mesh(geometry, mats);
    // Slight tilt to show 3D depth
    cube.rotation.x = 0.3;
    cube.rotation.y = 0.5;
    scene.add(cube);
    cubeRef.current = cube;
    rendererRef.current = renderer;

    let rotX = 0.3;
let rotY = 0.5;

cube.rotation.x = rotX;
cube.rotation.y = rotY;

const animate = () => {
  animRef.current = requestAnimationFrame(animate);
  const rs = rollStateRef.current;

  if (spinning) {
    rotX += 0.03;
    rotY += 0.04;
    cube.rotation.x = rotX;
    cube.rotation.y = rotY;
  }

  else if (rs.active) {

  rs.progress += 0.08;

  const t = Math.min(rs.progress, 1);
  const angle = t * (Math.PI / 2);

  let x = rotX;
  let y = rotY;

  if (rs.dir === 'up') x = rotX - angle;
  if (rs.dir === 'down') x = rotX + angle;
  if (rs.dir === 'left') y = rotY - angle;
  if (rs.dir === 'right') y = rotY + angle;

  cube.rotation.x = x;
  cube.rotation.y = y;

  if (t >= 1) {

    if (rs.dir === 'up') rotX -= Math.PI / 2;
    if (rs.dir === 'down') rotX += Math.PI / 2;
    if (rs.dir === 'left') rotY -= Math.PI / 2;
    if (rs.dir === 'right') rotY += Math.PI / 2;

    cube.rotation.x = rotX;
    cube.rotation.y = rotY;

    rs.active = false;

    if (rs.onComplete) rs.onComplete();
  }
}

  renderer.render(scene, camera);
};

animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (el && el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      mats.forEach(m => { m.map?.dispose(); m.dispose(); });
    };
  }, [faces, spinning, size]);

  // Trigger roll animation
  useEffect(() => {
    if (rolling && rollDir) {
      rollStateRef.current = {
        active: true,
        progress: 0,
        dir: rollDir,
        onComplete: onRollComplete,
      };
    }
  }, [rolling, rollDir]);

  return (
    <div
      ref={mountRef}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}