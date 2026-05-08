import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const MUSCLE_TO_CATEGORY: Record<string, string> = {
  chest:      'Chest',
  abs:        'Core',
  obliques:   'Core',
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
  shins:      'Legs',
}

// Realistic muscle anatomy colors (dark when inactive, glow when trained)
const MUSCLE_BASE: Record<string, number> = {
  chest:      0x9B3A2A,
  abs:        0x8A3525,
  obliques:   0x7A3020,
  shoulders:  0xA04535,
  biceps:     0x8C3828,
  triceps:    0x7E3322,
  forearms:   0x7A3525,
  traps:      0x954030,
  lats:       0x8B3A2A,
  lowerback:  0x7C3020,
  quads:      0xA04030,
  hamstrings: 0x8A3828,
  glutes:     0x904030,
  calves:     0x7E3525,
  shins:      0x7A3020,
}

type Shape = {
  type: 'sphere' | 'capsule'
  pos: [number, number, number]
  size: [number, number?]
  rot?: [number, number, number]
}

// Full anatomical figure — all organic (no BoxGeometry)
const MUSCLE_DEFS: Record<string, Shape[]> = {
  // ── FRONT ──────────────────────────────────────────────────────
  chest: [
    { type: 'capsule', pos: [-0.20, 0.70, 0.26], size: [0.17, 0.32], rot: [0.10,  0.30, 0.50] },
    { type: 'capsule', pos: [ 0.20, 0.70, 0.26], size: [0.17, 0.32], rot: [0.10, -0.30,-0.50] },
    { type: 'sphere',  pos: [-0.10, 0.62, 0.30], size: [0.12] },
    { type: 'sphere',  pos: [ 0.10, 0.62, 0.30], size: [0.12] },
  ],
  abs: [
    { type: 'sphere', pos: [-0.095, 0.45, 0.30], size: [0.085] },
    { type: 'sphere', pos: [ 0.095, 0.45, 0.30], size: [0.085] },
    { type: 'sphere', pos: [-0.095, 0.28, 0.30], size: [0.085] },
    { type: 'sphere', pos: [ 0.095, 0.28, 0.30], size: [0.085] },
    { type: 'sphere', pos: [-0.095, 0.11, 0.29], size: [0.080] },
    { type: 'sphere', pos: [ 0.095, 0.11, 0.29], size: [0.080] },
  ],
  obliques: [
    { type: 'capsule', pos: [-0.30, 0.28, 0.18], size: [0.10, 0.38], rot: [0.0, 0.0, 0.55] },
    { type: 'capsule', pos: [ 0.30, 0.28, 0.18], size: [0.10, 0.38], rot: [0.0, 0.0,-0.55] },
  ],
  shoulders: [
    { type: 'sphere',  pos: [-0.52, 0.92, 0.04], size: [0.215] },
    { type: 'sphere',  pos: [ 0.52, 0.92, 0.04], size: [0.215] },
    { type: 'capsule', pos: [-0.50, 0.85, 0.10], size: [0.12, 0.18], rot: [0.2, 0.0, 0.3] },
    { type: 'capsule', pos: [ 0.50, 0.85, 0.10], size: [0.12, 0.18], rot: [0.2, 0.0,-0.3] },
  ],
  biceps: [
    { type: 'capsule', pos: [-0.57, 0.64, 0.12], size: [0.115, 0.38], rot: [0.0, 0.0, 0.07] },
    { type: 'capsule', pos: [ 0.57, 0.64, 0.12], size: [0.115, 0.38], rot: [0.0, 0.0,-0.07] },
    { type: 'sphere',  pos: [-0.57, 0.68, 0.14], size: [0.095] },
    { type: 'sphere',  pos: [ 0.57, 0.68, 0.14], size: [0.095] },
  ],
  forearms: [
    { type: 'capsule', pos: [-0.60, 0.20, 0.10], size: [0.095, 0.40], rot: [0.0, 0.0, 0.06] },
    { type: 'capsule', pos: [ 0.60, 0.20, 0.10], size: [0.095, 0.40], rot: [0.0, 0.0,-0.06] },
  ],
  quads: [
    { type: 'capsule', pos: [-0.18, -0.50, 0.12], size: [0.175, 0.52], rot: [0.04, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.18, -0.50, 0.12], size: [0.175, 0.52], rot: [0.04, 0.0, 0.0] },
    { type: 'capsule', pos: [-0.28, -0.48, 0.06], size: [0.11,  0.46], rot: [0.0,  0.1, 0.08] },
    { type: 'capsule', pos: [ 0.28, -0.48, 0.06], size: [0.11,  0.46], rot: [0.0, -0.1,-0.08] },
    { type: 'sphere',  pos: [-0.18, -0.42, 0.14], size: [0.11] },
    { type: 'sphere',  pos: [ 0.18, -0.42, 0.14], size: [0.11] },
  ],
  shins: [
    { type: 'capsule', pos: [-0.19, -1.08, 0.10], size: [0.085, 0.30], rot: [0.06, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.19, -1.08, 0.10], size: [0.085, 0.30], rot: [0.06, 0.0, 0.0] },
  ],

  // ── BACK ───────────────────────────────────────────────────────
  traps: [
    { type: 'capsule', pos: [-0.17, 1.06, -0.10], size: [0.13, 0.24], rot: [0.1, 0.0,-0.45] },
    { type: 'capsule', pos: [ 0.17, 1.06, -0.10], size: [0.13, 0.24], rot: [0.1, 0.0, 0.45] },
    { type: 'capsule', pos: [-0.28, 0.88, -0.18], size: [0.11, 0.22], rot: [0.0, 0.0,-0.30] },
    { type: 'capsule', pos: [ 0.28, 0.88, -0.18], size: [0.11, 0.22], rot: [0.0, 0.0, 0.30] },
  ],
  lats: [
    { type: 'capsule', pos: [-0.34, 0.54, -0.20], size: [0.155, 0.52], rot: [0.0, 0.0,-0.18] },
    { type: 'capsule', pos: [ 0.34, 0.54, -0.20], size: [0.155, 0.52], rot: [0.0, 0.0, 0.18] },
    { type: 'sphere',  pos: [-0.40, 0.72, -0.14], size: [0.12] },
    { type: 'sphere',  pos: [ 0.40, 0.72, -0.14], size: [0.12] },
  ],
  lowerback: [
    { type: 'capsule', pos: [-0.10, 0.16, -0.28], size: [0.095, 0.40], rot: [0.0, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.10, 0.16, -0.28], size: [0.095, 0.40], rot: [0.0, 0.0, 0.0] },
  ],
  triceps: [
    { type: 'capsule', pos: [-0.57, 0.62, -0.13], size: [0.115, 0.42], rot: [0.0, 0.0, 0.07] },
    { type: 'capsule', pos: [ 0.57, 0.62, -0.13], size: [0.115, 0.42], rot: [0.0, 0.0,-0.07] },
    { type: 'sphere',  pos: [-0.57, 0.72, -0.11], size: [0.090] },
    { type: 'sphere',  pos: [ 0.57, 0.72, -0.11], size: [0.090] },
  ],
  glutes: [
    { type: 'sphere',  pos: [-0.20, -0.14, -0.28], size: [0.235] },
    { type: 'sphere',  pos: [ 0.20, -0.14, -0.28], size: [0.235] },
    { type: 'capsule', pos: [-0.20, -0.05, -0.24], size: [0.14, 0.22], rot: [0.2, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.20, -0.05, -0.24], size: [0.14, 0.22], rot: [0.2, 0.0, 0.0] },
  ],
  hamstrings: [
    { type: 'capsule', pos: [-0.19, -0.52, -0.16], size: [0.145, 0.50], rot: [0.0, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.19, -0.52, -0.16], size: [0.145, 0.50], rot: [0.0, 0.0, 0.0] },
    { type: 'capsule', pos: [-0.28, -0.50, -0.10], size: [0.10,  0.44], rot: [0.0, 0.1, 0.06] },
    { type: 'capsule', pos: [ 0.28, -0.50, -0.10], size: [0.10,  0.44], rot: [0.0,-0.1,-0.06] },
  ],
  calves: [
    { type: 'capsule', pos: [-0.19, -1.08, -0.10], size: [0.12, 0.32], rot: [-0.05, 0.0, 0.0] },
    { type: 'capsule', pos: [ 0.19, -1.08, -0.10], size: [0.12, 0.32], rot: [-0.05, 0.0, 0.0] },
    { type: 'sphere',  pos: [-0.19, -1.00, -0.12], size: [0.095] },
    { type: 'sphere',  pos: [ 0.19, -1.00, -0.12], size: [0.095] },
  ],
}

// Deep anatomy base — dark connective tissue between muscles
const FASCIA: Shape[] = [
  // Head
  { type: 'sphere',  pos: [0, 1.44, 0],          size: [0.23] },
  // Neck
  { type: 'capsule', pos: [0, 1.18, 0],           size: [0.095, 0.14] },
  // Upper torso / clavicle region
  { type: 'capsule', pos: [0, 0.88, 0.04],        size: [0.40, 0.16], rot: [0, 0, Math.PI / 2] },
  // Mid torso
  { type: 'capsule', pos: [0, 0.55, 0],           size: [0.32, 0.42] },
  // Lower torso / pelvis
  { type: 'capsule', pos: [0, 0.10, 0],           size: [0.29, 0.28] },
  // Hip spheres
  { type: 'sphere',  pos: [-0.20, -0.18, 0],      size: [0.215] },
  { type: 'sphere',  pos: [ 0.20, -0.18, 0],      size: [0.215] },
  // Upper arms
  { type: 'capsule', pos: [-0.57, 0.62, 0],       size: [0.13, 0.50], rot: [0, 0, 0.07] },
  { type: 'capsule', pos: [ 0.57, 0.62, 0],       size: [0.13, 0.50], rot: [0, 0,-0.07] },
  // Elbows
  { type: 'sphere',  pos: [-0.59, 0.30, 0],       size: [0.10] },
  { type: 'sphere',  pos: [ 0.59, 0.30, 0],       size: [0.10] },
  // Forearms
  { type: 'capsule', pos: [-0.60, 0.08, 0],       size: [0.10, 0.44], rot: [0, 0, 0.06] },
  { type: 'capsule', pos: [ 0.60, 0.08, 0],       size: [0.10, 0.44], rot: [0, 0,-0.06] },
  // Wrists / hands suggestion
  { type: 'sphere',  pos: [-0.63, -0.18, 0],      size: [0.080] },
  { type: 'sphere',  pos: [ 0.63, -0.18, 0],      size: [0.080] },
  // Thighs
  { type: 'capsule', pos: [-0.19, -0.50, 0],      size: [0.20, 0.58] },
  { type: 'capsule', pos: [ 0.19, -0.50, 0],      size: [0.20, 0.58] },
  // Knees
  { type: 'sphere',  pos: [-0.19, -0.86, 0.02],   size: [0.115] },
  { type: 'sphere',  pos: [ 0.19, -0.86, 0.02],   size: [0.115] },
  // Shins/calves
  { type: 'capsule', pos: [-0.19, -1.10, 0],      size: [0.115, 0.44] },
  { type: 'capsule', pos: [ 0.19, -1.10, 0],      size: [0.115, 0.44] },
  // Ankles / feet suggestion
  { type: 'sphere',  pos: [-0.19, -1.40, 0.04],   size: [0.085] },
  { type: 'sphere',  pos: [ 0.19, -1.40, 0.04],   size: [0.085] },
]

interface MuscleFigure3DProps {
  categoryFreq: Record<string, number>
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  height?: number
}

export default function MuscleFigure3D({
  categoryFreq,
  selectedCategory,
  onCategorySelect,
  height = 400,
}: MuscleFigure3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  const stateRef = useRef({
    scene:        null as THREE.Scene | null,
    camera:       null as THREE.PerspectiveCamera | null,
    renderer:     null as THREE.WebGLRenderer | null,
    root:         null as THREE.Group | null,
    muscleMeshes: {} as Record<string, THREE.Group>,
    accentLight:  null as THREE.PointLight | null,
    rimLight:     null as THREE.PointLight | null,
    ground:       null as THREE.Mesh | null,
    raycaster:    new THREE.Raycaster(),
    pointer:      new THREE.Vector2(),
    rotY: 0.0, targetRotY: 0.0,
    rotX: -0.05, targetRotX: -0.05,
    cameraDist: 3.8, targetCameraDist: 3.8,
    dragging: false, dragMoved: false, lastX: 0, lastY: 0,
    idleTimer: 0,
    hovered: null as string | null,
    raf: null as number | null,
    ro:  null as ResizeObserver | null,
  })

  const propsRef = useRef({ categoryFreq, selectedCategory })
  useEffect(() => { propsRef.current = { categoryFreq, selectedCategory } }, [categoryFreq, selectedCategory])

  useEffect(() => {
    const s = stateRef.current
    const mount = mountRef.current
    if (!mount) return
    let cancelled = false

    const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
    const w = mount.clientWidth
    const h = mount.clientHeight

    // ── Scene ──────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x040205, 0.22)

    // ── Camera ─────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 50)
    camera.position.set(0, 0.15, 3.8)
    camera.lookAt(0, 0.1, 0)

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    mount.appendChild(renderer.domElement)

    // ── Lighting ───────────────────────────────────────────────
    // Warm fill (simulates subsurface scatter through muscle tissue)
    scene.add(new THREE.AmbientLight(0x3A1510, 0.9))

    // Key: warm top-left
    const key = new THREE.DirectionalLight(0xFFCCAA, 1.8)
    key.position.set(-2.0, 3.5, 3.0)
    key.castShadow = true
    key.shadow.mapSize.setScalar(1024)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 12
    key.shadow.camera.left = -2; key.shadow.camera.right = 2
    key.shadow.camera.top = 3;   key.shadow.camera.bottom = -2.5
    key.shadow.bias = -0.0008
    scene.add(key)

    // Cool rim: from behind-right (gives the anatomy-model rim separation)
    const rim = new THREE.DirectionalLight(0x7799CC, 1.1)
    rim.position.set(2.5, 1.0, -3.0)
    scene.add(rim)

    // Top fill: subtle warm
    const top = new THREE.DirectionalLight(0xFFAA88, 0.55)
    top.position.set(0, 4, 1)
    scene.add(top)

    // Accent point light (theme color, front)
    const accentLight = new THREE.PointLight(new THREE.Color(accentHex), 2.5, 6.0)
    accentLight.position.set(0.3, 0.5, 2.8)
    scene.add(accentLight)
    s.accentLight = accentLight

    // Warm rim point on left
    const rimPoint = new THREE.PointLight(0xFF6030, 1.2, 5.0)
    rimPoint.position.set(-2.5, 0.5, -1.0)
    scene.add(rimPoint)
    s.rimLight = rimPoint

    // ── Ground glow disc ───────────────────────────────────────
    const groundMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.10,
    })
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.60
    scene.add(ground)
    s.ground = ground

    // ── Root group ─────────────────────────────────────────────
    const root = new THREE.Group()
    scene.add(root)
    s.root = root

    // Helper
    function buildMesh(shape: Shape, mat: THREE.Material): THREE.Mesh {
      let geom: THREE.BufferGeometry
      if (shape.type === 'sphere') {
        geom = new THREE.SphereGeometry(shape.size[0], 24, 18)
      } else {
        geom = new THREE.CapsuleGeometry(shape.size[0], shape.size[1] ?? 0.4, 8, 20)
      }
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(...shape.pos)
      if (shape.rot) mesh.rotation.set(...shape.rot)
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    }

    // ── Fascia / connective tissue base ────────────────────────
    const fasciaMat = new THREE.MeshStandardMaterial({
      color:            0x1A0A08,
      roughness:        0.75,
      metalness:        0.0,
      emissive:         new THREE.Color(0x2A0D08),
      emissiveIntensity: 0.35,
    })
    FASCIA.forEach(shape => root.add(buildMesh(shape, fasciaMat)))

    // ── Muscle groups ──────────────────────────────────────────
    const muscleMeshes: Record<string, THREE.Group> = {}
    Object.entries(MUSCLE_DEFS).forEach(([key, shapes]) => {
      const baseHex = MUSCLE_BASE[key] ?? 0x7A2F22
      const baseColor = new THREE.Color(baseHex)

      const mat = new THREE.MeshStandardMaterial({
        color:            baseColor.clone().multiplyScalar(0.40),
        roughness:        0.55,
        metalness:        0.05,
        emissive:         baseColor.clone().multiplyScalar(0.20),
        emissiveIntensity: 0.50,
      })

      const group = new THREE.Group()
      group.userData.muscleKey = key
      group.userData.baseColor = baseColor
      group.userData.mat = mat

      shapes.forEach(shape => {
        const m = buildMesh(shape, mat)
        m.userData.muscleKey = key
        group.add(m)
      })

      root.add(group)
      muscleMeshes[key] = group
    })

    s.muscleMeshes = muscleMeshes
    s.scene   = scene
    s.camera  = camera
    s.renderer = renderer

    // ── Pointer ────────────────────────────────────────────────
    const el = renderer.domElement
    el.style.touchAction = 'none'
    el.style.cursor = 'grab'

    const getPtr = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      s.pointer.x =  ((e.clientX - r.left) / r.width)  * 2 - 1
      s.pointer.y = -((e.clientY - r.top)  / r.height) * 2 + 1
    }
    const onDown = (e: PointerEvent) => {
      getPtr(e)
      s.dragging = true; s.dragMoved = false
      s.lastX = e.clientX; s.lastY = e.clientY
      s.idleTimer = 0
    }
    const onMove = (e: PointerEvent) => {
      getPtr(e)
      if (s.dragging) {
        const dx = e.clientX - s.lastX
        const dy = e.clientY - s.lastY
        if (Math.abs(dx) + Math.abs(dy) > 3) s.dragMoved = true
        s.targetRotY += dx * 0.010
        s.targetRotX  = Math.max(-0.65, Math.min(0.65, s.targetRotX + dy * 0.005))
        s.lastX = e.clientX; s.lastY = e.clientY
      } else {
        s.raycaster.setFromCamera(s.pointer, camera)
        const meshes = Object.values(s.muscleMeshes).flatMap(g => g.children as THREE.Mesh[])
        const hits = s.raycaster.intersectObjects(meshes, false)
        s.hovered = (hits[0]?.object?.userData?.muscleKey as string) || null
        el.style.cursor = s.hovered ? 'pointer' : 'grab'
      }
    }
    const onUp = () => {
      if (s.dragging && !s.dragMoved) {
        s.raycaster.setFromCamera(s.pointer, camera)
        const meshes = Object.values(s.muscleMeshes).flatMap(g => g.children as THREE.Mesh[])
        const hits = s.raycaster.intersectObjects(meshes, false)
        const mk = hits[0]?.object?.userData?.muscleKey as string | undefined
        const cat = mk ? MUSCLE_TO_CATEGORY[mk] ?? null : null
        onCategorySelect(cat === propsRef.current.selectedCategory ? null : cat)
      }
      s.dragging = false
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup',   onUp)
    el.addEventListener('pointerleave', () => { s.dragging = false; s.hovered = null })

    // ── Resize ─────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      if (nw > 0 && nh > 0) {
        renderer.setSize(nw, nh)
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
      }
    })
    ro.observe(mount)
    s.ro = ro

    // ── Render loop ─────────────────────────────────────────────
    const clock = new THREE.Clock()
    const tmpColor = new THREE.Color()

    const animate = () => {
      if (cancelled) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t  = clock.getElapsedTime()
      const { categoryFreq: freq, selectedCategory: selCat } = propsRef.current

      // Auto-rotate when idle
      s.idleTimer += dt
      if (!s.dragging && s.idleTimer > 2.5) s.targetRotY += dt * 0.12

      // Smooth rotation
      s.rotY += (s.targetRotY - s.rotY) * Math.min(1, dt * 7)
      s.rotX += (s.targetRotX - s.rotX) * Math.min(1, dt * 7)
      root.rotation.y = s.rotY
      root.rotation.x = s.rotX

      // Camera zoom
      s.cameraDist += (s.targetCameraDist - s.cameraDist) * Math.min(1, dt * 3)
      camera.position.z = s.cameraDist
      s.targetCameraDist = selCat ? 3.1 : 3.8

      // Subtle float
      root.position.y = Math.sin(t * 1.3) * 0.010

      // Update muscle materials
      Object.entries(s.muscleMeshes).forEach(([key, group]) => {
        const mat  = group.userData.mat as THREE.MeshStandardMaterial
        const base = group.userData.baseColor as THREE.Color
        const cat  = MUSCLE_TO_CATEGORY[key]
        const freq0 = cat ? (freq[cat] ?? 0) : 0
        const train = Math.min(freq0 / 10, 1)
        const isSel = selCat ? cat === selCat : false
        const isHov = s.hovered === key

        // Resting state: dark with subtle muscle definition visible
        // Trained state: brighter crimson → shows training volume
        // Selected: full bright with pulse
        // Other-selected: almost black

        let targetEmit: number
        let targetColMul: number

        if (isSel) {
          targetEmit   = 1.8 + Math.sin(t * 5) * 0.5
          targetColMul = 1.2
        } else if (isHov) {
          targetEmit   = 1.2
          targetColMul = 0.85
        } else if (selCat) {
          // Dim everything else when something is selected
          targetEmit   = Math.max(0.05, 0.10 + train * 0.08)
          targetColMul = Math.max(0.05, 0.08 + train * 0.08)
        } else {
          // Volume-based brightness: dark rest → bright red when well-trained
          targetEmit   = 0.20 + train * 0.90
          targetColMul = 0.22 + train * 0.80
        }

        const lerpK = Math.min(1, dt * 9)
        mat.emissiveIntensity += (targetEmit - mat.emissiveIntensity) * lerpK

        // Lerp color toward base × scale
        tmpColor.copy(base).multiplyScalar(Math.min(targetColMul, 1.5))
        mat.color.lerp(tmpColor, lerpK)

        // Emissive: base color tinted warm when selected, otherwise reddish
        if (isSel) {
          const accent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
          tmpColor.set(accent)
        } else {
          tmpColor.copy(base).multiplyScalar(0.6)
        }
        mat.emissive.lerp(tmpColor, lerpK)
      })

      // Accent light tracks theme color + breathes
      const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
      s.accentLight!.color.lerp(tmpColor.set(currentAccent), Math.min(1, dt * 4))
      s.accentLight!.intensity = 2.0 + Math.sin(t * 1.8) * 0.4
      ;(s.ground!.material as THREE.MeshBasicMaterial).color.lerp(tmpColor.set(currentAccent), Math.min(1, dt * 4))

      renderer.render(scene, camera)
      s.raf = requestAnimationFrame(animate)
    }

    s.raf = requestAnimationFrame(animate)
    setLoaded(true)

    return () => {
      cancelled = true
      if (s.raf) cancelAnimationFrame(s.raf)
      if (s.ro)  s.ro.disconnect()
      el.removeEventListener('pointerdown',  onDown)
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerup',    onUp)
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      renderer.dispose()
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach(m => m.dispose())
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
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--theme-text-muted)', fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'var(--theme-font-mono, monospace)',
        }}>
          Laden…
        </div>
      )}
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)',
      }} />
    </div>
  )
}
