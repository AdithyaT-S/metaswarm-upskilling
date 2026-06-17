import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchInput } from '@/components/shared/SearchInput'

describe('SearchInput', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a search icon', () => {
    const { container } = render(<SearchInput onChange={vi.fn()} />)
    // Search icon is an SVG rendered by lucide-react
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('onChange NOT called immediately on typing', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<SearchInput onChange={onChange} debounceMs={300} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(onChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('onChange called after fake timer advances by debounceMs', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<SearchInput onChange={onChange} debounceMs={300} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    act(() => { vi.advanceTimersByTime(300) })
    expect(onChange).toHaveBeenCalledWith('hello')
    vi.useRealTimers()
  })

  it('onChange NOT called again if another keystroke resets the timer', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<SearchInput onChange={onChange} debounceMs={300} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hel' } })
    act(() => { vi.advanceTimersByTime(200) })
    fireEvent.change(input, { target: { value: 'hello' } })
    act(() => { vi.advanceTimersByTime(200) })
    // Only 200ms have passed since last keystroke — should NOT fire yet
    expect(onChange).not.toHaveBeenCalled()
    // Advance remaining time
    act(() => { vi.advanceTimersByTime(100) })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('hello')
    vi.useRealTimers()
  })
})
