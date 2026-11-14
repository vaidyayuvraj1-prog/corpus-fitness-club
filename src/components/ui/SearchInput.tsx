import React from 'react'
import { Search, X } from 'lucide-react'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white text-[#171717] placeholder-gray-400 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-gray-400 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
