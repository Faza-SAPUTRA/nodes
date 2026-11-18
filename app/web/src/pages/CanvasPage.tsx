import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MousePointer2, Square, Type, Hand, Pen, Plus, Layers, Save, ZoomIn, ZoomOut, ChevronRight, X, Trash2 } from 'lucide-react'
import { useToast } from '../components/ui/Toast'

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'frame', icon: Square, label: 'Frame' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'hand', icon: Hand, label: 'Hand' },
  { id: 'pen', icon: Pen, label: 'Pen' },
]

const templates = ['Kosong', 'Wireframe', 'Mobile App']

const defaultLayers = [
  { id: 1, name: 'Header Frame', type: 'Frame', visible: true },
  { id: 2, name: 'Logo Text', type: 'Text', visible: true },
  { id: 3, name: 'Hero Rectangle', type: 'Rectangle', visible: true },
  { id: 4, name: 'CTA Button', type: 'Frame', visible: false },
]

interface ProjectItem {
  id: number
  name: string
  date: string
  color: string
}

export default function CanvasPage() {
  const [activeTool, setActiveTool] = useState('select')
  const [showNewModal, setShowNewModal] = useState(false)
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: 1, name: 'Landing Page Redesign', date: '2 jam lalu', color: 'bg-teal-600' },
    { id: 2, name: 'Wireframe Dashboard', date: 'Kemarin', color: 'bg-blue-500' },
    { id: 3, name: 'Color Palette Study', date: '3 hari lalu', color: 'bg-purple-500' },
  ])
  const [activeProject, setActiveProject] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [layers, setLayers] = useState(defaultLayers)
  const [selectedLayer, setSelectedLayer] = useState(1)
  const [showSidebar, setShowSidebar] = useState(true)

  // Properties per layer
  const [layerProps, setLayerProps] = useState<Record<number, { x: number; y: number; w: number; h: number; color: string }>>({
    1: { x: 0, y: 0, w: 480, h: 48, color: '#0F172A' },
    2: { x: 16, y: 12, w: 80, h: 24, color: '#0D9488' },
    3: { x: 24, y: 60, w: 432, h: 200, color: '#F1F5F9' },
    4: { x: 24, y: 270, w: 120, h: 36, color: '#0D9488' },
  })

  // New project modal state
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [nameError, setNameError] = useState('')

  const { success, warning } = useToast()

  const currentProps = layerProps[selectedLayer] || { x: 0, y: 0, w: 100, h: 100, color: '#0D9488' }

  function updateLayerProp(key: string, value: number | string) {
    setLayerProps((prev) => ({
      ...prev,
      [selectedLayer]: { ...prev[selectedLayer], [key]: value },
    }))
  }

  function handleCreateProject() {
    if (!newProjectName.trim()) {
      setNameError('Nama proyek wajib diisi')
      return
    }

    const colors = ['bg-teal-600', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500']
    const newProject: ProjectItem = {
      id: Date.now(),
      name: newProjectName.trim(),
      date: 'Baru saja',
      color: colors[Math.floor(Math.random() * colors.length)],
    }

    setProjects((prev) => [newProject, ...prev])
    setActiveProject(newProject.id)
    setShowNewModal(false)
    setNewProjectName('')
    setSelectedTemplate(0)
    setNameError('')
    success('Proyek Dibuat! 🎉', `"${newProject.name}" berhasil dibuat dengan template ${templates[selectedTemplate]}.`)
  }

  function handleDeleteLayer() {
    if (layers.length <= 1) {
      warning('Tidak bisa dihapus', 'Minimal harus ada 1 layer.')
      return
    }

    const layerName = layers.find((l) => l.id === selectedLayer)?.name
    setLayers((prev) => prev.filter((l) => l.id !== selectedLayer))
    setLayerProps((prev) => {
      const next = { ...prev }
      delete next[selectedLayer]
      return next
    })

    // Select next available layer
    const remaining = layers.filter((l) => l.id !== selectedLayer)
    if (remaining.length > 0) setSelectedLayer(remaining[0].id)

    success('Layer Dihapus', `"${layerName}" berhasil dihapus.`)
  }

  function handleSave() {
    success('Tersimpan! 💾', 'Proyek berhasil disimpan.')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] -m-6 -mt-0">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-ink-7">
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                activeTool === t.id ? 'bg-teal-50 text-teal-600' : 'text-ink-4 hover:bg-ink-9 hover:text-ink-3'
              }`}
              title={t.label}
            >
              <t.icon className="w-[18px] h-[18px]" strokeWidth={activeTool === t.id ? 2.2 : 1.8} />
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-ink text-white text-[0.5625rem] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {t.label}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-ink-9 rounded-lg px-1">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1.5 text-ink-4 hover:text-ink"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-xs font-medium text-ink-4 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 text-ink-4 hover:text-ink"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Projects */}
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
                  onClick={() => setActiveProject(p.id)}
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
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative bg-[#f8f9fb] overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, var(--color-ink-6) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-3 left-3 z-10 w-8 h-8 bg-white border border-ink-7 rounded-lg flex items-center justify-center text-ink-4 hover:text-ink shadow-sm"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
          </button>

          {/* Demo elements on canvas */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${zoom / 100})` }}>
            <div className="relative w-[480px] h-[320px] bg-white rounded-2xl shadow-xl border border-ink-7 overflow-hidden">
              {/* Demo header */}
              <div className="h-12 bg-ink flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-ink-2 rounded-lg" />
                </div>
              </div>
              {/* Demo content */}
              <div className="p-6">
                <div className="w-24 h-3 bg-teal-600 rounded mb-3" />
                <div className="w-48 h-4 bg-ink-7 rounded mb-2" />
                <div className="w-40 h-4 bg-ink-7 rounded mb-6" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-teal-50 rounded-lg border border-teal-200" />
                  <div className="h-20 bg-blue-50 rounded-lg border border-blue-200" />
                  <div className="h-20 bg-purple-50 rounded-lg border border-purple-200" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="px-4 py-2 bg-teal-600 rounded-lg" />
                  <div className="px-4 py-2 border border-ink-6 rounded-lg" />
                </div>
              </div>
              {/* Selection handle */}
              <div className="absolute top-11 left-5 right-5 bottom-5 border-2 border-teal-500 rounded-xl pointer-events-none">
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-teal-500 rounded-sm" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-teal-500 rounded-sm" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-teal-500 rounded-sm" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-teal-500 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Layers + Properties */}
        <div className="w-56 flex-shrink-0 bg-white border-l border-ink-7 overflow-y-auto hidden lg:block">
          {/* Layers */}
          <div className="p-3 border-b border-ink-7">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-ink-5 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" /> Layers
            </h3>
            <div className="space-y-0.5">
              {layers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLayer(l.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                    selectedLayer === l.id ? 'bg-teal-50 text-teal-700' : 'text-ink-4 hover:bg-ink-9'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedLayer === l.id ? 'border-teal-600 bg-teal-100' : 'border-ink-6'
                  }`}>
                    {l.type === 'Text' && <Type className="w-2.5 h-2.5" />}
                    {l.type === 'Frame' && <Square className="w-2.5 h-2.5" />}
                    {l.type === 'Rectangle' && <div className="w-2 h-1.5 bg-current rounded-sm" />}
                  </div>
                  <span className="truncate font-medium">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div className="p-3">
            <h3 className="text-xs font-bold text-ink-5 uppercase tracking-wider mb-3">Properti</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'X', value: currentProps.x, key: 'x' },
                  { label: 'Y', value: currentProps.y, key: 'y' },
                  { label: 'W', value: currentProps.w, key: 'w' },
                  { label: 'H', value: currentProps.h, key: 'h' },
                ].map((p) => (
                  <div key={p.label}>
                    <label className="text-[0.5625rem] text-ink-5 font-medium">{p.label}</label>
                    <input
                      type="number"
                      value={p.value}
                      onChange={(e) => updateLayerProp(p.key, Number(e.target.value))}
                      className="w-full mt-0.5 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink outline-none focus:border-teal-600 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[0.5625rem] text-ink-5 font-medium">Warna</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input type="color" value={currentProps.color} onChange={(e) => updateLayerProp('color', e.target.value)} className="w-8 h-8 rounded-lg border border-ink-7 cursor-pointer" />
                  <input
                    type="text"
                    value={currentProps.color}
                    onChange={(e) => updateLayerProp('color', e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-ink-9 border border-ink-7 rounded-lg text-xs text-ink font-mono outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleDeleteLayer}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Hapus Layer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
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
                    {templates.map((t, i) => (
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
