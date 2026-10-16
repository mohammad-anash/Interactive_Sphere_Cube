import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

// --------------------------------------------------
// Canvas
// --------------------------------------------------

const canvas = document.querySelector('.webgl');

// --------------------------------------------------
// Screen Size
// --------------------------------------------------

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// --------------------------------------------------
// Scene
// --------------------------------------------------

const scene = new THREE.Scene();

// --------------------------------------------------
// Sphere Cube Settings
// --------------------------------------------------

const sphereSize = 10;
const spacing = 0.5;

const count = sphereSize * sphereSize * sphereSize;

// --------------------------------------------------
// Debug Object
// --------------------------------------------------

const debugObject = {
  count: count,
};

// --------------------------------------------------
// LIL - GUI
// --------------------------------------------------

const gui = new GUI();

// We'll connect this to spheres.count
const countController = gui
  .add(debugObject, 'count', 0, count, 1)
  .name('count');

// --------------------------------------------------
// Sphere Geometry
// --------------------------------------------------

const sphereGeometry = new THREE.SphereGeometry(0.25, 16, 16);

// --------------------------------------------------
// Sphere Material
// --------------------------------------------------

const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

// --------------------------------------------------
// Instanced Mesh
// --------------------------------------------------

const spheres = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, count);

scene.add(spheres);

// --------------------------------------------------
// GUI - Change Visible Sphere Count
// --------------------------------------------------

countController.onChange((value) => {
  spheres.count = value;
});

// --------------------------------------------------
// Position Spheres
// --------------------------------------------------

const matrix = new THREE.Matrix4();

for (let x = 0; x < sphereSize; x++) {
  for (let y = 0; y < sphereSize; y++) {
    for (let z = 0; z < sphereSize; z++) {
      matrix.setPosition(
        (x - (sphereSize - 1) / 2) * spacing,

        (y - (sphereSize - 1) / 2) * spacing,

        (z - (sphereSize - 1) / 2) * spacing,
      );

      const index = x + y * sphereSize + z * sphereSize * sphereSize;

      spheres.setMatrixAt(index, matrix);
    }
  }
}

spheres.instanceMatrix.needsUpdate = true;

// --------------------------------------------------
// Initialize All Spheres as White
// --------------------------------------------------

const color = new THREE.Color(0xffffff);

for (let i = 0; i < count; i++) {
  spheres.setColorAt(i, color);
}

spheres.instanceColor.needsUpdate = true;

// --------------------------------------------------
// Camera
// --------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.1,
  100,
);

camera.position.set(5, 5, 5);
scene.add(camera);

// --------------------------------------------------
// Orbit Controls
// --------------------------------------------------

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// --------------------------------------------------
// Raycaster
// --------------------------------------------------

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2(2, 2);

// --------------------------------------------------
// Mouse Movement
// --------------------------------------------------

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / size.width) * 2 - 1;

  mouse.y = -(event.clientY / size.height) * 2 + 1;
});

// --------------------------------------------------
// Remember Colored Spheres
// --------------------------------------------------
const coloredInstances = new Set();

// --------------------------------------------------
// Renderer
// --------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --------------------------------------------------
// Resize
// --------------------------------------------------

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --------------------------------------------------
// Animation Loop
// --------------------------------------------------

const tick = () => {
  // Update OrbitControls
  controls.update();

  // Create ray from mouse
  raycaster.setFromCamera(mouse, camera);

  // Find objects under mouse
  const intersects = raycaster.intersectObject(spheres);

  // ------------------------------------------------
  // Hover Detection
  // ------------------------------------------------

  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId;

    // Check if this sphere
    // has already been colored
    if (!coloredInstances.has(instanceId)) {
      // Generate vibrant random color
      color.setHSL(Math.random(), 1, 0.5);

      // Apply color
      spheres.setColorAt(instanceId, color);

      // Update GPU
      spheres.instanceColor.needsUpdate = true;

      // Remember this sphere
      coloredInstances.add(instanceId);

      console.log(`Sphere ${instanceId} colored`);
    }
  }

  // ------------------------------------------------
  // Render
  // ------------------------------------------------

  renderer.render(scene, camera);

  // Next frame
  window.requestAnimationFrame(tick);
};

tick();
