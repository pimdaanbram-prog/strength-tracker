import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Category mapping ────────────────────────────────────────────────────────
const MUSCLE_TO_CATEGORY: Record<string, string> = {
  chest:      'Chest',
  abs:        'Core',
  obliques:   'Core',
  serratus:   'Core',
  shoulders:  'Shoulders',
  biceps:     'Arms - Biceps',
  triceps:    'Arms - Triceps',
  forearms:   'Arms - Biceps',
  traps:      'Back',
  lats:       'Back',
  lowerback:  'Back',
  quads:      'Legs',
  hamstrings: 'Legs',
  glutes:     'Glutes',
  calves:     'Legs',
  adductors:  'Legs',
}

// ── Type ────────────────────────────────────────────────────────────────────
type S = {
  t: 'sph' | 'cap'
  p: [number, number, number]
  r: number
  h?: number
  rx?: number; ry?: number; rz?: number
}

// ── Helper: build mesh ───────────────────────────────────────────────────────
function mesh(s: S, mat: THREE.Material): THREE.Mesh {
  const g = s.t === 'sph'
    ? new THREE.SphereGeometry(s.r, 22, 16)
    : new THREE.CapsuleGeometry(s.r, s.h ?? 0.3, 8, 20)
  const m = new THREE.Mesh(g, mat)
  m.position.set(...s.p)
  if (s.rx || s.ry || s.rz) m.rotation.set(s.rx ?? 0, s.ry ?? 0, s.rz ?? 0)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// ── BASE BODY — complete human silhouette in skin tone ──────────────────────
// Shapes heavily overlap so no seams are visible. Every joint bridged.
const BODY: S[] = [
  // ── Head ─────────────────────────────────────────────────────────────────
  { t:'sph', p:[0, 1.46, 0],       r:0.230 },                 // cranium
  { t:'sph', p:[0, 1.36, 0.04],    r:0.200 },                 // face volume
  { t:'sph', p:[0, 1.24, 0.05],    r:0.155 },                 // jaw/chin
  { t:'sph', p:[-0.12,1.38, 0.12], r:0.080 },                 // cheek L
  { t:'sph', p:[ 0.12,1.38, 0.12], r:0.080 },                 // cheek R
  // ── Neck ─────────────────────────────────────────────────────────────────
  { t:'cap', p:[0, 1.12, 0.01],    r:0.098, h:0.14 },
  // ── Trapezius / upper back rise ──────────────────────────────────────────
  { t:'cap', p:[-0.16,1.06,-0.06], r:0.115, h:0.14, rz:-0.38 },
  { t:'cap', p:[ 0.16,1.06,-0.06], r:0.115, h:0.14, rz: 0.38 },
  // ── Shoulders ────────────────────────────────────────────────────────────
  { t:'sph', p:[-0.50, 0.96, 0],   r:0.210 },                 // deltoid L
  { t:'sph', p:[ 0.50, 0.96, 0],   r:0.210 },                 // deltoid R
  { t:'sph', p:[-0.44, 0.90, 0.08],r:0.145 },                 // front delt L
  { t:'sph', p:[ 0.44, 0.90, 0.08],r:0.145 },                 // front delt R
  { t:'sph', p:[-0.47, 0.90,-0.10],r:0.130 },                 // rear delt L
  { t:'sph', p:[ 0.47, 0.90,-0.10],r:0.130 },                 // rear delt R
  // ── Chest ─────────────────────────────────────────────────────────────────
  { t:'cap', p:[0, 0.90, 0.04],    r:0.360, h:0.08, rz: Math.PI/2 }, // collar bridge
  { t:'cap', p:[0, 0.72, 0.16],    r:0.310, h:0.32 },         // mid chest
  { t:'sph', p:[-0.22, 0.74, 0.22],r:0.175 },                 // pec L bulk
  { t:'sph', p:[ 0.22, 0.74, 0.22],r:0.175 },                 // pec R bulk
  { t:'sph', p:[-0.10, 0.84, 0.24],r:0.130 },                 // upper pec L
  { t:'sph', p:[ 0.10, 0.84, 0.24],r:0.130 },                 // upper pec R
  // ── Abdomen ──────────────────────────────────────────────────────────────
  { t:'cap', p:[0, 0.42, 0.12],    r:0.235, h:0.24 },         // upper abs zone
  { t:'cap', p:[0, 0.16, 0.10],    r:0.215, h:0.20 },         // lower abs zone
  // ── Obliques / side waist ─────────────────────────────────────────────────
  { t:'cap', p:[-0.29, 0.32, 0.04],r:0.130, h:0.36, rz: 0.15 },
  { t:'cap', p:[ 0.29, 0.32, 0.04],r:0.130, h:0.36, rz:-0.15 },
  // ── Serratus / rib cage sides ─────────────────────────────────────────────
  { t:'sph', p:[-0.33, 0.60, 0.12],r:0.100 },
  { t:'sph', p:[ 0.33, 0.60, 0.12],r:0.100 },
  { t:'sph', p:[-0.31, 0.44, 0.12],r:0.092 },
  { t:'sph', p:[ 0.31, 0.44, 0.12],r:0.092 },
  // ── Hip / Pelvis ─────────────────────────────────────────────────────────
  { t:'cap', p:[0, -0.06, 0.02],   r:0.275, h:0.10 },         // pelvis bridge
  { t:'sph', p:[-0.22,-0.16, 0.04],r:0.215 },                 // hip L
  { t:'sph', p:[ 0.22,-0.16, 0.04],r:0.215 },                 // hip R
  { t:'sph', p:[-0.22,-0.06, 0.10],r:0.165 },                 // ASIS L
  { t:'sph', p:[ 0.22,-0.06, 0.10],r:0.165 },                 // ASIS R
  // ── Glutes ───────────────────────────────────────────────────────────────
  { t:'sph', p:[-0.20,-0.22,-0.22],r:0.230 },
  { t:'sph', p:[ 0.20,-0.22,-0.22],r:0.230 },
  { t:'sph', p:[-0.20,-0.10,-0.18],r:0.165 },
  { t:'sph', p:[ 0.20,-0.10,-0.18],r:0.165 },
  // ── ARMS L ───────────────────────────────────────────────────────────────
  { t:'cap', p:[-0.56, 0.64, 0.02],r:0.120, h:0.50, rz: 0.07 }, // upper arm L
  { t:'sph', p:[-0.60, 0.32, 0.02],r:0.095 },                 // elbow L
  { t:'cap', p:[-0.61, 0.10, 0.02],r:0.098, h:0.42, rz: 0.05 }, // forearm L
  { t:'sph', p:[-0.63,-0.16, 0.02],r:0.072 },                 // wrist L
  // ── ARMS R ───────────────────────────────────────────────────────────────
  { t:'cap', p:[ 0.56, 0.64, 0.02],r:0.120, h:0.50, rz:-0.07 }, // upper arm R
  { t:'sph', p:[ 0.60, 0.32, 0.02],r:0.095 },                 // elbow R
  { t:'cap', p:[ 0.61, 0.10, 0.02],r:0.098, h:0.42, rz:-0.05 }, // forearm R
  { t:'sph', p:[ 0.63,-0.16, 0.02],r:0.072 },                 // wrist R
  // ── THIGHS ───────────────────────────────────────────────────────────────
  { t:'cap', p:[-0.19,-0.54, 0.02],r:0.198, h:0.54 },         // thigh L
  { t:'cap', p:[ 0.19,-0.54, 0.02],r:0.198, h:0.54 },         // thigh R
  { t:'sph', p:[-0.21,-0.44, 0.10],r:0.155 },                 // quad bulk L
  { t:'sph', p:[ 0.21,-0.44, 0.10],r:0.155 },                 // quad bulk R
  { t:'sph', p:[-0.27,-0.50, 0.06],r:0.115 },                 // vastus lat L
  { t:'sph', p:[ 0.27,-0.50, 0.06],r:0.115 },                 // vastus lat R
  { t:'sph', p:[-0.19,-0.52,-0.14],r:0.145 },                 // hamstring L
  { t:'sph', p:[ 0.19,-0.52,-0.14],r:0.145 },                 // hamstring R
  { t:'sph', p:[-0.25,-0.48,-0.08],r:0.105 },                 // bicep fem L
  { t:'sph', p:[ 0.25,-0.48,-0.08],r:0.105 },                 // bicep fem R
  // ── KNEES ────────────────────────────────────────────────────────────────
  { t:'sph', p:[-0.19,-0.90, 0.04],r:0.112 },
  { t:'sph', p:[ 0.19,-0.90, 0.04],r:0.112 },
  // ── CALVES ───────────────────────────────────────────────────────────────
  { t:'cap', p:[-0.19,-1.12, 0.00],r:0.118, h:0.36 },         // calf L
  { t:'cap', p:[ 0.19,-1.12, 0.00],r:0.118, h:0.36 },         // calf R
  { t:'sph', p:[-0.19,-1.04,-0.10],r:0.108 },                 // gastrocnemius L
  { t:'sph', p:[ 0.19,-1.04,-0.10],r:0.108 },                 // gastrocnemius R
  { t:'sph', p:[-0.19,-1.10, 0.10],r:0.082 },                 // tibialis L
  { t:'sph', p:[ 0.19,-1.10, 0.10],r:0.082 },                 // tibialis R
  // ── ANKLES / FEET ─────────────────────────────────────────────────────────
  { t:'sph', p:[-0.19,-1.44, 0.02],r:0.082 },
  { t:'sph', p:[ 0.19,-1.44, 0.02],r:0.082 },
  { t:'cap', p:[-0.16,-1.54, 0.10],r:0.068, h:0.14, rx:-0.3 }, // foot L
  { t:'cap', p:[ 0.16,-1.54, 0.10],r:0.068, h:0.14, rx:-0.3 }, // foot R
  // ── BACK — broad lat sweep ───────────────────────────────────────────────
  { t:'cap', p:[-0.32, 0.56,-0.16],r:0.155, h:0.48, rz:-0.14 },
  { t:'cap', p:[ 0.32, 0.56,-0.16],r:0.155, h:0.48, rz: 0.14 },
  { t:'sph', p:[-0.38, 0.72,-0.10],r:0.120 },                 // lat upper L
  { t:'sph', p:[ 0.38, 0.72,-0.10],r:0.120 },                 // lat upper R
  { t:'cap', p:[-0.10, 0.20,-0.24],r:0.092, h:0.38 },         // erector L
  { t:'cap', p:[ 0.10, 0.20,-0.24],r:0.092, h:0.38 },         // erector R
  // ── ADDUCTORS (inner thigh) ───────────────────────────────────────────────
  { t:'cap', p:[-0.12,-0.52, 0.06],r:0.105, h:0.42, rz: 0.08 },
  { t:'cap', p:[ 0.12,-0.52, 0.06],r:0.105, h:0.42, rz:-0.08 },
]

// ── MUSCLE HIGHLIGHT ZONES (same positions as body but slightly scaled) ──────
type MG = { shapes: S[] }
const MUSCLE_GROUPS: Record<string, MG> = {
  chest: { shapes: [
    { t:'sph', p:[-0.22, 0.74, 0.24], r:0.170, },
    { t:'sph', p:[ 0.22, 0.74, 0.24], r:0.170, },
    { t:'sph', p:[-0.10, 0.84, 0.26], r:0.130, },
    { t:'sph', p:[ 0.10, 0.84, 0.26], r:0.130, },
    { t:'cap', p:[-0.18, 0.70, 0.22], r:0.145, h:0.24, rz: 0.35 },
    { t:'cap', p:[ 0.18, 0.70, 0.22], r:0.145, h:0.24, rz:-0.35 },
  ]},
  shoulders: { shapes: [
    { t:'sph', p:[-0.50, 0.96, 0.02], r:0.200 },
    { t:'sph', p:[ 0.50, 0.96, 0.02], r:0.200 },
    { t:'sph', p:[-0.44, 0.90, 0.10], r:0.140 },
    { t:'sph', p:[ 0.44, 0.90, 0.10], r:0.140 },
    { t:'sph', p:[-0.47, 0.90,-0.12], r:0.125 },
    { t:'sph', p:[ 0.47, 0.90,-0.12], r:0.125 },
  ]},
  biceps: { shapes: [
    { t:'sph', p:[-0.56, 0.68, 0.14], r:0.115 },
    { t:'sph', p:[ 0.56, 0.68, 0.14], r:0.115 },
    { t:'cap', p:[-0.56, 0.64, 0.12], r:0.105, h:0.30, rz: 0.07 },
    { t:'cap', p:[ 0.56, 0.64, 0.12], r:0.105, h:0.30, rz:-0.07 },
  ]},
  triceps: { shapes: [
    { t:'sph', p:[-0.56, 0.72,-0.12], r:0.110 },
    { t:'sph', p:[ 0.56, 0.72,-0.12], r:0.110 },
    { t:'cap', p:[-0.57, 0.60,-0.13], r:0.108, h:0.38, rz: 0.07 },
    { t:'cap', p:[ 0.57, 0.60,-0.13], r:0.108, h:0.38, rz:-0.07 },
  ]},
  forearms: { shapes: [
    { t:'cap', p:[-0.61, 0.10, 0.04], r:0.094, h:0.36, rz: 0.05 },
    { t:'cap', p:[ 0.61, 0.10, 0.04], r:0.094, h:0.36, rz:-0.05 },
  ]},
  abs: { shapes: [
    { t:'sph', p:[-0.092, 0.50, 0.26], r:0.080 },
    { t:'sph', p:[ 0.092, 0.50, 0.26], r:0.080 },
    { t:'sph', p:[-0.092, 0.32, 0.26], r:0.082 },
    { t:'sph', p:[ 0.092, 0.32, 0.26], r:0.082 },
    { t:'sph', p:[-0.092, 0.14, 0.24], r:0.078 },
    { t:'sph', p:[ 0.092, 0.14, 0.24], r:0.078 },
  ]},
  obliques: { shapes: [
    { t:'cap', p:[-0.30, 0.30, 0.06], r:0.120, h:0.32, rz: 0.55 },
    { t:'cap', p:[ 0.30, 0.30, 0.06], r:0.120, h:0.32, rz:-0.55 },
  ]},
  serratus: { shapes: [
    { t:'sph', p:[-0.32, 0.60, 0.14], r:0.090 },
    { t:'sph', p:[ 0.32, 0.60, 0.14], r:0.090 },
    { t:'sph', p:[-0.30, 0.44, 0.14], r:0.085 },
    { t:'sph', p:[ 0.30, 0.44, 0.14], r:0.085 },
  ]},
  traps: { shapes: [
    { t:'cap', p:[-0.16,1.06,-0.08], r:0.110, h:0.14, rz:-0.40 },
    { t:'cap', p:[ 0.16,1.06,-0.08], r:0.110, h:0.14, rz: 0.40 },
    { t:'cap', p:[-0.28,0.88,-0.16], r:0.110, h:0.20, rz:-0.28 },
    { t:'cap', p:[ 0.28,0.88,-0.16], r:0.110, h:0.20, rz: 0.28 },
  ]},
  lats: { shapes: [
    { t:'cap', p:[-0.33, 0.55,-0.18], r:0.150, h:0.46, rz:-0.14 },
    { t:'cap', p:[ 0.33, 0.55,-0.18], r:0.150, h:0.46, rz: 0.14 },
    { t:'sph', p:[-0.38, 0.72,-0.12], r:0.118 },
    { t:'sph', p:[ 0.38, 0.72,-0.12], r:0.118 },
  ]},
  lowerback: { shapes: [
    { t:'cap', p:[-0.10, 0.20,-0.26], r:0.088, h:0.36 },
    { t:'cap', p:[ 0.10, 0.20,-0.26], r:0.088, h:0.36 },
  ]},
  glutes: { shapes: [
    { t:'sph', p:[-0.20,-0.22,-0.24], r:0.228 },
    { t:'sph', p:[ 0.20,-0.22,-0.24], r:0.228 },
    { t:'sph', p:[-0.20,-0.10,-0.20], r:0.160 },
    { t:'sph', p:[ 0.20,-0.10,-0.20], r:0.160 },
  ]},
  quads: { shapes: [
    { t:'cap', p:[-0.19,-0.52, 0.10], r:0.180, h:0.46 },
    { t:'cap', p:[ 0.19,-0.52, 0.10], r:0.180, h:0.46 },
    { t:'sph', p:[-0.21,-0.44, 0.12], r:0.148 },
    { t:'sph', p:[ 0.21,-0.44, 0.12], r:0.148 },
    { t:'sph', p:[-0.27,-0.50, 0.08], r:0.110 },
    { t:'sph', p:[ 0.27,-0.50, 0.08], r:0.110 },
  ]},
  hamstrings: { shapes: [
    { t:'cap', p:[-0.19,-0.52,-0.16], r:0.142, h:0.44 },
    { t:'cap', p:[ 0.19,-0.52,-0.16], r:0.142, h:0.44 },
    { t:'sph', p:[-0.25,-0.48,-0.10], r:0.102 },
    { t:'sph', p:[ 0.25,-0.48,-0.10], r:0.102 },
  ]},
  adductors: { shapes: [
    { t:'cap', p:[-0.12,-0.52, 0.06], r:0.100, h:0.40, rz: 0.08 },
    { t:'cap', p:[ 0.12,-0.52, 0.06], r:0.100, h:0.40, rz:-0.08 },
  ]},
  calves: { shapes: [
    { t:'cap', p:[-0.19,-1.12,-0.08], r:0.110, h:0.32 },
    { t:'cap', p:[ 0.19,-1.12,-0.08], r:0.110, h:0.32 },
    { t:'sph', p:[-0.19,-1.04,-0.12], r:0.105 },
    { t:'sph', p:[ 0.19,-1.04,-0.12], r:0.105 },
  ]},
}

// ── Skin material factory ────────────────────────────────────────────────────
function skinMaterial(emissiveMul = 0.0): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#B0704A'),
    roughness:          0.68,
    metalness:          0.00,
    clearcoat:          0.15,
    clearcoatRoughness: 0.80,
    sheen:              0.12,
    sheenColor:         new THREE.Color('#FF8855'),
    sheenRoughness:     0.90,
    emissive:           new THREE.Color('#5A2010'),
    emissiveIntensity:  emissiveMul,
  })
}

// ── Props ────────────────────────────────────────────────────────────────────
interface MuscleFigure3DProps {
  categoryFreq: Record<string, number>
  selectedCategory: string | null
  onCategorySelect: (cat: string | null) => void
  height?: number
}

export default function MuscleFigure3D({
  categoryFreq, selectedCategory, onCategorySelect, height = 420,
}: MuscleFigure3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  const stateRef = useRef({
    renderer:     null as THREE.WebGLRenderer | null,
    scene:        null as THREE.Scene | null,
    camera:       null as THREE.PerspectiveCamera | null,
    root:         null as THREE.Group | null,
    groups:       {} as Record<string, { g: THREE.Group; mat: THREE.MeshPhysicalMaterial }>,
    accentLight:  null as THREE.PointLight | null,
    groundMat:    null as THREE.MeshBasicMaterial | null,
    raycaster:    new THREE.Raycaster(),
    pointer:      new THREE.Vector2(),
    rotY: 0, targetRotY: 0,
    rotX:-0.06, targetRotX:-0.06,
    camZ: 3.80, targetCamZ: 3.80,
    dragging: false, dragMoved: false, lastX: 0, lastY: 0,
    idleTimer: 0, hovered: null as string | null,
    raf: null as number | null, ro: null as ResizeObserver | null,
  })

  const propsRef = useRef({ categoryFreq, selectedCategory })
  useEffect(() => { propsRef.current = { categoryFreq, selectedCategory } }, [categoryFreq, selectedCategory])

  useEffect(() => {
    const s = stateRef.current
    const mount = mountRef.current
    if (!mount) return
    let dead = false

    const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
    const W = mount.clientWidth, H = mount.clientHeight

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x040206, 0.18)

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 40)
    camera.position.set(0, 0.12, 3.80)
    camera.lookAt(0, 0.08, 0)

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2.5))
    renderer.setSize(W, H)
    renderer.setClearColor(0, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    mount.appendChild(renderer.domElement)

    // ── Lighting ─────────────────────────────────────────────────────────────
    // Warm fill — simulates bounced skin tone
    scene.add(new THREE.AmbientLight(0x7A3820, 0.90))

    // Key light — warm sun from upper left
    const key = new THREE.DirectionalLight(0xFFE8D0, 2.0)
    key.position.set(-1.8, 4.0, 3.0)
    key.castShadow = true
    key.shadow.mapSize.setScalar(1024)
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 14
    key.shadow.camera.left = -2.2; key.shadow.camera.right = 2.2
    key.shadow.camera.top = 3.5; key.shadow.camera.bottom = -2.5
    key.shadow.bias = -0.0006
    scene.add(key)

    // Cool rim — definition from behind (blue-sky reflection)
    const rim = new THREE.DirectionalLight(0x88AADD, 1.0)
    rim.position.set(2.5, 0.8, -3.5)
    scene.add(rim)

    // Fill from bottom (ground bounce)
    const fill = new THREE.DirectionalLight(0xFFAA77, 0.35)
    fill.position.set(0, -3, 1)
    scene.add(fill)

    // Accent point — theme color, front
    const accentLight = new THREE.PointLight(new THREE.Color(accentHex), 1.8, 5.5)
    accentLight.position.set(0.4, 0.4, 2.8)
    scene.add(accentLight)
    s.accentLight = accentLight

    // ── Ground disc ───────────────────────────────────────────────────────────
    const groundMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex), transparent: true, opacity: 0.08,
    })
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.66
    scene.add(ground)
    s.groundMat = groundMat

    // ── Root ─────────────────────────────────────────────────────────────────
    const root = new THREE.Group()
    scene.add(root)
    s.root = root

    // ── Build base body ───────────────────────────────────────────────────────
    const baseMat = skinMaterial(0.0)
    BODY.forEach(shape => root.add(mesh(shape, baseMat)))

    // ── Build muscle groups ───────────────────────────────────────────────────
    const groups: typeof s.groups = {}
    Object.entries(MUSCLE_GROUPS).forEach(([key, mg]) => {
      const mat = skinMaterial(0.0) // same skin tone, controlled via emissiveIntensity
      const g = new THREE.Group()
      g.userData.key = key
      mg.shapes.forEach(shape => {
        const m = mesh(shape, mat)
        m.userData.key = key
        g.add(m)
      })
      root.add(g)
      groups[key] = { g, mat }
    })
    s.groups = groups
    s.scene = scene; s.camera = camera; s.renderer = renderer

    // ── Pointer ───────────────────────────────────────────────────────────────
    const el = renderer.domElement
    el.style.touchAction = 'none'; el.style.cursor = 'grab'

    const ptr = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      s.pointer.set(
        ((e.clientX - r.left) / r.width)  * 2 - 1,
       -((e.clientY - r.top)  / r.height) * 2 + 1,
      )
    }
    const onDown = (e: PointerEvent) => {
      ptr(e); s.dragging = true; s.dragMoved = false
      s.lastX = e.clientX; s.lastY = e.clientY; s.idleTimer = 0
    }
    const onMove = (e: PointerEvent) => {
      ptr(e)
      if (s.dragging) {
        const dx = e.clientX - s.lastX, dy = e.clientY - s.lastY
        if (Math.abs(dx) + Math.abs(dy) > 3) s.dragMoved = true
        s.targetRotY += dx * 0.010
        s.targetRotX  = Math.max(-0.65, Math.min(0.65, s.targetRotX + dy * 0.005))
        s.lastX = e.clientX; s.lastY = e.clientY
      } else {
        s.raycaster.setFromCamera(s.pointer, camera)
        const hits = s.raycaster.intersectObjects(
          Object.values(s.groups).flatMap(({ g }) => g.children as THREE.Mesh[]), false
        )
        s.hovered = (hits[0]?.object?.userData?.key as string) ?? null
        el.style.cursor = s.hovered ? 'pointer' : 'grab'
      }
    }
    const onUp = () => {
      if (s.dragging && !s.dragMoved) {
        s.raycaster.setFromCamera(s.pointer, camera)
        const hits = s.raycaster.intersectObjects(
          Object.values(s.groups).flatMap(({ g }) => g.children as THREE.Mesh[]), false
        )
        const k = hits[0]?.object?.userData?.key as string | undefined
        const cat = k ? MUSCLE_TO_CATEGORY[k] ?? null : null
        onCategorySelect(cat === propsRef.current.selectedCategory ? null : cat)
      }
      s.dragging = false
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup',   onUp)
    el.addEventListener('pointerleave', () => { s.dragging = false; s.hovered = null })

    // ── Resize ────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      if (nw > 0 && nh > 0) {
        renderer.setSize(nw, nh)
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
      }
    })
    ro.observe(mount); s.ro = ro

    // ── Render loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    const tmp = new THREE.Color()

    const loop = () => {
      if (dead) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t  = clock.getElapsedTime()
      const { categoryFreq: freq, selectedCategory: selCat } = propsRef.current

      // Rotation
      s.idleTimer += dt
      if (!s.dragging && s.idleTimer > 2.5) s.targetRotY += dt * 0.10
      s.rotY += (s.targetRotY - s.rotY) * Math.min(1, dt * 7)
      s.rotX += (s.targetRotX - s.rotX) * Math.min(1, dt * 7)
      root.rotation.y = s.rotY; root.rotation.x = s.rotX

      // Camera zoom on selection
      s.targetCamZ = selCat ? 3.10 : 3.80
      s.camZ += (s.targetCamZ - s.camZ) * Math.min(1, dt * 3)
      camera.position.z = s.camZ

      // Float
      root.position.y = Math.sin(t * 1.2) * 0.008

      // Muscle materials
      const lk = Math.min(1, dt * 9)
      Object.entries(s.groups).forEach(([key, { mat }]) => {
        const cat      = MUSCLE_TO_CATEGORY[key]
        const freq0    = cat ? (freq[cat] ?? 0) : 0
        const train    = Math.min(freq0 / 10, 1)
        const isSel    = selCat ? cat === selCat : false
        const isHov    = s.hovered === key

        // Emissive intensity drives the "glow" — muscles light up based on training volume
        let targetEmit: number
        let targetColor: THREE.Color

        if (isSel) {
          // Pulse with theme accent color
          const accent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
          targetEmit  = 1.4 + Math.sin(t * 5) * 0.45
          targetColor = tmp.set(accent)
        } else if (isHov) {
          const accent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
          targetEmit  = 0.90
          targetColor = tmp.set(accent)
        } else if (selCat) {
          // Dim everything else
          targetEmit  = 0.04
          targetColor = tmp.set('#5A2010')
        } else if (train > 0) {
          // Volume heat: darker orange → bright warm based on frequency
          targetEmit  = 0.18 + train * 1.00
          // Interpolate emissive from dark red → bright orange
          const r = 0.35 + train * 0.65
          const g = 0.12 + train * 0.25
          const b = 0.04
          targetColor = tmp.setRGB(r, g, b)
        } else {
          targetEmit  = 0.05
          targetColor = tmp.set('#5A2010')
        }

        mat.emissiveIntensity += (targetEmit - mat.emissiveIntensity) * lk
        mat.emissive.lerp(targetColor, lk)
      })

      // Accent light
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
      s.accentLight!.color.lerp(tmp.set(accent), Math.min(1, dt * 4))
      s.accentLight!.intensity = 1.6 + Math.sin(t * 1.6) * 0.30
      s.groundMat!.color.lerp(tmp.set(accent), Math.min(1, dt * 4))

      renderer.render(scene, camera)
      s.raf = requestAnimationFrame(loop)
    }
    s.raf = requestAnimationFrame(loop)
    setLoaded(true)

    return () => {
      dead = true
      if (s.raf) cancelAnimationFrame(s.raf)
      if (s.ro)  s.ro.disconnect()
      el.removeEventListener('pointerdown',  onDown)
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerup',    onUp)
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      renderer.dispose()
      scene.traverse(obj => {
        const m = obj as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        if (m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material]
          mats.forEach(x => x.dispose())
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--theme-text-muted)', fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'var(--theme-font-mono, monospace)',
        }}>
          Laden…
        </div>
      )}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(ellipse 75% 85% at 50% 50%, transparent 48%, rgba(0,0,0,0.80) 100%)',
      }} />
    </div>
  )
}
