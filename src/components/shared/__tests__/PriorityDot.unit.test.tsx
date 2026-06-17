import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriorityDot } from '@/components/shared/PriorityDot'

describe('PriorityDot', () => {
  it('renders for "Low" — has gray color class', () => {
    const { container } = render(<PriorityDot priority="Low" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
    expect(dot!.className).toMatch(/gray/)
  })

  it('renders for "Medium" — has amber color class', () => {
    const { container } = render(<PriorityDot priority="Medium" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
    expect(dot!.className).toMatch(/amber/)
  })

  it('renders for "High" — has orange color class', () => {
    const { container } = render(<PriorityDot priority="High" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
    expect(dot!.className).toMatch(/orange/)
  })

  it('renders for "Urgent" — has red color class', () => {
    const { container } = render(<PriorityDot priority="Urgent" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
    expect(dot!.className).toMatch(/red/)
  })

  it('renders the priority text label when showLabel=true', () => {
    render(<PriorityDot priority="High" showLabel={true} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('does not render text label when showLabel=false (default)', () => {
    render(<PriorityDot priority="High" />)
    expect(screen.queryByText('High')).not.toBeInTheDocument()
  })
})
