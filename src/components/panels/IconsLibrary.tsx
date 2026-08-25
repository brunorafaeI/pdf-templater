import React, { useMemo, useState } from 'react'
import {
  LucideIconComponent,
  LUCIDE_ICON_NAMES,
  type LucideIconName,
} from '@/components/icon'

const MAX_VISIBLE = 120

interface IconsLibraryProps {
  onPick: (iconName: LucideIconName) => void
}

const IconsLibrary: React.FC<IconsLibraryProps> = ({ onPick }) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? LUCIDE_ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
      : LUCIDE_ICON_NAMES
    return list.slice(0, MAX_VISIBLE)
  }, [query])

  const totalMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LUCIDE_ICON_NAMES.length
    return LUCIDE_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(q)
    ).length
  }, [query])

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="flex items-center gap-2 bg-slate-700 p-2 rounded">
        <LucideIconComponent
          icon="Search"
          size={14}
          className="text-gray-400 shrink-0"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-gray-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-gray-400 hover:text-white"
            title="Clear"
          >
            <LucideIconComponent icon="X" size={14} />
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400">
        {totalMatches === 0
          ? 'No icons found'
          : totalMatches > MAX_VISIBLE
            ? `Showing ${filtered.length} of ${totalMatches}`
            : `${totalMatches} icons`}
      </p>

      <div className="grid grid-cols-4 gap-2 overflow-y-auto flex-1 content-start pr-0.5">
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onPick(name)}
            className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex flex-col items-center justify-center gap-1 p-1.5 transition-colors group"
          >
            <LucideIconComponent
              icon={name}
              size={22}
              className="text-gray-200 group-hover:text-white transition-colors"
            />
            <span className="text-[8px] text-slate-400 group-hover:text-slate-300 truncate w-full text-center leading-tight">
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default IconsLibrary
