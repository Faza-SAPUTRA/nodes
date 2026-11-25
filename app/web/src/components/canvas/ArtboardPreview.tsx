import { useEffect, useRef, useState } from 'react'
import { ARTBOARD_H, ARTBOARD_W, type CanvasLayer } from '../../store/canvasStore'

interface ArtboardPreviewProps {
  layers: CanvasLayer[]
  emptyMessage?: string
}

/**
 * Renders Canvas Praktik layers responsively at the exact 480x400 artboard aspect ratio.
 * Scales smoothly to fit Desktop, Tablet, or Mobile review viewports in CollabPage.
 */
export default function ArtboardPreview({ layers, emptyMessage }: ArtboardPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    function updateScale() {
      if (!wrapperRef.current) return
      const width = wrapperRef.current.clientWidth
      if (width > 0) setScale(width / ARTBOARD_W)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const visibleLayers = layers.filter(l => l.visible)

  return (
    <div
      ref={wrapperRef}
      className="relative w-full bg-white overflow-hidden select-none"
      style={{ aspectRatio: `${ARTBOARD_W} / ${ARTBOARD_H}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: ARTBOARD_W,
          height: ARTBOARD_H,
          transform: `scale(${scale})`,
        }}
      >
        {visibleLayers.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center p-6 text-center">
            <p className="text-xs text-ink-5 max-w-[260px] leading-relaxed">
              {emptyMessage || 'Artboard masih kosong. Tambahkan Frame, Text, atau Path di Canvas Praktik.'}
            </p>
          </div>
        ) : (
          visibleLayers.map((layer, index) => {
            if (layer.type === 'Path' && layer.points) {
              const pathD = layer.points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ')

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
                    zIndex: index + 1,
                    pointerEvents: 'none',
                  }}
                >
                  <svg width={layer.w} height={layer.h} style={{ overflow: 'visible' }}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={layer.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                  borderRadius: layer.type === 'Ellipse' ? '9999px' : (layer.borderRadius || 0),
                  opacity: (layer.opacity ?? 100) / 100,
                  display: 'flex',
                  alignItems: layer.type === 'Text' ? 'center' : undefined,
                  overflow: 'hidden',
                  zIndex: index + 1,
                  pointerEvents: 'none',
                }}
              >
                {layer.type === 'Text' && (
                  <span
                    style={{
                      color: layer.color,
                      fontSize: layer.fontSize || 16,
                      fontWeight: (layer.fontSize || 16) >= 20 ? 700 : 500,
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {layer.text || 'Text'}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
