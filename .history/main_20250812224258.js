import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 0, 3);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 3, 4);
scene.add(directionalLight);

// Circular instanced dots animation
const ringGroup = new THREE.Group();
scene.add(ringGroup);

const instanceCount = 600;
const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
const dotMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.4,
    vertexColors: true
});
const ring = new THREE.InstancedMesh(dotGeometry, dotMaterial, instanceCount);
ring.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
ringGroup.add(ring);

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

// Overlay line that follows the ring and wiggles slightly
const lineSegments = 400;
const linePositions = new Float32Array(lineSegments * 3);
const lineGeometry = new THREE.BufferGeometry();
const linePositionAttr = new THREE.BufferAttribute(linePositions, 3);
linePositionAttr.setUsage(THREE.DynamicDrawUsage);
lineGeometry.setAttribute('position', linePositionAttr);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.9 });
const line = new THREE.LineLoop(lineGeometry, lineMaterial);
ringGroup.add(line);

function updateRing(timeSeconds) {
    const baseRadius = 1.15;
    for (let i = 0; i < instanceCount; i++) {
        const t = i / instanceCount;
        const angle = t * Math.PI * 2;
        const ripple = Math.sin(angle * 6 + timeSeconds * 2) * 0.15;
        const radius = baseRadius + ripple;

        tempObject.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        const s = 0.75 + 0.25 * (Math.sin(angle * 8 + timeSeconds * 3) * 0.5 + 0.5);
        tempObject.scale.set(s, s, s);
        tempObject.updateMatrix();
        ring.setMatrixAt(i, tempObject.matrix);

        tempColor.setHSL((t + timeSeconds * 0.05) % 1, 0.6, 0.6);
        ring.setColorAt(i, tempColor);
    }
    ring.instanceMatrix.needsUpdate = true;
    if (ring.instanceColor) ring.instanceColor.needsUpdate = true;

    // Update the overlay line positions with a subtle extra wiggle
    for (let i = 0; i < lineSegments; i++) {
        const t = i / lineSegments;
        const angle = t * Math.PI * 2;
        const ripple = Math.sin(angle * 6 + timeSeconds * 2) * 0.15;
        const smallWiggle = Math.sin(angle * 24 + timeSeconds * 5.0) * 0.02;
        const radius = baseRadius + ripple + smallWiggle;
        linePositions[i * 3 + 0] = Math.cos(angle) * radius;
        linePositions[i * 3 + 1] = Math.sin(angle) * radius;
        linePositions[i * 3 + 2] = 0;
    }
    line.geometry.attributes.position.needsUpdate = true;
    
    ringGroup.rotation.z = timeSeconds * 0.25;
}

function resizeRendererToDisplaySize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

function animate() {
    requestAnimationFrame(animate);
    resizeRendererToDisplaySize();
    const time = performance.now() * 0.001;
    updateRing(time);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    resizeRendererToDisplaySize();
});

resizeRendererToDisplaySize();
animate();


