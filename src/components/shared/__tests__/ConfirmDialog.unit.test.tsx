import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

const defaultProps = {
  title: 'Delete record',
  description: 'This action cannot be undone.',
  onConfirm: vi.fn(),
  onOpenChange: vi.fn(),
}

describe('ConfirmDialog', () => {
  it('when isOpen=true: dialog content is visible (title + description)', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={true} />)
    expect(screen.getByText('Delete record')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('when isOpen=false: dialog content not visible', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Delete record')).not.toBeInTheDocument()
    expect(screen.queryByText('This action cannot be undone.')).not.toBeInTheDocument()
  })

  it('clicking confirm button calls onConfirm', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} isOpen={true} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('clicking cancel button calls onCancel when provided', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} isOpen={true} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('destructive=true: confirm button has destructive styling', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={true} destructive={true} />)
    const confirmBtn = screen.getByText('Confirm')
    expect(confirmBtn.className).toMatch(/destructive/)
  })
})
