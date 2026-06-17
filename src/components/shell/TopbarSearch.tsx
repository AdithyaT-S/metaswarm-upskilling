'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function TopbarSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push('/contacts?search=' + encodeURIComponent(query.trim()))
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Search className="absolute left-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="search"
        placeholder="Search contacts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8 w-64 h-8 text-sm bg-gray-50 border-gray-200 focus-visible:ring-indigo-600"
      />
    </form>
  )
}
