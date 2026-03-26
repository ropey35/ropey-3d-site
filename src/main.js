import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const app = document.querySelector('#app')

// --------------------------------------------------
// Scene / camera / renderer
// --------------------------------------------------
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x081a2f, 60, 560)

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  760
)
camera.position.set(0, 12.8, 31)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.domElement.classList.add('webgl')
app.prepend(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 10
controls.maxDistance = 280
controls.maxPolarAngle = Math.PI / 2.05
controls.target.set(0, 3.4, 0)

const gltfLoader = new GLTFLoader()

function loadGLBModel(
  url,
  {
    parent = scene,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    onLoad = null,
  } = {}
) {
  gltfLoader.load(
    url,
    (gltf) => {
      const model = gltf.scene

      model.position.set(...position)
      model.rotation.set(...rotation)
      model.scale.set(...scale)

      model.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false
          child.castShadow = false
          child.receiveShadow = false
        }
      })

      parent.add(model)

      if (typeof onLoad === 'function') {
        onLoad(model)
      }

      console.log('GLB loaded successfully:', url, model)
    },
    undefined,
    (error) => {
      console.error('Error loading GLB:', url, error)
    }
  )
}

// --------------------------------------------------
// Lighting
// --------------------------------------------------
const hemiLight = new THREE.HemisphereLight(0xc9f7ff, 0x0b1d2b, 1.8)
scene.add(hemiLight)

const moonLight = new THREE.DirectionalLight(0xb8dfff, 2.0)
moonLight.position.set(10, 13, 7)
scene.add(moonLight)

const greenFill = new THREE.DirectionalLight(0x58ffd0, 0.35)
greenFill.position.set(-8, 5, -8)
scene.add(greenFill)

// --------------------------------------------------
// Star fields
// --------------------------------------------------
function makeStarField(count, spread, size, opacity) {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * spread
    positions[i * 3 + 1] = (Math.random() - 0.15) * spread * 0.68
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  return new THREE.Points(geometry, material)
}

const starsFar = makeStarField(2200, 420, 0.18, 0.96)
const starsNear = makeStarField(950, 280, 0.28, 0.88)

scene.add(starsFar)
scene.add(starsNear)

// --------------------------------------------------
// Sparkle dust
// --------------------------------------------------
function makeDustField(count, spreadX, spreadY, spreadZ) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX
    positions[i * 3 + 1] = (Math.random() - 0.25) * spreadY
    positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ

    const isBlue = Math.random() > 0.42

    if (isBlue) {
      colors[i * 3 + 0] = 0.55
      colors[i * 3 + 1] = 0.85
      colors[i * 3 + 2] = 1.0
    } else {
      colors[i * 3 + 0] = 1.0
      colors[i * 3 + 1] = 0.9
      colors[i * 3 + 2] = 0.48
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.24,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  return new THREE.Points(geometry, material)
}

const dustFieldA = makeDustField(360, 160, 90, 160)
const dustFieldB = makeDustField(220, 110, 65, 120)

scene.add(dustFieldA)
scene.add(dustFieldB)

// --------------------------------------------------
// Clouds
// --------------------------------------------------
const clouds = new THREE.Group()
scene.add(clouds)

function makeCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group()

  const material = new THREE.MeshStandardMaterial({
    color: 0xeaf7ff,
    transparent: true,
    opacity: 0.82,
  })

  const a = new THREE.Mesh(
    new THREE.SphereGeometry(0.9 * scale, 20, 20),
    material
  )
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.62 * scale, 20, 20),
    material
  )
  const c = new THREE.Mesh(
    new THREE.SphereGeometry(0.55 * scale, 20, 20),
    material
  )

  a.position.set(0, 0, 0)
  b.position.set(0.72 * scale, 0.08 * scale, 0.08 * scale)
  c.position.set(-0.66 * scale, 0.04 * scale, 0)

  cloud.add(a, b, c)
  cloud.position.set(x, y, z)
  clouds.add(cloud)

  return cloud
}

makeCloud(-20, 13, -22, 1.9)
makeCloud(16, 10, -14, 1.3)
makeCloud(7, 17, -34, 2.2)
makeCloud(-10, 7, -40, 1.1)
makeCloud(24, 16, -24, 1.35)
makeCloud(-28, 18, -12, 1.1)
makeCloud(30, 8, -44, 0.95)
makeCloud(-34, 10, -30, 1.25)
makeCloud(5, 21, -58, 1.5)
makeCloud(-2, 15, 8, 0.9)
makeCloud(38, 14, -34, 1.25)
makeCloud(-42, 16, -26, 1.4)
makeCloud(12, 22, -70, 1.1)
makeCloud(-16, 20, -62, 1.25)
makeCloud(40, 9, -16, 0.9)
makeCloud(-38, 11, -8, 0.95)
makeCloud(18, 6, -8, 0.8)
makeCloud(-8, 24, -80, 1.3)

// --------------------------------------------------
// Custom cloud placeholders
// --------------------------------------------------
const customCloudAnchors = []

function makeCustomCloudPlaceholder(x, y, z, scale = 1) {
  const group = new THREE.Group()

  const blobMaterial = new THREE.MeshStandardMaterial({
    color: 0x82f3ff,
    emissive: 0x82f3ff,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.16,
  })

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xbffcff,
    transparent: true,
    opacity: 0.22,
  })

  const a = new THREE.Mesh(
    new THREE.SphereGeometry(0.8 * scale, 18, 18),
    blobMaterial
  )
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.55 * scale, 18, 18),
    blobMaterial
  )
  const c = new THREE.Mesh(
    new THREE.SphereGeometry(0.48 * scale, 18, 18),
    blobMaterial
  )

  a.position.set(0, 0, 0)
  b.position.set(0.58 * scale, 0.06 * scale, 0)
  c.position.set(-0.52 * scale, 0.04 * scale, 0)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.05 * scale, 0.03 * scale, 12, 40),
    ringMaterial
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = -0.18 * scale

  group.add(a, b, c, ring)
  group.position.set(x, y, z)
  group.userData.baseY = y
  group.userData.floatOffset = Math.random() * Math.PI * 2

  customCloudAnchors.push(group)
  scene.add(group)
}

makeCustomCloudPlaceholder(-8, 11, 8, 1.0)
makeCustomCloudPlaceholder(10, 14, 2, 1.2)
makeCustomCloudPlaceholder(24, 9, -10, 0.9)
makeCustomCloudPlaceholder(-22, 15, -18, 1.1)
makeCustomCloudPlaceholder(32, 13, -2, 0.85)
makeCustomCloudPlaceholder(-30, 12, 2, 0.95)
makeCustomCloudPlaceholder(42, 11, -18, 0.9)
makeCustomCloudPlaceholder(-44, 14, -20, 1.05)
makeCustomCloudPlaceholder(14, 19, -44, 0.82)
makeCustomCloudPlaceholder(-12, 18, -50, 0.88)

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const floatingGroups = []
const orbitSparkleSystems = []

function configureBrightTitleMaterial(material) {
  if (!material) return material

  const mat = material.clone()

  if ('emissive' in mat && mat.emissive) {
    mat.emissive = new THREE.Color(0xaeefff)
    mat.emissiveIntensity = 0.18
  }

  if ('roughness' in mat && typeof mat.roughness === 'number') {
    mat.roughness = Math.min(mat.roughness, 0.55)
  }

  if ('metalness' in mat && typeof mat.metalness === 'number') {
    mat.metalness = Math.min(mat.metalness, 0.12)
  }

  mat.toneMapped = true
  mat.needsUpdate = true

  return mat
}

function brightenTitleModel(root) {
  root.traverse((child) => {
    if (!child.isMesh) return

    child.frustumCulled = false
    child.renderOrder = 10

    if (Array.isArray(child.material)) {
      child.material = child.material.map(configureBrightTitleMaterial)
    } else {
      child.material = configureBrightTitleMaterial(child.material)
    }
  })
}

function makeTree(parent, x, z, scale = 1, leafColor = 0x4e8d47) {
  const tree = new THREE.Group()

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.13 * scale, 0.9 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b3f26 })
  )
  trunk.position.y = 2.15 * scale
  tree.add(trunk)

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.36 * scale, 18, 18),
    new THREE.MeshStandardMaterial({ color: leafColor })
  )
  leaves.position.y = 2.62 * scale
  tree.add(leaves)

  tree.position.set(x, 0, z)
  parent.add(tree)
}

function makePalm(parent, x, z, scale = 1, leafColor = 0x43a567) {
  const palm = new THREE.Group()

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05 * scale, 0.09 * scale, 1.2 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x7b5436 })
  )
  trunk.position.y = 2.05 * scale
  trunk.rotation.z = 0.12
  palm.add(trunk)

  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * scale, 0.02 * scale, 0.7 * scale),
      new THREE.MeshStandardMaterial({ color: leafColor })
    )
    leaf.position.y = 2.72 * scale
    leaf.rotation.y = (Math.PI * 2 * i) / 5
    leaf.rotation.x = -0.35
    leaf.position.x = Math.cos((Math.PI * 2 * i) / 5) * 0.16 * scale
    leaf.position.z = Math.sin((Math.PI * 2 * i) / 5) * 0.16 * scale
    palm.add(leaf)
  }

  palm.position.set(x, 0, z)
  parent.add(palm)
}

function makeCrystal(parent, x, y, z, color = 0xbfe9ff, scale = 1) {
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22 * scale, 0),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.18,
      roughness: 0.2,
      metalness: 0.15,
    })
  )
  crystal.position.set(x, y, z)
  parent.add(crystal)
}

function makeMistCluster(parent, x, y, z, scale = 1, count = 4) {
  const mist = new THREE.Group()

  for (let i = 0; i < count; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry((0.55 + Math.random() * 0.25) * scale, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xdffcff,
        emissive: 0xb8f2ff,
        emissiveIntensity: 0.02,
        transparent: true,
        opacity: 0.12,
      })
    )

    puff.position.set(
      (Math.random() - 0.5) * 1.5 * scale,
      (Math.random() - 0.3) * 0.5 * scale,
      (Math.random() - 0.5) * 1.5 * scale
    )

    mist.add(puff)
  }

  mist.position.set(x, y, z)
  parent.add(mist)
}

function makeOrbitSparkles(
  parent,
  {
    anchor = [0, 2, 0],
    count = 10,
    radiusMin = 0.3,
    radiusMax = 1.1,
    height = 0.28,
    speed = 1,
  } = {}
) {
  const systemGroup = new THREE.Group()
  systemGroup.position.set(...anchor)
  parent.add(systemGroup)

  const sparkles = []

  for (let i = 0; i < count; i++) {
    const hueChoice = Math.random()
    let color = 0x9fe7ff

    if (hueChoice < 0.33) color = 0x9fe7ff
    else if (hueChoice < 0.66) color = 0xffe98b
    else color = 0xb8fff0

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.035, 10, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
      })
    )

    systemGroup.add(mesh)

    sparkles.push({
      mesh,
      angle: Math.random() * Math.PI * 2,
      radius: THREE.MathUtils.lerp(radiusMin, radiusMax, Math.random()),
      yBase: (Math.random() - 0.5) * height,
      yAmp: 0.03 + Math.random() * 0.12,
      speed: speed * (0.55 + Math.random() * 1.2),
      zSquash: 0.7 + Math.random() * 0.45,
      pulse: Math.random() * Math.PI * 2,
      scaleBase: 0.7 + Math.random() * 0.85,
    })
  }

  orbitSparkleSystems.push({
    group: systemGroup,
    sparkles,
    phase: Math.random() * Math.PI * 2,
  })
}

// --------------------------------------------------
// Floating island placeholders
// --------------------------------------------------
function makeIsland({
  position = [0, 0, 0],
  scale = 1,
  topColor = 0x79b564,
  bottomColor = 0x486f45,
  accentColor = 0xd7c6a0,
  towerRoof = 0xa95a7b,
  type = 'hero',
}) {
  const island = new THREE.Group()
  island.position.set(...position)
  island.scale.setScalar(scale)
  island.userData.baseY = position[1]
  island.userData.baseRotY = 0
  island.userData.floatSpeed = 0.7 + Math.random() * 0.3
  island.userData.floatAmount = 0.14 + Math.random() * 0.08
  floatingGroups.push(island)

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.0, 1.1, 44),
    new THREE.MeshStandardMaterial({ color: topColor })
  )
  top.position.y = 1.4
  island.add(top)

  const underside = new THREE.Mesh(
    new THREE.ConeGeometry(2.8, 4.6, 30),
    new THREE.MeshStandardMaterial({ color: bottomColor })
  )
  underside.rotation.z = Math.PI
  underside.position.y = -1.5
  island.add(underside)

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.08, 2.2),
    new THREE.MeshStandardMaterial({ color: accentColor })
  )
  path.position.set(0.2, 1.98, 0.55)
  island.add(path)

  if (type === 'hero') {
    makeTree(island, -1.2, -0.5, 1.05)
    makeTree(island, 1.1, -0.45, 0.95)
    makeTree(island, -0.2, 0.95, 0.85)

    const towerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x8f6b47 })
    )
    towerBase.position.set(-0.55, 2.18, 0.15)
    island.add(towerBase)

    const towerRoofMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: towerRoof })
    )
    towerRoofMesh.position.set(-0.55, 3.05, 0.15)
    island.add(towerRoofMesh)

    makeCrystal(island, 0.8, 1.92, -0.9, 0xc8f0ff, 1)
    makeCrystal(island, 1.05, 2.05, -0.55, 0xaee6ff, 0.85)
    makeMistCluster(island, 1.2, 2.0, 1.0, 0.8, 3)
  }

  if (type === 'about') {
    makeTree(island, -1.0, -0.2, 0.95, 0x5e9b59)
    makeTree(island, 0.8, -0.7, 0.8, 0x6baa60)

    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.12, 16, 48),
      new THREE.MeshStandardMaterial({
        color: 0xf7d9ff,
        emissive: 0xf7d9ff,
        emissiveIntensity: 0.18,
      })
    )
    arch.rotation.x = Math.PI / 2
    arch.position.set(0, 2.35, -0.15)
    island.add(arch)

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.52, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: 0xc9b6d6 })
    )
    pedestal.position.set(0, 1.95, -0.15)
    island.add(pedestal)
  }

  scene.add(island)
  return island
}

// --------------------------------------------------
// Planet map placeholder
// --------------------------------------------------
function makePlanetMap({
  position = [0, -84, -146],
  radius = 24,
}) {
  const world = new THREE.Group()
  world.position.set(...position)

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0x215c49,
      roughness: 1,
      metalness: 0,
    })
  )
  world.add(planet)

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.045, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x6fffe0,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  world.add(atmosphere)

  const echoGarden = new THREE.Group()
  echoGarden.position.set(0, radius + 0.3, 0)
  echoGarden.rotation.x = -0.16
  world.add(echoGarden)

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(8.6, 7.8, 0.7, 42),
    new THREE.MeshStandardMaterial({
      color: 0x2f8b63,
      roughness: 1,
    })
  )
  ground.position.y = 0.2
  echoGarden.add(ground)

  const lagoon = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 1.7, 0.06, 28),
    new THREE.MeshStandardMaterial({
      color: 0x79e8ff,
      emissive: 0x2fd8ff,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.92,
    })
  )
  lagoon.position.set(-1.2, 0.42, 0.8)
  echoGarden.add(lagoon)

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2
    const radiusFromCenter = 0.8 + Math.random() * 5.1
    const x = Math.cos(angle) * radiusFromCenter
    const z = Math.sin(angle) * radiusFromCenter

    if (Math.random() > 0.42) {
      makePalm(echoGarden, x, z, 0.75 + Math.random() * 0.35, 0x46b974)
    } else {
      makeTree(echoGarden, x, z, 0.62 + Math.random() * 0.3, 0x2f8f59)
    }
  }

  for (let i = 0; i < 10; i++) {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(0.45 + Math.random() * 0.45, 0.8 + Math.random() * 0.6, 10),
      new THREE.MeshStandardMaterial({ color: 0x397a50 })
    )

    const angle = Math.random() * Math.PI * 2
    const radiusFromCenter = 1.2 + Math.random() * 4.4
    hill.position.set(
      Math.cos(angle) * radiusFromCenter,
      0.65,
      Math.sin(angle) * radiusFromCenter
    )
    echoGarden.add(hill)
  }

  const markerA = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.85, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd86b,
      emissive: 0xffd86b,
      emissiveIntensity: 0.18,
    })
  )
  markerA.position.set(-2.2, 0.95, -1.5)
  echoGarden.add(markerA)

  const markerB = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.85, 8),
    new THREE.MeshStandardMaterial({
      color: 0x86eaff,
      emissive: 0x86eaff,
      emissiveIntensity: 0.18,
    })
  )
  markerB.position.set(2.4, 0.95, 1.1)
  echoGarden.add(markerB)

  const markerC = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.85, 8),
    new THREE.MeshStandardMaterial({
      color: 0xb3ff9a,
      emissive: 0xb3ff9a,
      emissiveIntensity: 0.18,
    })
  )
  markerC.position.set(0.6, 0.95, 2.9)
  echoGarden.add(markerC)

  makeMistCluster(echoGarden, -2.8, 0.9, -1.8, 1.8, 7)
  makeMistCluster(echoGarden, 2.5, 0.9, 1.5, 1.5, 6)
  makeMistCluster(echoGarden, 0.2, 1.15, -0.5, 2.0, 8)
  makeMistCluster(echoGarden, -0.8, 0.95, 2.2, 1.6, 6)

  for (let i = 0; i < 12; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(1.2 + Math.random() * 0.9, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xdffcff,
        transparent: true,
        opacity: 0.08,
      })
    )

    const a = Math.random() * Math.PI * 2
    const b = Math.random() * 0.9 + 0.25
    const r = radius * 1.02

    puff.position.set(
      Math.cos(a) * Math.sin(b) * r,
      Math.cos(b) * r,
      Math.sin(a) * Math.sin(b) * r
    )

    puff.scale.setScalar(1 + Math.random() * 0.6)
    world.add(puff)
  }

  scene.add(world)

  return {
    world,
    echoGarden,
    topTarget: new THREE.Vector3(position[0], position[1] + radius + 0.6, position[2]),
  }
}

// --------------------------------------------------
// Create scene placeholders / models
// --------------------------------------------------
const heroIsland = new THREE.Group()
heroIsland.position.set(0, 0, 0)
heroIsland.userData.baseY = 0
heroIsland.userData.baseRotY = 0
heroIsland.userData.floatSpeed = 0.78
heroIsland.userData.floatAmount = 0.16
floatingGroups.push(heroIsland)
scene.add(heroIsland)

loadGLBModel('/models/hero-island-002.glb', {
  parent: heroIsland,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [4, 4, 4],
})

const heroTitle = new THREE.Group()
heroTitle.position.set(0, 13.2, 8)
heroTitle.userData.floatPhase = Math.random() * Math.PI * 2
scene.add(heroTitle)

const titleGlowLight = new THREE.PointLight(0xd9faff, 1.6, 22, 2)
titleGlowLight.position.set(0, 0.5, 6.4)
heroTitle.add(titleGlowLight)

loadGLBModel('/models/header-logo-01.glb', {
  parent: heroTitle,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [3, 3, 3],
  onLoad: (model) => {
    brightenTitleModel(model)
  },
})

const aboutIsland = makeIsland({
  position: [28, 4.5, -20],
  scale: 1.25,
  topColor: 0x5faa73,
  bottomColor: 0x2d5f50,
  accentColor: 0xdcc7e3,
  type: 'about',
})

const contactCloud = new THREE.Group()
contactCloud.position.set(-30, 8, -32)
contactCloud.userData.baseY = 8
contactCloud.userData.baseRotY = 0
contactCloud.userData.floatSpeed = 0.62
contactCloud.userData.floatAmount = 0.18
floatingGroups.push(contactCloud)
scene.add(contactCloud)

loadGLBModel('/models/contact-cloud-01.glb', {
  parent: contactCloud,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [4, 4, 4],
})

const MAP_CENTER = new THREE.Vector3(0, -188, -360)
const MAP_RADIUS = 58

const planetMap = makePlanetMap({
  position: [MAP_CENTER.x, MAP_CENTER.y, MAP_CENTER.z],
  radius: MAP_RADIUS,
})

// --------------------------------------------------
// Local sparkle swirls
// --------------------------------------------------
makeOrbitSparkles(heroIsland, {
  anchor: [0.8, 2.35, -0.65],
  count: 16,
  radiusMin: 0.22,
  radiusMax: 0.8,
  height: 0.28,
  speed: 1.12,
})

makeOrbitSparkles(heroIsland, {
  anchor: [1.25, 2.05, 0.95],
  count: 14,
  radiusMin: 0.28,
  radiusMax: 0.96,
  height: 0.26,
  speed: 0.94,
})

makeOrbitSparkles(heroIsland, {
  anchor: [-0.45, 2.3, 0.25],
  count: 13,
  radiusMin: 0.35,
  radiusMax: 1.15,
  height: 0.34,
  speed: 0.82,
})

makeOrbitSparkles(aboutIsland, {
  anchor: [0, 2.25, -0.15],
  count: 13,
  radiusMin: 0.26,
  radiusMax: 0.86,
  height: 0.26,
  speed: 0.98,
})

makeOrbitSparkles(aboutIsland, {
  anchor: [-0.55, 2.05, 0.55],
  count: 10,
  radiusMin: 0.22,
  radiusMax: 0.72,
  height: 0.22,
  speed: 0.9,
})

makeOrbitSparkles(contactCloud, {
  anchor: [0, 2.65, 0],
  count: 18,
  radiusMin: 0.35,
  radiusMax: 1.18,
  height: 0.38,
  speed: 1.2,
})

makeOrbitSparkles(contactCloud, {
  anchor: [0, 1.7, 0.1],
  count: 12,
  radiusMin: 0.55,
  radiusMax: 1.55,
  height: 0.3,
  speed: 0.82,
})

makeOrbitSparkles(contactCloud, {
  anchor: [0.18, 2.18, -0.1],
  count: 10,
  radiusMin: 0.22,
  radiusMax: 0.62,
  height: 0.22,
  speed: 1.35,
})

makeOrbitSparkles(planetMap.echoGarden, {
  anchor: [0.4, 1.2, -0.2],
  count: 16,
  radiusMin: 1.1,
  radiusMax: 3.1,
  height: 0.42,
  speed: 0.52,
})

makeOrbitSparkles(planetMap.echoGarden, {
  anchor: [-1.4, 1.05, 0.85],
  count: 12,
  radiusMin: 0.7,
  radiusMax: 1.9,
  height: 0.32,
  speed: 0.62,
})

// --------------------------------------------------
// Camera views
// --------------------------------------------------
const VIEWS = {
  hero: {
    camera: [0, 12.8, 31],
    target: [0, 3.4, 0],
  },
  about: {
    camera: [29.5, 10.3, -4.2],
    target: [28, 5.0, -20],
  },
  contact: {
    camera: [-30, 12.15, -11.15],
    target: [-30, 10.5, -32],
  },
  map: {
    camera: [0, -118, -246],
    target: [0, -134, -338],
  },
}

const desiredCameraPosition = new THREE.Vector3(...VIEWS.hero.camera)
const desiredTarget = new THREE.Vector3(...VIEWS.hero.target)

let activeViewName = 'hero'
let flight = null

const flightCameraPoint = new THREE.Vector3()
const flightTargetPoint = new THREE.Vector3()
const idleCamera = new THREE.Vector3()
const idleTarget = new THREE.Vector3()
const titleAnchor = new THREE.Vector3()
const titleForward = new THREE.Vector3()
const titleRight = new THREE.Vector3()
const titleUp = new THREE.Vector3()

function smootherStep(x) {
  const clamped = THREE.MathUtils.clamp(x, 0, 1)
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10)
}

function cinematicEase(x) {
  return smootherStep(Math.pow(THREE.MathUtils.clamp(x, 0, 1), 1.22))
}

function buildDirectMapFlight(startCam, startTarget, endCam, endTarget) {
  const distance = startCam.distanceTo(endCam)
  const startForward = startTarget.clone().sub(startCam).normalize()
  const directDir = endCam.clone().sub(startCam).normalize()

  const islandClusterCenter = new THREE.Vector3(0, 6.2, -18)
  const openingDir = startForward.clone().lerp(directDir, 0.84).normalize()

  const lift = THREE.MathUtils.clamp(distance * 0.082, 8, 22)
  const initialPush = THREE.MathUtils.clamp(distance * 0.08, 6, 12)

  const camP1 = startCam.clone().add(openingDir.clone().multiplyScalar(initialPush))
  camP1.y += lift * 0.06

  const camP2 = startCam.clone().lerp(endCam, 0.3)
  camP2.y += lift * 0.34

  const camP3 = startCam.clone().lerp(endCam, 0.62)
  camP3.y += lift * 0.14

  const camP4 = startCam.clone().lerp(endCam, 0.86)
  camP4.y += lift * 0.03

  const camPath = new THREE.CatmullRomCurve3(
    [startCam.clone(), camP1, camP2, camP3, camP4, endCam.clone()],
    false,
    'centripetal',
    0.5
  )

  const targetP1 = startTarget.clone().lerp(islandClusterCenter, 0.9)
  const targetP2 = islandClusterCenter.clone().lerp(endTarget, 0.18)
  const targetP3 = islandClusterCenter.clone().lerp(endTarget, 0.5)
  const targetP4 = islandClusterCenter.clone().lerp(endTarget, 0.84)

  const targetPath = new THREE.CatmullRomCurve3(
    [
      startTarget.clone(),
      targetP1,
      targetP2,
      targetP3,
      targetP4,
      endTarget.clone(),
    ],
    false,
    'centripetal',
    0.5
  )

  const duration = THREE.MathUtils.clamp(distance * 18.5, 5600, 8200)

  return {
    camPath,
    targetPath,
    duration,
    endCam: endCam.clone(),
    endTarget: endTarget.clone(),
  }
}

function startFlight(viewName) {
  const view = VIEWS[viewName]
  if (!view) return

  activeViewName = viewName

  if (viewName === 'map') {
    controls.enabled = false
    controls.enableDamping = false

    const startCam = camera.position.clone()
    const startTarget = controls.target.clone()
    const endCam = new THREE.Vector3(...view.camera)
    const endTarget = new THREE.Vector3(...view.target)

    const mapFlight = buildDirectMapFlight(startCam, startTarget, endCam, endTarget)

    flight = {
      type: 'map',
      startTime: performance.now(),
      ...mapFlight,
    }

    return
  }

  flight = null
  controls.enabled = true
  controls.enableDamping = true
  desiredCameraPosition.set(...view.camera)
  desiredTarget.set(...view.target)
}

document.querySelectorAll('#ui button').forEach((button) => {
  button.addEventListener('click', () => {
    startFlight(button.dataset.view)
  })
})

// --------------------------------------------------
// Animate
// --------------------------------------------------
const clock = new THREE.Clock()

function animate() {
  const t = clock.getElapsedTime()

  floatingGroups.forEach((group, index) => {
    group.position.y =
      group.userData.baseY +
      Math.sin(t * group.userData.floatSpeed + index * 0.9) * group.userData.floatAmount

    group.rotation.y =
      group.userData.baseRotY +
      Math.sin(t * 0.22 + index * 0.7) * 0.07
  })

  customCloudAnchors.forEach((cloud, index) => {
    cloud.position.y =
      cloud.userData.baseY +
      Math.sin(t * 0.9 + cloud.userData.floatOffset + index) * 0.18

    const pulse = 1 + Math.sin(t * 1.4 + index) * 0.04
    cloud.scale.setScalar(pulse)
  })

  orbitSparkleSystems.forEach((system, systemIndex) => {
    const systemTime = t + system.phase + systemIndex * 0.37

    system.sparkles.forEach((sparkle, i) => {
      const angle = systemTime * sparkle.speed + sparkle.angle
      const x = Math.cos(angle) * sparkle.radius
      const z = Math.sin(angle) * sparkle.radius * sparkle.zSquash
      const y = sparkle.yBase + Math.sin(angle * 1.8 + sparkle.pulse) * sparkle.yAmp

      sparkle.mesh.position.set(x, y, z)

      const pulse = 0.72 + Math.sin(systemTime * 3 + sparkle.pulse + i) * 0.28
      const scale = sparkle.scaleBase * pulse
      sparkle.mesh.scale.setScalar(scale)
      sparkle.mesh.material.opacity = 0.55 + pulse * 0.45
    })
  })

  if (planetMap?.world) {
    planetMap.world.rotation.y += 0.00048
  }

  clouds.rotation.y = t * 0.012
  starsFar.rotation.y = t * 0.0022
  starsNear.rotation.y = -t * 0.0033
  dustFieldA.rotation.y = t * 0.013
  dustFieldB.rotation.y = -t * 0.017
  dustFieldB.position.y = Math.sin(t * 0.7) * 1.2

  if (flight) {
    const elapsed = (performance.now() - flight.startTime) / flight.duration
    const p = Math.min(elapsed, 1)
    const eased = cinematicEase(p)

    flight.camPath.getPointAt(eased, flightCameraPoint)
    flight.targetPath.getPointAt(eased, flightTargetPoint)

    const glideLift = Math.sin(eased * Math.PI) * 0.14

    camera.position.copy(flightCameraPoint)
    camera.position.y += glideLift

    controls.target.copy(flightTargetPoint)
    controls.target.y += glideLift * 0.18

    if (p >= 1) {
      desiredCameraPosition.copy(flight.endCam)
      desiredTarget.copy(flight.endTarget)
      controls.enabled = true
      controls.enableDamping = true
      flight = null
    }
  } else {
    idleCamera.copy(desiredCameraPosition)
    idleTarget.copy(desiredTarget)

    if (activeViewName === 'hero') {
      idleCamera.y += Math.sin(t * 0.2) * 0.12
      idleCamera.z += Math.sin(t * 0.14) * 0.35
      idleTarget.y += Math.sin(t * 0.18 + 0.7) * 0.08
    }

    if (activeViewName === 'about') {
      idleCamera.x += Math.sin(t * 0.16) * 0.2
      idleCamera.y += Math.sin(t * 0.22) * 0.1
      idleCamera.z += Math.sin(t * 0.14) * 0.28
    }

    if (activeViewName === 'contact') {
      idleCamera.x += Math.sin(t * 0.15) * 0.24
      idleCamera.y += Math.sin(t * 0.21 + 0.8) * 0.12
      idleCamera.z += Math.sin(t * 0.13) * 0.32
      idleTarget.y += Math.sin(t * 0.24) * 0.08
    }

    if (activeViewName === 'map') {
      const driftX = Math.sin(t * 0.16) * 0.32
      const driftY = Math.sin(t * 0.21 + 0.8) * 0.26
      const driftZ = Math.sin(t * 0.13) * 0.55

      idleCamera.x += driftX
      idleCamera.y += driftY
      idleCamera.z += driftZ

      idleTarget.x += driftX * 0.22
      idleTarget.y += driftY * 0.45
      idleTarget.z += driftZ * 0.12
    }

    camera.position.lerp(idleCamera, 0.028)
    controls.target.lerp(idleTarget, 0.042)
  }

  controls.update()

  if (heroTitle) {
    titleForward.subVectors(controls.target, camera.position).normalize()
    titleRight.crossVectors(titleForward, camera.up).normalize()
    titleUp.crossVectors(titleRight, titleForward).normalize()

    const titleDistance = activeViewName === 'map' ? 19 : 15.5
    const titleLift = activeViewName === 'map' ? 6.4 : 4.8

    titleAnchor.copy(camera.position)
    titleAnchor.addScaledVector(titleForward, titleDistance)
    titleAnchor.addScaledVector(titleUp, titleLift)

    titleAnchor.x += Math.sin(t * 0.22) * 0.12
    titleAnchor.y += Math.sin(t * 0.42 + 1.3) * 0.08
    titleAnchor.z += Math.cos(t * 0.18) * 0.1

    heroTitle.position.lerp(titleAnchor, flight ? 0.12 : 0.09)

    const titlePulse = 1 + Math.sin(t * 0.9 + heroTitle.userData.floatPhase) * 0.018
    heroTitle.scale.setScalar(titlePulse)

    heroTitle.lookAt(camera.position)

    titleGlowLight.intensity =
      1.6 + Math.sin(t * 1.4 + heroTitle.userData.floatPhase) * 0.12
  }

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

// --------------------------------------------------
// Resize
// --------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})