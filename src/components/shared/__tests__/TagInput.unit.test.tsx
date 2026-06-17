import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagInput } from '@/components/shared/TagInput'

describe('TagInput', () => {
  it('renders existing tags from value prop', () => {
    render(<TagInput value={['alpha', 'beta']} onChange={vi.fn()} />)
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })

  it('Enter key adds a new tag', () => {
    const onChange = vi.fn()
    render(<TagInput value={['alpha']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'gamma' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['alpha', 'gamma'])
  })

  it('comma key adds a new tag', () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'delta' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).toHaveBeenCalledWith(['delta'])
  })

  it('clicking × on a tag removes it (calls onChange without that tag)', () => {
    const onChange = vi.fn()
    render(<TagInput value={['alpha', 'beta']} onChange={onChange} />)
    // Find all remove buttons and click the first one (removes 'alpha')
    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(['beta'])
  })

  it('duplicate tag (case-insensitive) is silently ignored', () => {
    const onChange = vi.fn()
    render(<TagInput value={['alpha']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ALPHA' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
