import * as THREE from "../build/three.module.js";
import { Water } from "../jsm/objects/Water.js";
import { Sky } from "../jsm/objects/Sky.js";

let scene, camera, renderer, light, water, sphere;
init();
animate();
function init() {
  let container = document.getElementById("container");

  //   initialize renderer

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth / window.innerHeight);
  container.appendChild(renderer.domElement);

  // initialize scene
  scene = new THREE.Scene();

  //   set camera
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  //   configure camera position
  camera.position.set(30, 30, 100);
  //   add light
  light = new THREE.DirectionalLight(0xffffff, 0.8);

  // add water
  let waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
  console.log(waterGeometry);

  //   set water dimensions
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "textures/waternormals.jpg",
      function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    alpha: 1.0,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  });

  water.rotation.x = Math.PI / 2;
  console.log(water);

  scene.add(water);

  console.log(scene);

  //   camera.position.z = 100;

  // Skybox
  var sky = new Sky();
  var uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = 10;
  uniforms["rayleigh"].value = 2;
  uniforms["luminance"].value = 1;
  uniforms["mieCoefficient"].value = 0.005;
  uniforms["mieDirectionalG"].value = 0.8;
  var parameters = {
    distance: 400,
    inclination: 0.49,
    azimuth: 0.205
  };

  const cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
  cubeCamera.renderTarget.texture.generateMipmaps = true;
  cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  scene.background = cubeCamera.renderTarget;

  function updateSun() {
    var theta = Math.PI * (parameters.inclination - 0.5);
    var phi = 2 * Math.PI * (parameters.azimuth - 0.5);
    light.position.x = parameters.distance * Math.cos(phi);
    light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
    light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);
    sky.material.uniforms["sunPosition"].value = light.position.copy(
      light.position
    );
    water.material.uniforms["sunDirection"].value
      .copy(light.position)
      .normalize();
    cubeCamera.update(renderer, sky);
  }
  updateSun();

  var geometry = new THREE.IcosahedronBufferGeometry(20, 1);
  var count = geometry.attributes.position.count;
  var colors = [];
  var color = new THREE.Color();
  for (var i = 0; i < count; i += 3) {
    color.setHex(Math.random() * 0xffffff);
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
  }
  geometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  var material = new THREE.MeshStandardMaterial({
    vertexColors: THREE.VertexColors,
    roughness: 0.0,
    flatShading: true,
    envMap: cubeCamera.renderTarget.texture,
    side: THREE.DoubleSide
  });
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

function animate() {
  // console.log(camera);

  water.material.uniforms["time"].value += 1.0 / 60.0;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// let render = () => {
//   const time = performance.now() * 0.001;
//   water.material.uniforms["time"].value += 1.0 / 60.0;
//   renderer.render(scene, camera);
// };

window.addEventListener("resize", onWindowResize, false);
