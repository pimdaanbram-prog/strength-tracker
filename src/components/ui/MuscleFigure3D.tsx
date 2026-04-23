import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// Map design muscle keys → app exercise category names
const MUSCLE_TO_CATEGORY: Record<string, string> = {
  chest:      'Chest',
  abs:        'Core',
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
}

type Shape = {
  type: 'sphere' | 'box' | 'capsule'
  pos: [number, number, number]
  size: [number, number?, number?]
  rot?: [number, number, number]
}

const MUSCLE_DEFS: Record<string, { color: string; shapes: Shape[] }> = {
  chest:      { color: '#FF5A1F', shapes: [
    { type: 'box', pos: [-0.22, 0.72, 0.36], size: [0.36, 0.34, 0.22], rot: [0, 0, 0.08] },
    { type: 'box', pos: [ 0.22, 0.72, 0.36], size: [0.36, 0.34, 0.22], rot: [0, 0, -0.08] },
  ]},
  abs:        { color: '#FFB020', shapes: [
    { type: 'box', pos: [-0.12, 0.36, 0.34], size: [0.18, 0.16, 0.14] },
    { type: 'box', pos: [ 0.12, 0.36, 0.34], size: [0.18, 0.16, 0.14] },
    { type: 'box', pos: [-0.12, 0.18, 0.34], size: [0.18, 0.16, 0.14] },
    { type: 'box', pos: [ 0.12, 0.18, 0.34], size: [0.18, 0.16, 0.14] },
    { type: 'box', pos: [-0.12, 0.00, 0.34], size: [0.18, 0.16, 0.14] },
    { type: 'box', pos: [ 0.12, 0.00, 0.34], size: [0.18, 0.16, 0.14] },
  ]},
  shoulders:  { color: '#3D7CFF', shapes: [
    { type: 'sphere', pos: [-0.52, 0.96, 0.08], size: [0.26] },
    { type: 'sphere', pos: [ 0.52, 0.96, 0.08], size: [0.26] },
  ]},
  biceps:     { color: '#B76DFF', shapes: [
    { type: 'capsule', pos: [-0.58, 0.55, 0.14], size: [0.12, 0.36], rot: [0, 0, 0.05] },
    { type: 'capsule', pos: [ 0.58, 0.55, 0.14], size: [0.12, 0.36], rot: [0, 0, -0.05] },
  ]},
  triceps:    { color: '#3EE8A8', shapes: [
    { type: 'capsule', pos: [-0.58, 0.55, -0.12], size: [0.13, 0.4], rot: [0, 0, 0.05] },
    { type: 'capsule', pos: [ 0.58, 0.55, -0.12], size: [0.13, 0.4], rot: [0, 0, -0.05] },
  ]},
  forearms:   { color: '#00D9FF', shapes: [
    { type: 'capsule', pos: [-0.62, 0.06, 0.08], size: [0.10, 0.38], rot: [0, 0, 0.05] },
    { type: 'capsule', pos: [ 0.62, 0.06, 0.08], size: [0.10, 0.38], rot: [0, 0, -0.05] },
  ]},
  traps:      { color: '#FF6FD8', shapes: [
    { type: 'box', pos: [-0.2, 1.08, -0.02], size: [0.22, 0.16, 0.26], rot: [0, 0, -0.2] },
    { type: 'box', pos: [ 0.2, 1.08, -0.02], size: [0.22, 0.16, 0.26], rot: [0, 0,  0.2] },
  ]},
  lats:       { color: '#7C8CFF', shapes: [
    { type: 'box', pos: [-0.30, 0.55, -0.28], size: [0.28, 0.50, 0.22], rot: [0, 0, -0.12] },
    { type: 'box', pos: [ 0.30, 0.55, -0.28], size: [0.28, 0.50, 0.22], rot: [0, 0,  0.12] },
  ]},
  lowerback:  { color: '#FFA057', shapes: [
    { type: 'box', pos: [-0.12, 0.18, -0.32], size: [0.18, 0.32, 0.14] },
    { type: 'box', pos: [ 0.12, 0.18, -0.32], size: [0.18, 0.32, 0.14] },
  ]},
  quads:      { color: '#FF3D6E', shapes: [
    { type: 'capsule', pos: [-0.22, -0.45, 0.08], size: [0.20, 0.58] },
    { type: 'capsule', pos: [ 0.22, -0.45, 0.08], size: [0.20, 0.58] },
  ]},
  hamstrings: { color: '#9CFF4A', shapes: [
    { type: 'capsule', pos: [-0.22, -0.45, -0.14], size: [0.17, 0.58] },
    { type: 'capsule', pos: [ 0.22, -0.45, -0.14], size: [0.17, 0.58] },
  ]},
  glutes:     { color: '#FFB020', shapes: [
    { type: 'sphere', pos: [-0.22, -0.12, -0.24], size: [0.26] },
    { type: 'sphere', pos: [ 0.22, -0.12, -0.24], size: [0.26] },
  ]},
  calves:     { color: '#A0E9FF', shapes: [
    { type: 'capsule', pos: [-0.22, -1.12, -0.04], size: [0.14, 0.36] },
    { type: 'capsule', pos: [ 0.22, -1.12, -0.04], size: [0.14, 0.36] },
  ]},
}

const SKIN: Shape[] = [
  { type: 'sphere',  pos: [0, 1.42, 0],       size: [0.26] },
  { type: 'capsule', pos: [0, 1.18, 0],        size: [0.10, 0.10] },
  { type: 'box',     pos: [0, 0.70, 0],        size: [0.88, 0.80, 0.42] },
  { type: 'box',     pos: [0, 0.18, 0],        size: [0.64, 0.30, 0.38] },
  { type: 'sphere',  pos: [-0.22, -0.08, 0],   size: [0.24] },
  { type: 'sphere',  pos: [ 0.22, -0.08, 0],   size: [0.24] },
  { type: 'capsule', pos: [-0.58, 0.55, 0],    size: [0.13, 0.48] },
  { type: 'capsule', pos: [ 0.58, 0.55, 0],    size: [0.13, 0.48] },
  { type: 'capsule', pos: [-0.62, 0.06, 0],    size: [0.11, 0.40] },
  { type: 'capsule', pos: [ 0.62, 0.06, 0],    size: [0.11, 0.40] },
  { type: 'sphere',  pos: [-0.64, -0.18, 0],   size: [0.09] },
  { type: 'sphere',  pos: [ 0.64, -0.18, 0],   size: [0.09] },
  { type: 'capsule', pos: [-0.22, -0.48, 0],   size: [0.20, 0.60] },
  { type: 'capsule', pos: [ 0.22, -0.48, 0],   size: [0.20, 0.60] },
  { type: 'capsule', pos: [-0.22, -1.14, 0],   size: [0.15, 0.42] },
  { type: 'capsule', pos: [ 0.22, -1.14, 0],   size: [0.15, 0.42] },
  { type: 'sphere',  pos: [-0.22, -1.42, 0.08],size: [0.13] },
  { type: 'sphere',  pos: [ 0.22, -1.42, 0.08],size: [0.13] },
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
  height = 380,
}: MuscleFigure3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    root: null as THREE.Group | null,
    muscleMeshes: {} as Record<string, THREE.Group>,
    accentLight: null as THREE.PointLight | null,
    ground: null as THREE.Mesh | null,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    rotY: 0, targetRotY: 0,
    rotX: -0.02, targetRotX: -0.02,
    cameraDist: 4.0, targetCameraDist: 4.0,
    dragging: false, dragMoved: false, lastX: 0, lastY: 0,
    idleTimer: 0,
    hovered: null as string | null,
    raf: null as number | null,
    ro: null as ResizeObserver | null,
  })

  // Keep latest props accessible in animation loop via ref
  const propsRef = useRef({ categoryFreq, selectedCategory })
  useEffect(() => { propsRef.current = { categoryFreq, selectedCategory } }, [categoryFreq, selectedCategory])

  useEffect(() => {
    const s = stateRef.current
    const mount = mountRef.current
    if (!mount) return
    let cancelled = false

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-accent').trim() || '#FF7A1F'

    const w = mount.clientWidth
    const h = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x060608, 5, 9)

    // Camera
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 50)
    camera.position.set(0, 0.1, 4.0)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    // Lighting
    scene.add(new THREE.AmbientLight(0x5566aa, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(2, 3, 4)
    key.castShadow = true
    key.shadow.mapSize.width = 1024
    key.shadow.mapSize.height = 1024
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 15
    key.shadow.camera.left = -2
    key.shadow.camera.right = 2
    key.shadow.camera.top = 3
    key.shadow.camera.bottom = -2
    key.shadow.bias = -0.0005
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x88aaff, 0.9)
    rim.position.set(-3, 1, -2)
    scene.add(rim)
    const accentLight = new THREE.PointLight(new THREE.Color(accentColor), 2.0, 6)
    accentLight.position.set(0, 0.5, 2.5)
    scene.add(accentLight)
    s.accentLight = accentLight

    // Ground glow
    const groundMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accentColor), transparent: true, opacity: 0.12 })
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.62
    scene.add(ground)
    s.ground = ground

    // Root group
    const root = new THREE.Group()
    scene.add(root)
    s.root = root

    function buildMesh(shape: Shape, mat: THREE.Material): THREE.Mesh {
      let geom: THREE.BufferGeometry
      if (shape.type === 'sphere') {
        geom = new THREE.SphereGeometry(shape.size[0], 20, 20)
      } else if (shape.type === 'box') {
        geom = new THREE.BoxGeometry(shape.size[0], shape.size[1] ?? 1, shape.size[2] ?? 1)
      } else {
        geom = new THREE.CapsuleGeometry(shape.size[0], shape.size[1] ?? 0.5, 8, 18)
      }
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(shape.pos[0], shape.pos[1], shape.pos[2])
      if (shape.rot) mesh.rotation.set(shape.rot[0], shape.rot[1], shape.rot[2])
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    }

    // Skin
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x1a1d28, roughness: 0.6, metalness: 0.25, emissive: 0x0b0d14, emissiveIntensity: 0.5 })
    SKIN.forEach(shape => root.add(buildMesh(shape, skinMat)))

    // Muscle groups
    const muscleMeshes: Record<string, THREE.Group> = {}
    Object.entries(MUSCLE_DEFS).forEach(([key, def]) => {
      const col = new THREE.Color(def.color)
      const mat = new THREE.MeshStandardMaterial({
        color: col.clone().multiplyScalar(0.35),
        roughness: 0.45, metalness: 0.4,
        emissive: col.clone().multiplyScalar(0.15),
        emissiveIntensity: 0.6,
      })
      const group = new THREE.Group()
      group.userData.muscleKey = key
      group.userData.baseColor = col
      group.userData.material = mat
      def.shapes.forEach(shape => {
        const m = buildMesh(shape, mat)
        m.userData.muscleKey = key
        group.add(m)
      })
      root.add(group)
      muscleMeshes[key] = group
    })
    s.muscleMeshes = muscleMeshes
    s.scene = scene
    s.camera = camera
    s.renderer = renderer

    // Pointer events
    const el = renderer.domElement
    el.style.touchAction = 'none'
    el.style.cursor = 'grab'

    const getPtr = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      s.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      s.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    const onDown = (e: PointerEvent) => {
      getPtr(e); s.dragging = true; s.dragMoved = false; s.lastX = e.clientX; s.lastY = e.clientY; s.idleTimer = 0
    }
    const onMove = (e: PointerEvent) => {
      getPtr(e)
      if (s.dragging) {
        const dx = e.clientX - s.lastX; const dy = e.clientY - s.lastY
        if (Math.abs(dx) + Math.abs(dy) > 3) s.dragMoved = true
        s.targetRotY += dx * 0.01
        s.targetRotX = Math.max(-0.7, Math.min(0.7, s.targetRotX + dy * 0.005))
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
        const muscleKey = hits[0]?.object?.userData?.muscleKey as string | undefined
        const cat = muscleKey ? MUSCLE_TO_CATEGORY[muscleKey] ?? null : null
        onCategorySelect(cat === propsRef.current.selectedCategory ? null : cat)
      }
      s.dragging = false
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointerleave', () => { s.dragging = false; s.hovered = null })

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight
      if (w > 0 && h > 0) { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix() }
    })
    ro.observe(mount)
    s.ro = ro

    // Render loop
    const clock = new THREE.Clock()
    const animate = () => {
      if (cancelled) return
      const dt = clock.getDelta()
      const t = clock.getElapsedTime()
      const { categoryFreq: freq, selectedCategory: selCat } = propsRef.current

      s.idleTimer += dt
      if (!s.dragging && s.idleTimer > 2.5) s.targetRotY += dt * 0.15

      s.rotY += (s.targetRotY - s.rotY) * Math.min(1, dt * 6)
      s.rotX += (s.targetRotX - s.rotX) * Math.min(1, dt * 6)
      root.rotation.y = s.rotY
      root.rotation.x = s.rotX

      s.cameraDist += (s.targetCameraDist - s.cameraDist) * Math.min(1, dt * 3)
      camera.position.z = s.cameraDist
      root.position.y = Math.sin(t * 1.4) * 0.012

      // Update muscle materials
      Object.entries(s.muscleMeshes).forEach(([key, group]) => {
        const mat = group.userData.material as THREE.MeshStandardMaterial
        const base = group.userData.baseColor as THREE.Color
        const cat = MUSCLE_TO_CATEGORY[key]
        const catFreq = cat ? (freq[cat] || 0) : 0
        const trainIntensity = Math.min(catFreq / 8, 1)
        const isSel = cat ? cat === selCat : false
        const isHov = s.hovered === key

        let targetEmit = trainIntensity > 0 ? 0.4 + trainIntensity * 0.5 : 0.2
        let targetColScale = trainIntensity > 0 ? 0.25 + trainIntensity * 0.4 : 0.18

        if (isSel) {
          targetEmit = 1.6 + Math.sin(t * 4) * 0.4
          targetColScale = 0.9
        } else if (isHov) {
          targetEmit = 1.1
          targetColScale = 0.7
        } else if (selCat) {
          targetEmit = Math.max(0.1, targetEmit * 0.3)
          targetColScale = Math.max(0.08, targetColScale * 0.35)
        }

        mat.emissiveIntensity += (targetEmit - mat.emissiveIntensity) * Math.min(1, dt * 8)
        mat.color.lerp(base.clone().multiplyScalar(targetColScale), Math.min(1, dt * 8))
        mat.emissive.lerp(base.clone().multiplyScalar(Math.min(1, targetEmit * 0.5)), Math.min(1, dt * 8))
      })

      const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF7A1F'
      s.accentLight!.color.lerp(new THREE.Color(currentAccent), Math.min(1, dt * 4))
      s.accentLight!.intensity = 1.6 + Math.sin(t * 1.5) * 0.3
      ;(s.ground!.material as THREE.MeshBasicMaterial).color.lerp(new THREE.Color(currentAccent), Math.min(1, dt * 4))
      s.targetCameraDist = selCat ? 3.3 : 4.0

      renderer.render(scene, camera)
      s.raf = requestAnimationFrame(animate)
    }
    s.raf = requestAnimationFrame(animate)
    setLoaded(true)

    return () => {
      cancelled = true
      if (s.raf) cancelAnimationFrame(s.raf)
      if (s.ro) s.ro.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
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
          color: 'var(--theme-text-muted)',
          fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'var(--theme-font-mono, monospace)',
        }}>
          Loading…
        </div>
      )}
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.6) 100%)',
      }} />
    </div>
  )
}
