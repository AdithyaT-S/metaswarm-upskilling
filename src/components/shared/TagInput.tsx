'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add tag…',
  className,
}: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = input.trim()
    if (!tag) return
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setInput('')
      return
    }
    onChange([...value, tag])
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className={cn('flex flex-wrap gap-1 rounded-md border p-2', className)}>
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 rounded-full hover:bg-gray-200"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        className="min-w-[100px] flex-1 border-0 p-0 focus-visible:ring-0"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
