import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Square, Type, Hand, Pen, Plus, Layers, Save,
  ZoomIn, ZoomOut, ChevronRight, X, Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown,
  Undo2, Redo2, Lock, Unlock,
} from 'lucide-react'
import { useToast } from '../components/ui/Toast'

/* ─── Types ─── */
interface Layer {
  id: number
  name: string
  type: 'Frame' | 'Text' | 'Rectangle' | 'Ellipse' | 'Path'
  visible: boolean
  locked: boolean
  x: number
  y: number
  w: number
  h: number
  color: string
  text?: string
  fontSize?: number
  borderRadius?: number
  opacity?: number
  // For pen tool paths
  points?: { x: number; y: number }[]
}

interface ProjectItem {
  id: number
  name: string
  date: string
  color: string
  layers: Layer[]
}

type ToolId = 'select' | 'frame' | 'text' | 'hand' | 'pen'

const tools: { id: ToolId; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'frame', icon: Square, label: 'Frame', shortcut: 'F' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
]

const templateNames = ['Kosong', 'Wireframe', 'Mobile App']

let nextLayerId = 100

function getDefaultLayers(): Layer[] {
  return [
    { id: 1, name: 'Header Frame', type: 'Frame', visible: true, locked: false, x: 0, y: 0, w: 480, h: 48, color: '#0F172A', borderRadius: 0, opacity: 100 },
    { id: 2, name: 'Logo Text', type: 'Text', visible: true, locked: false, x: 16, y: 10, w: 80, h: 28, color: '#0D9488', text: 'nodes.', fontSize: 18, borderRadius: 0, opacity: 100 },
    { id: 3, name: 'Hero Section', type: 'Frame', visible: true, locked: false, x: 0, y: 48, w: 480, h: 160, color: '#F1F5F9', borderRadius: 0, opacity: 100 },
    { id: 4, name: 'CTA Button', type: 'Frame', visible: true, locked: false, x: 24, y: 180, w: 120, h: 36, color: '#0D9488', borderRadius: 8, opacity: 100 },
    { id: 5, name: 'Heading', type: 'Text', visible: true, locked: false, x: 24, y: 72, w: 300, h: 32, color: '#0F172A', text: 'Design System', fontSize: 24, borderRadius: 0, opacity: 100 },
    { id: 6, name: 'Subtitle', type: 'Text', visible: true, locked: false, x: 24, y: 112, w: 400, h: 20, color: '#64748B', text: 'Build consistent, beautiful interfaces.', fontSize: 14, borderRadius: 0, opacity: 100 },
    { id: 7, name: 'Card 1', type: 'Frame', visible: true, locked: false, x: 24, y: 240, w: 140, h: 80, color: '#ECFDF5', borderRadius: 12, opacity: 100 },
    { id: 8, name: 'Card 2', type: 'Frame', visible: true, locked: false, x: 172, y: 240, w: 140, h: 80, color: '#EFF6FF', borderRadius: 12, opacity: 100 },
    { id: 9, name: 'Card 3', type: 'Frame', visible: true, locked: false, x: 320, y: 240, w: 140, h: 80, color: '#FDF4FF', borderRadius: 12, opacity: 100 },
  ]
}

function getWireframeLayers(): Layer[] {
  return [
    { id: 10, name: 'Nav Bar', type: 'Frame', visible: true, locked: false, x: 0, y: 0, w: 480, h: 40, color: '#E2E8F0', borderRadius: 0, opacity: 100 },
    { id: 11, name: 'Nav Title', type: 'Text', visible: true, locked: false, x: 16, y: 8, w: 100, h: 24, color: '#94A3B8', text: 'Logo', fontSize: 16, borderRadius: 0, opacity: 100 },
    { id: 12, name: 'Content Area', type: 'Frame', visible: true, locked: false, x: 24, y: 56, w: 432, h: 200, color: '#F1F5F9', borderRadius: 8, opacity: 100 },
    { id: 13, name: 'Sidebar', type: 'Frame', visible: true, locked: false, x: 24, y: 272, w: 200, h: 120, color: '#F1F5F9', borderRadius: 8, opacity: 100 },
    { id: 14, name: 'Main Content', type: 'Frame', visible: true, locked: false, x: 240, y: 272, w: 216, h: 120, color: '#F8FAFC', borderRadius: 8, opacity: 100 },
  ]
}

function getMobileAppLayers(): Layer[] {
  return [
    { id: 20, name: 'Status Bar', type: 'Frame', visible: true, locked: false, x: 0, y: 0, w: 375, h: 44, color: '#0F172A', borderRadius: 0, opacity: 100 },
    { id: 21, name: 'App Header', type: 'Frame', visible: true, locked: false, x: 0, y: 44, w: 375, h: 56, color: '#FFFFFF', borderRadius: 0, opacity: 100 },
    { id: 22, name: 'App Title', type: 'Text', visible: true, locked: false, x: 16, y: 60, w: 150, h: 24, color: '#0F172A', text: 'My App', fontSize: 18, borderRadius: 0, opacity: 100 },
    { id: 23, name: 'Hero Image', type: 'Frame', visible: true, locked: false, x: 16, y: 116, w: 343, h: 180, color: '#E2E8F0', borderRadius: 16, opacity: 100 },
    { id: 24, name: 'Button Primary', type: 'Frame', visible: true, locked: false, x: 16, y: 312, w: 343, h: 48, color: '#0D9488', borderRadius: 12, opacity: 100 },
    { id: 25, name: 'Button Label', type: 'Text', visible: true, locked: false, x: 130, y: 324, w: 120, h: 24, color: '#FFFFFF', text: 'Get Started', fontSize: 16, borderRadius: 0, opacity: 100 },
    { id: 26, name: 'Bottom Nav', type: 'Frame', visible: true, locked: false, x: 0, y: 420, w: 375, h: 60, color: '#F8FAFC', borderRadius: 0, opacity: 100 },
  ]
}

const ARTBOARD_W = 480
const ARTBOARD_H = 400

/* ─── Undo History ─── */
const MAX_HISTORY = 50

/* ─── Component ─── */
export default function CanvasPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('select')
  const [showNewModal, setShowNewModal] = useState(false)

  // Projects with their own layers
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: 1, name: 'Landing Page Redesign', date: '2 jam lalu', color: 'bg-teal-600', layers: getDefaultLayers() },
    { id: 2, name: 'Wireframe Dashboard', date: 'Kemarin', color: 'bg-blue-500', layers: getWireframeLayers() },
    { id: 3, name: 'Color Palette Study', date: '3 hari lalu', color: 'bg-purple-500', layers: getMobileAppLayers() },
  ])
  const [activeProject, setActiveProject] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [selectedLayer, setSelectedLayer] = useState<number | null>(1)
  const [showSidebar, setShowSidebar] = useState(true)

  // Get current project's layers
  const currentProject = projects.find(p => p.id === activeProject)
  const layers = currentProject?.layers ?? []

  function setLayers(updater: Layer[] | ((prev: Layer[]) => Layer[])) {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProject) return p
      const newLayers = typeof updater === 'function' ? updater(p.layers) : updater
      return { ...p, layers: newLayers }
    }))
  }

  // Undo/Redo history
  const [history, setHistory] = useState<Layer[][]>([getDefaultLayers()])
  const [historyIndex, setHistoryIndex] = useState(0)

  function pushHistory(newLayers: Layer[]) {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      const updated = [...trimmed, newLayers].slice(-MAX_HISTORY)
      return updated
    })
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }

  function undo() {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setLayers(history[newIndex])
  }

  function redo() {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setLayers(history[newIndex])
  }

  // Canvas interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragLayerStart, setDragLayerStart] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 })

  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Editing text
  const [editingText, setEditingText] = useState<number | null>(null)

  // Pen tool state
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[]>([])

  // New project modal state
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [nameError, setNameError] = useState('')

  // Track if mouse was actually moved during drag (to differentiate click vs drag)
  const [hasDragMoved, setHasDragMoved] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const { success, warning, info } = useToast()

  const selectedLayerData = selectedLayer !== null ? layers.find(l => l.id === selectedLayer) : null

  /* ─── Center artboard on mount ─── */
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setPanOffset({
        x: (rect.width - ARTBOARD_W) / 2,
        y: (rect.height - ARTBOARD_H) / 2,
      })
    }
  }, [])

  /* ─── Project switching ─── */
  function switchProject(projectId: number) {
    // Save doesn't need explicit action since layers are in projects state
    setActiveProject(projectId)
    setSelectedLayer(null)
    setEditingText(null)
    // Reset history for new project
    const proj = projects.find(p => p.id === projectId)
    if (proj) {
      setHistory([proj.layers])
      setHistoryIndex(0)
    }
  }

  /* ─── Keyboard shortcuts ─── */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toLowerCase()
      if (key === 'v') setActiveTool('select')
      else if (key === 'f' || key === 'r') setActiveTool('frame')
      else if (key === 't') setActiveTool('text')
      else if (key === 'h') setActiveTool('hand')
      else if (key === 'p') setActiveTool('pen')
      else if (key === 'delete' || key === 'backspace') {
        if (selectedLayer !== null && editingText === null) handleDeleteLayer()
      }
      else if ((e.ctrlKey || e.metaKey) && key === 'd') {
        e.preventDefault()
        if (selectedLayer !== null) handleDuplicate()
      }
      else if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault()
        handleSave()
      }
      else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault()
        redo()
      }
      else if (key === 'escape') {
        setSelectedLayer(null)
        setEditingText(null)
        setActiveTool('select')
        // Cancel pen drawing
        if (penPoints.length > 0) setPenPoints([])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayer, editingText, layers, historyIndex, history, penPoints])

  /* ─── Canvas mouse helpers ─── */
  function getCanvasPoint(e: React.MouseEvent): { x: number; y: number } {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = zoom / 100
    return {
      x: (e.clientX - rect.left - panOffset.x) / scale,
      y: (e.clientY - rect.top - panOffset.y) / scale,
    }
  }

  /* ─── Canvas mouse down ─── */
  function handleCanvasMouseDown(e: React.MouseEvent) {
    const point = getCanvasPoint(e)
    setHasDragMoved(false)

    // Hand tool → pan
    if (activeTool === 'hand') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    // Pen tool → add point
    if (activeTool === 'pen') {
      setPenPoints(prev => [...prev, point])
      return
    }

    // Frame/Text tool → draw new element
    if (activeTool === 'frame' || activeTool === 'text') {
      setIsDrawing(true)
      setDrawStart(point)
      setDrawCurrent(point)
      setSelectedLayer(null)
      return
    }

    // Select tool → find clicked layer (top-most first)
    if (activeTool === 'select') {
      const visibleLayers = layers.filter(l => l.visible)
      // Iterate in reverse to pick top-most layer
      for (let i = visibleLayers.length - 1; i >= 0; i--) {
        const l = visibleLayers[i]
        if (l.locked) continue // Can't select locked layers by clicking
        if (point.x >= l.x && point.x <= l.x + l.w && point.y >= l.y && point.y <= l.y + l.h) {
          setSelectedLayer(l.id)
          setIsDragging(true)
          setDragStart({ x: e.clientX, y: e.clientY })
          setDragLayerStart({ x: l.x, y: l.y, w: l.w, h: l.h })
          return
        }
      }
      // Clicked empty area
      setSelectedLayer(null)
    }
  }

  /* ─── Canvas mouse move ─── */
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const scale = zoom / 100

    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      return
    }

    if (isDragging && selectedLayer !== null) {
      const dx = (e.clientX - dragStart.x) / scale
      const dy = (e.clientY - dragStart.y) / scale
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) setHasDragMoved(true)
      setLayers(prev => prev.map(l =>
        l.id === selectedLayer
          ? { ...l, x: Math.round(dragLayerStart.x + dx), y: Math.round(dragLayerStart.y + dy) }
          : l
      ))
      return
    }

    if (isResizing && selectedLayer !== null && resizeHandle) {
      const dx = (e.clientX - dragStart.x) / scale
      const dy = (e.clientY - dragStart.y) / scale
      setHasDragMoved(true)
      setLayers(prev => prev.map(l => {
        if (l.id !== selectedLayer) return l
        const s = dragLayerStart
        let newX = s.x, newY = s.y, newW = s.w, newH = s.h
        if (resizeHandle.includes('e')) newW = Math.max(20, s.w + dx)
        if (resizeHandle.includes('s')) newH = Math.max(20, s.h + dy)
        if (resizeHandle.includes('w')) { newX = s.x + dx; newW = Math.max(20, s.w - dx) }
        if (resizeHandle.includes('n')) { newY = s.y + dy; newH = Math.max(20, s.h - dy) }
        return { ...l, x: Math.round(newX), y: Math.round(newY), w: Math.round(newW), h: Math.round(newH) }
      }))
      return
    }

    if (isDrawing) {
      // Update draw preview position
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const pt = {
        x: (e.clientX - rect.left - panOffset.x) / scale,
        y: (e.clientY - rect.top - panOffset.y) / scale,
      }
      setDrawCurrent(pt)
      return
    }
  }, [isPanning, isDragging, isResizing, isDrawing, panStart, dragStart, dragLayerStart, selectedLayer, zoom, resizeHandle, panOffset])

  /* ─── Canvas mouse up ─── */
  function handleCanvasMouseUp(e: React.MouseEvent) {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing) {
      const point = getCanvasPoint(e)
      const x = Math.min(drawStart.x, point.x)
      const y = Math.min(drawStart.y, point.y)
      const rawW = Math.abs(point.x - drawStart.x)
      const rawH = Math.abs(point.y - drawStart.y)
      const w = Math.max(rawW, 60)
      const h = Math.max(rawH, activeTool === 'text' ? 28 : 40)

      const newId = nextLayerId++
      const newLayer: Layer = {
        id: newId,
        name: activeTool === 'text' ? `Text ${newId}` : `Frame ${newId}`,
        type: activeTool === 'text' ? 'Text' : 'Frame',
        visible: true,
        locked: false,
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
        color: activeTool === 'text' ? '#0F172A' : '#E2E8F0',
        text: activeTool === 'text' ? 'Text' : undefined,
        fontSize: activeTool === 'text' ? 16 : undefined,
        borderRadius: activeTool === 'frame' ? 8 : 0,
        opacity: 100,
      }

      const newLayers = [...layers, newLayer]
      setLayers(newLayers)
      pushHistory(newLayers)
      setSelectedLayer(newId)
      setIsDrawing(false)
      setActiveTool('select')

      if (activeTool === 'text') {
        setTimeout(() => setEditingText(newId), 100)
      }

      info('Layer Dibuat', `"${newLayer.name}" berhasil ditambahkan.`)
      return
    }

    // Push history after drag/resize
    if ((isDragging || isResizing) && hasDragMoved) {
      pushHistory(layers)
    }

    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  /* ─── Finish pen path ─── */
  function finishPenPath() {
    if (penPoints.length < 2) {
      setPenPoints([])
      return
    }
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of penPoints) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    const newId = nextLayerId++
    const newLayer: Layer = {
      id: newId,
      name: `Path ${newId}`,
      type: 'Path',
      visible: true,
      locked: false,
      x: Math.round(minX),
      y: Math.round(minY),
      w: Math.max(Math.round(maxX - minX), 20),
      h: Math.max(Math.round(maxY - minY), 20),
      color: '#0F172A',
      borderRadius: 0,
      opacity: 100,
      points: penPoints.map(p => ({ x: p.x - minX, y: p.y - minY })),
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    pushHistory(newLayers)
    setSelectedLayer(newId)
    setPenPoints([])
    setActiveTool('select')
    info('Path Dibuat', `"${newLayer.name}" berhasil ditambahkan.`)
  }

  /* ─── Resize handle mouse down ─── */
  function handleResizeStart(e: React.MouseEvent, handle: string) {
    e.stopPropagation()
    if (selectedLayer === null) return
    const layer = layers.find(l => l.id === selectedLayer)
    if (!layer || layer.locked) return
    setIsResizing(true)
    setResizeHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragLayerStart({ x: layer.x, y: layer.y, w: layer.w, h: layer.h })
  }

  /* ─── Layer actions ─── */
  function handleDeleteLayer() {
    if (selectedLayer === null) return
    const layer = layers.find(l => l.id === selectedLayer)
    if (layer?.locked) {
      warning('Layer Terkunci', 'Unlock layer terlebih dahulu sebelum menghapus.')
      return
    }
    if (layers.length <= 1) {
      warning('Tidak bisa dihapus', 'Minimal harus ada 1 layer.')
      return
    }
    const layerName = layer?.name
    const idx = layers.findIndex(l => l.id === selectedLayer)
    const newLayers = layers.filter(l => l.id !== selectedLayer)
    setLayers(newLayers)
    pushHistory(newLayers)
    setSelectedLayer(newLayers[Math.min(idx, newLayers.length - 1)]?.id ?? null)
    success('Layer Dihapus', `"${layerName}" berhasil dihapus.`)
  }

  function handleDuplicate() {
    if (selectedLayer === null) return
    const original = layers.find(l => l.id === selectedLayer)
    if (!original) return
    const newId = nextLayerId++
    const clone: Layer = { ...original, id: newId, name: `${original.name} Copy`, x: original.x + 20, y: original.y + 20 }
    const newLayers = [...layers, clone]
    setLayers(newLayers)
    pushHistory(newLayers)
    setSelectedLayer(newId)
    success('Layer Diduplikasi', `"${original.name}" berhasil diduplikasi.`)
  }

  function toggleLayerVisibility(id: number) {
    const newLayers = layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l)
    setLayers(newLayers)
    if (selectedLayer === id && !layers.find(l => l.id === id)?.visible === false) {
      // If we're hiding the selected layer, don't deselect (Figma behavior)
    }
  }

  function toggleLayerLock(id: number) {
    const newLayers = layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l)
    setLayers(newLayers)
    const layer = layers.find(l => l.id === id)
    if (layer) {
      info(layer.locked ? 'Layer Unlocked' : 'Layer Locked', `"${layer.name}" ${layer.locked ? 'bisa diedit kembali' : 'tidak bisa digeser/resize'}.`)
    }
  }

  function moveLayerOrder(dir: 'up' | 'down') {
    if (selectedLayer === null) return
    const idx = layers.findIndex(l => l.id === selectedLayer)
    if (idx === -1) return
    const newIdx = dir === 'up' ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= layers.length) return
    const newLayers = [...layers]
    ;[newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]]
    setLayers(newLayers)
    pushHistory(newLayers)
  }

  function updateLayerProp<K extends keyof Layer>(key: K, value: Layer[K]) {
    if (selectedLayer === null) return
    const newLayers = layers.map(l => l.id === selectedLayer ? { ...l, [key]: value } : l)
    setLayers(newLayers)
    // Don't push history for every keystroke - only on blur/commit
  }

  function commitPropertyChange() {
    pushHistory(layers)
  }

  function handleSave() {
    success('Tersimpan! 💾', 'Proyek berhasil disimpan.')
  }

  function handleCreateProject() {
    if (!newProjectName.trim()) {
      setNameError('Nama proyek wajib diisi')
      return
    }
    const colors = ['bg-teal-600', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500']
    const templateLayers = selectedTemplate === 1 ? getWireframeLayers() : selectedTemplate === 2 ? getMobileAppLayers() : []
    const newProject: ProjectItem = {
      id: Date.now(),
      name: newProjectName.trim(),
      date: 'Baru saja',
      color: colors[Math.floor(Math.random() * colors.length)],
      layers: templateLayers,
    }
    setProjects(prev => [newProject, ...prev])
    switchProject(newProject.id)
    setShowNewModal(false)
    setNewProjectName('')
    setSelectedTemplate(0)
    setNameError('')
    success('Proyek Dibuat! 🎉', `"${newProject.name}" berhasil dibuat.`)
  }

  /* ─── Canvas cursor ─── */
  const canvasCursor = activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab')
    : activeTool === 'frame' || activeTool === 'text' ? 'crosshair'
    : activeTool === 'pen' ? 'crosshair'
    : isDragging ? 'move' : 'default'

  /* ─── Zoom with scroll ─── */
  function handleWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(prev => Math.min(300, Math.max(25, prev - Math.sign(e.deltaY) * 10)))
    } else {
      setPanOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
    }
  }

  /* ─── Draw preview rect ─── */
  const drawPreview = isDrawing ? {
    x: Math.min(drawStart.x, drawCurrent.x),
    y: Math.min(drawStart.y, drawCurrent.y),
    w: Math.abs(drawCurrent.x - drawStart.x),
    h: Math.abs(drawCurrent.y - drawStart.y),
  } : null

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 bg-white z-50">
      {/* ═══ Top toolbar ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-ink-7 shrink-0">
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id)
                if (t.id === 'pen' && penPoints.length > 1) finishPenPath()
              }}
              className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                activeTool === t.id ? 'bg-teal-50 text-teal-600' : 'text-ink-4 hover:bg-ink-9 hover:text-ink-3'
              }`}
              title={`${t.label} (${t.shortcut})`}
            >
              <t.icon className="w-[18px] h-[18px]" strokeWidth={activeTool === t.id ? 2.2 : 1.8} />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-ink text-white text-[0.5625rem] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {t.label} <kbd className="ml-1 opacity-60">{t.shortcut}</kbd>
              </div>
            </button>
          ))}
          <div className="w-px h-5 bg-ink-7 mx-1" />
          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              canUndo ? 'text-ink-4 hover:bg-ink-9 hover:text-ink' : 'text-ink-6 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              canRedo ? 'text-ink-4 hover:bg-ink-9 hover:text-ink' : 'text-ink-6 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-ink-7 mx-1" />
          <button
            onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoom(100) }}
            className="px-2 py-1 text-[0.625rem] text-ink-5 hover:text-ink hover:bg-ink-9 rounded-md transition-colors"
            title="Reset View"
          >
            Reset
          </button>
          {/* Finish pen path button */}
          {activeTool === 'pen' && penPoints.length > 1 && (
            <button
              onClick={finishPenPath}
              className="ml-1 px-2 py-1 text-[0.625rem] font-semibold text-teal-600 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors"
            >
              Selesai ({penPoints.length} titik)
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-ink-9 rounded-lg px-1">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1.5 text-ink-4 hover:text-ink"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-xs font-medium text-ink-4 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(300, zoom + 25))} className="p-1.5 text-ink-4 hover:text-ink"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ═══ Left sidebar: Projects ═══ */}
        <div className={`${showSidebar ? 'w-56' : 'w-0'} flex-shrink-0 bg-white border-r border-ink-7 overflow-hidden transition-all duration-300`}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-ink-5 uppercase tracking-wider">Proyek</h3>
              <button onClick={() => setShowNewModal(true)} className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchProject(p.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                    activeProject === p.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-ink-9'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink truncate">{p.name}</div>
                    <div className="text-[0.5625rem] text-ink-5">{p.date}</div>
                    <div className="text-[0.5rem] text-ink-6">{p.layers.length} layers</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Canvas area ═══ */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden select-none"
          style={{
            backgroundColor: '#f0f1f3',
            backgroundImage: 'radial-gradient(circle, #d4d7dd 1px, transparent 1px)',
            backgroundSize: `${20 * zoom / 100}px ${20 * zoom / 100}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            cursor: canvasCursor,
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => {
            if (isPanning) setIsPanning(false)
            if (isDragging) {
              setIsDragging(false)
              if (hasDragMoved) pushHistory(layers)
            }
            if (isResizing) {
              setIsResizing(false)
              setResizeHandle(null)
              if (hasDragMoved) pushHistory(layers)
            }
            // Don't cancel drawing on mouse leave
          }}
          onWheel={handleWheel}
        >
          {/* Toggle sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-3 left-3 z-20 w-8 h-8 bg-white border border-ink-7 rounded-lg flex items-center justify-center text-ink-4 hover:text-ink shadow-sm"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
          </button>

          {/* Drawing indicator while drawing */}
          {isDrawing && (
            <div className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg shadow-lg">
              {activeTool === 'text' ? '✏️ Text' : '□ Frame'}: {Math.round(drawPreview?.w || 0)} × {Math.round(drawPreview?.h || 0)}
            </div>
          )}

          {/* Pen tool indicator */}
          {activeTool === 'pen' && penPoints.length > 0 && (
            <div className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-lg">
              ✏️ Pen: {penPoints.length} titik — Klik untuk lanjut, tekan Enter/Esc untuk selesai
            </div>
          )}

          {/* Canvas layers (transformed group) */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* Artboard background */}
            <div
              className="bg-white shadow-[0_2px_20px_rgba(0,0,0,.08)] border border-ink-7/50"
              style={{ width: ARTBOARD_W, height: ARTBOARD_H, position: 'absolute', top: 0, left: 0 }}
            />

            {/* Render layers */}
            {layers.filter(l => l.visible).map(layer => {
              const isSelected = selectedLayer === layer.id
              const isEditing = editingText === layer.id

              // Path layer rendering
              if (layer.type === 'Path' && layer.points) {
                const pathD = layer.points.map((p, i) =>
                  `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                ).join(' ')

                return (
                  <div
                    key={layer.id}
                    style={{
                      position: 'absolute',
                      left: layer.x,
                      top: layer.y,
                      width: layer.w,
                      height: layer.h,
                      opacity: (layer.opacity ?? 100) / 100,
                      pointerEvents: activeTool === 'hand' ? 'none' : 'auto',
                      outline: isSelected ? '2px solid #0D9488' : undefined,
                      zIndex: isSelected ? 50 : undefined,
                      cursor: activeTool === 'select' && !layer.locked ? 'pointer' : undefined,
                    }}
                    onMouseDown={(e) => {
                      if (activeTool !== 'select' || layer.locked) return
                      e.stopPropagation()
                      setSelectedLayer(layer.id)
                      setIsDragging(true)
                      setDragStart({ x: e.clientX, y: e.clientY })
                      setDragLayerStart({ x: layer.x, y: layer.y, w: layer.w, h: layer.h })
                    }}
                  >
                    <svg width={layer.w} height={layer.h} style={{ overflow: 'visible' }}>
                      <path d={pathD} fill="none" stroke={layer.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )
              }

              return (
                <div
                  key={layer.id}
                  style={{
                    position: 'absolute',
                    left: layer.x,
                    top: layer.y,
                    width: layer.w,
                    height: layer.h,
                    backgroundColor: layer.type === 'Text' ? 'transparent' : layer.color,
                    borderRadius: layer.borderRadius || 0,
                    opacity: (layer.opacity ?? 100) / 100,
                    display: 'flex',
                    alignItems: layer.type === 'Text' ? 'center' : undefined,
                    overflow: 'hidden',
                    cursor: activeTool === 'select' ? (isDragging && isSelected ? 'move' : layer.locked ? 'not-allowed' : 'pointer') : undefined,
                    pointerEvents: activeTool === 'hand' ? 'none' : 'auto',
                    outline: isSelected ? '2px solid #0D9488' : undefined,
                    outlineOffset: isSelected ? '0px' : undefined,
                    zIndex: isSelected ? 50 : undefined,
                  }}
                  onMouseDown={(e) => {
                    if (activeTool !== 'select') return
                    e.stopPropagation()
                    setSelectedLayer(layer.id)
                    if (layer.locked) return // Don't allow dragging locked layers
                    setIsDragging(true)
                    setDragStart({ x: e.clientX, y: e.clientY })
                    setDragLayerStart({ x: layer.x, y: layer.y, w: layer.w, h: layer.h })
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (layer.type === 'Text' && !layer.locked) {
                      setEditingText(layer.id)
                      setSelectedLayer(layer.id)
                    }
                  }}
                >
                  {/* Text content */}
                  {layer.type === 'Text' && (
                    isEditing ? (
                      <input
                        autoFocus
                        value={layer.text || ''}
                        onChange={(e) => updateLayerProp('text', e.target.value)}
                        onBlur={() => { setEditingText(null); commitPropertyChange() }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { setEditingText(null); commitPropertyChange() } }}
                        className="w-full h-full bg-transparent outline-none border-none p-0"
                        style={{
                          color: layer.color,
                          fontSize: layer.fontSize || 16,
                          fontWeight: (layer.fontSize || 16) >= 20 ? 700 : 500,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: layer.color,
                          fontSize: layer.fontSize || 16,
                          fontWeight: (layer.fontSize || 16) >= 20 ? 700 : 500,
                          fontFamily: 'Inter, sans-serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          userSelect: 'none',
                        }}
                      >
                        {layer.text || 'Text'}
                      </span>
                    )
                  )}

                  {/* Lock indicator on locked layers */}
                  {layer.locked && isSelected && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded flex items-center gap-0.5">
                      <Lock className="w-2 h-2" /> Locked
                    </div>
                  )}
                </div>
              )
            })}

            {/* Draw preview rectangle */}
            {isDrawing && drawPreview && drawPreview.w > 0 && drawPreview.h > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: drawPreview.x,
                  top: drawPreview.y,
                  width: drawPreview.w,
                  height: drawPreview.h,
                  border: '2px dashed #0D9488',
                  borderRadius: activeTool === 'frame' ? 8 : 0,
                  backgroundColor: activeTool === 'text' ? 'rgba(13,148,136,0.05)' : 'rgba(13,148,136,0.1)',
                  pointerEvents: 'none',
                  zIndex: 60,
                }}
              />
            )}

            {/* Pen tool path preview */}
            {activeTool === 'pen' && penPoints.length > 0 && (
              <svg style={{ position: 'absolute', top: 0, left: 0, width: ARTBOARD_W, height: ARTBOARD_H, overflow: 'visible', pointerEvents: 'none', zIndex: 60 }}>
                <path
                  d={penPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {penPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill="white" stroke="#7C3AED" strokeWidth={2} />
                ))}
              </svg>
            )}

            {/* Selection handles */}
            {selectedLayerData && selectedLayerData.visible && activeTool === 'select' && !selectedLayerData.locked && (
              <>
                {/* Resize handles */}
                {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(handle => {
                  const l = selectedLayerData
                  let left = l.x, top = l.y
                  const size = 8
                  const offset = -size / 2
                  if (handle.includes('e')) left = l.x + l.w
                  else if (!handle.includes('w')) left = l.x + l.w / 2
                  if (handle.includes('s')) top = l.y + l.h
                  else if (!handle.includes('n')) top = l.y + l.h / 2

                  const cursors: Record<string, string> = {
                    nw: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', se: 'nwse-resize',
                    n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
                  }

                  return (
                    <div
                      key={handle}
                      style={{
                        position: 'absolute',
                        left: left + offset,
                        top: top + offset,
                        width: size,
                        height: size,
                        backgroundColor: 'white',
                        border: '2px solid #0D9488',
                        borderRadius: 2,
                        cursor: cursors[handle],
                        zIndex: 100,
                        pointerEvents: 'auto',
                      }}
                      onMouseDown={(e) => handleResizeStart(e, handle)}
                    />
                  )
                })}

                {/* Size label */}
                <div
                  style={{
                    position: 'absolute',
                    left: selectedLayerData.x + selectedLayerData.w / 2,
                    top: selectedLayerData.y + selectedLayerData.h + 12,
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    pointerEvents: 'none',
                  }}
                >
                  <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-bold rounded">
                    {selectedLayerData.w} × {selectedLayerData.h}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══ Right panel: Layers + Properties ═══ */}
        <div className="w-60 flex-shrink-0 bg-white border-l border-ink-7 overflow-y-auto hidden lg:flex lg:flex-col">
          {/* Layers */}
          <div className="p-3 border-b border-ink-7">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-ink-5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" /> Layers
              </h3>
              <span className="text-[9px] text-ink-5 font-medium">{layers.length}</span>
            </div>
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {[...layers].reverse().map((l) => (
                <div
                  key={l.id}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs transition-all group ${
                    selectedLayer === l.id ? 'bg-teal-50 text-teal-700' : 'text-ink-4 hover:bg-ink-9'
                  }`}
                >
                  <button
                    onClick={() => setSelectedLayer(l.id)}
                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                      selectedLayer === l.id ? 'border border-teal-600 bg-teal-100' : 'border border-ink-6'
                    }`}>
                      {l.type === 'Text' && <Type className="w-2 h-2" />}
                      {l.type === 'Frame' && <Square className="w-2 h-2" />}
                      {l.type === 'Path' && <Pen className="w-2 h-2" />}
                      {(l.type === 'Rectangle' || l.type === 'Ellipse') && <div className="w-1.5 h-1 bg-current rounded-sm" />}
                    </div>
                    <span className="truncate font-medium text-[11px]">{l.name}</span>
                  </button>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleLayerLock(l.id)}
                      className="p-0.5 hover:text-ink"
                      title={l.locked ? 'Unlock' : 'Lock'}
                    >
                      {l.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => toggleLayerVisibility(l.id)}
                      className="p-0.5 hover:text-ink"
                    >
                      {l.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          {selectedLayerData && (
            <div className="p-3 flex-1">
              <h3 className="text-xs font-bold text-ink-5 uppercase tracking-wider mb-3">Properti</h3>

              {/* Locked warning */}
              {selectedLayerData.locked && (
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 flex-shrink-0" />
                  <span>Layer terkunci. Unlock untuk mengedit posisi/ukuran.</span>
                </div>
              )}

              {/* Name */}
              <div className="mb-3">
                <label className="text-[0.5625rem] text-ink-5 font-medium block mb-0.5">Nama</label>
                <input
                  value={selectedLayerData.name}
                  onChange={(e) => updateLayerProp('name', e.target.value)}
                  onBlur={commitPropertyChange}
                  className="w-full px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors"
                />
              </div>

              {/* Position & Size */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'X', value: selectedLayerData.x, key: 'x' as const },
                  { label: 'Y', value: selectedLayerData.y, key: 'y' as const },
                  { label: 'W', value: selectedLayerData.w, key: 'w' as const },
                  { label: 'H', value: selectedLayerData.h, key: 'h' as const },
                ].map((p) => (
                  <div key={p.label}>
                    <label className="text-[0.5625rem] text-ink-5 font-medium">{p.label}</label>
                    <input
                      type="number"
                      value={p.value}
                      onChange={(e) => updateLayerProp(p.key, Number(e.target.value))}
                      onBlur={commitPropertyChange}
                      disabled={selectedLayerData.locked && (p.key === 'x' || p.key === 'y' || p.key === 'w' || p.key === 'h')}
                      className="w-full mt-0.5 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>

              {/* Border Radius */}
              {selectedLayerData.type !== 'Path' && (
                <div className="mb-3">
                  <label className="text-[0.5625rem] text-ink-5 font-medium">Radius</label>
                  <input
                    type="number"
                    value={selectedLayerData.borderRadius || 0}
                    onChange={(e) => updateLayerProp('borderRadius', Number(e.target.value))}
                    onBlur={commitPropertyChange}
                    className="w-full mt-0.5 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              )}

              {/* Opacity */}
              <div className="mb-3">
                <label className="text-[0.5625rem] text-ink-5 font-medium">Opacity</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedLayerData.opacity ?? 100}
                    onChange={(e) => updateLayerProp('opacity', Number(e.target.value))}
                    onMouseUp={commitPropertyChange}
                    className="flex-1 h-1 accent-teal-600"
                  />
                  <span className="text-[10px] text-ink-4 w-7 text-right font-mono">{selectedLayerData.opacity ?? 100}%</span>
                </div>
              </div>

              {/* Color */}
              <div className="mb-3">
                <label className="text-[0.5625rem] text-ink-5 font-medium">{selectedLayerData.type === 'Text' ? 'Warna Teks' : selectedLayerData.type === 'Path' ? 'Warna Stroke' : 'Warna'}</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input type="color" value={selectedLayerData.color} onChange={(e) => { updateLayerProp('color', e.target.value); commitPropertyChange() }} className="w-8 h-8 rounded-lg border border-ink-7 cursor-pointer" />
                  <input
                    type="text"
                    value={selectedLayerData.color}
                    onChange={(e) => updateLayerProp('color', e.target.value)}
                    onBlur={commitPropertyChange}
                    className="flex-1 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink font-mono outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>

              {/* Text-specific properties */}
              {selectedLayerData.type === 'Text' && (
                <>
                  <div className="mb-3">
                    <label className="text-[0.5625rem] text-ink-5 font-medium">Teks</label>
                    <input
                      value={selectedLayerData.text || ''}
                      onChange={(e) => updateLayerProp('text', e.target.value)}
                      onBlur={commitPropertyChange}
                      className="w-full mt-0.5 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-[0.5625rem] text-ink-5 font-medium">Font Size</label>
                    <input
                      type="number"
                      value={selectedLayerData.fontSize || 16}
                      onChange={(e) => updateLayerProp('fontSize', Number(e.target.value))}
                      onBlur={commitPropertyChange}
                      className="w-full mt-0.5 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-ink-7">
                <div className="flex gap-1">
                  <button onClick={() => moveLayerOrder('up')} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-ink-4 bg-ink-9 rounded-lg hover:bg-ink-8 transition-colors" title="Bring Forward">
                    <ArrowUp className="w-3 h-3" /> Naik
                  </button>
                  <button onClick={() => moveLayerOrder('down')} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-ink-4 bg-ink-9 rounded-lg hover:bg-ink-8 transition-colors" title="Send Backward">
                    <ArrowDown className="w-3 h-3" /> Turun
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleLayerLock(selectedLayer!)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${
                      selectedLayerData.locked ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-ink-4 bg-ink-9 hover:bg-ink-8'
                    }`}
                  >
                    {selectedLayerData.locked ? <><Lock className="w-3 h-3" /> Unlock</> : <><Unlock className="w-3 h-3" /> Lock</>}
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-ink-4 bg-ink-9 rounded-lg hover:bg-ink-8 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Duplikasi
                  </button>
                </div>
                <button
                  onClick={handleDeleteLayer}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Hapus Layer
                </button>
              </div>
            </div>
          )}

          {/* No selection */}
          {!selectedLayerData && (
            <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
              <MousePointer2 className="w-6 h-6 text-ink-5 mb-2" />
              <p className="text-xs text-ink-4">Pilih layer di canvas atau gunakan tool Frame/Text untuk membuat element baru.</p>
              <div className="mt-3 text-[9px] text-ink-5 space-y-0.5">
                <p><kbd className="px-1 py-0.5 bg-ink-8 rounded text-[8px]">V</kbd> Select</p>
                <p><kbd className="px-1 py-0.5 bg-ink-8 rounded text-[8px]">F</kbd> Frame</p>
                <p><kbd className="px-1 py-0.5 bg-ink-8 rounded text-[8px]">T</kbd> Text</p>
                <p><kbd className="px-1 py-0.5 bg-ink-8 rounded text-[8px]">P</kbd> Pen</p>
                <p><kbd className="px-1 py-0.5 bg-ink-8 rounded text-[8px]">H</kbd> Pan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Status bar ═══ */}
      <div className="flex items-center justify-between px-4 py-1 bg-white border-t border-ink-7 text-[9px] text-ink-5 shrink-0">
        <div className="flex items-center gap-3">
          <span>{layers.length} layers</span>
          <span>Zoom: {zoom}%</span>
          {selectedLayerData && <span>Selected: {selectedLayerData.name}</span>}
          {currentProject && <span>Proyek: {currentProject.name}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>V: Select · F: Frame · T: Text · P: Pen · H: Hand · Del: Hapus · Ctrl+Z: Undo · Ctrl+D: Duplikasi</span>
        </div>
      </div>

      {/* ═══ New Project Modal ═══ */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-ink">Proyek Baru</h2>
                <button onClick={() => { setShowNewModal(false); setNameError('') }} className="w-8 h-8 rounded-lg hover:bg-ink-9 flex items-center justify-center text-ink-4">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ink mb-1 block">Nama Proyek</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => { setNewProjectName(e.target.value); setNameError('') }}
                    placeholder="Contoh: Wireframe Homepage"
                    className={`w-full px-3 py-2.5 bg-ink-9 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                      nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-7 focus:border-teal-600 focus:ring-teal-600/20'
                    }`}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                  {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-ink mb-2 block">Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {templateNames.map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTemplate(i)}
                        className={`p-3 border rounded-xl text-xs font-medium text-center transition-all ${
                          selectedTemplate === i ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-ink-7 text-ink-4 hover:border-ink-6'
                        }`}
                      >
                        <div className={`w-full h-12 mb-2 rounded-lg ${selectedTemplate === i ? 'bg-teal-100' : 'bg-ink-8'}`} />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateProject}
                  className="w-full py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Buat Proyek
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
