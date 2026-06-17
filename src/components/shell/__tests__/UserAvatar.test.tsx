import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserAvatar } from '../UserAvatar'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  ),
}))

describe('<UserAvatar>', () => {
  it('renders initials "JD" for name "John Doe"', () => {
    render(<UserAvatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeDefined()
  })

  it('renders initials "JS" for name "Jane Smith"', () => {
    render(<UserAvatar name="Jane Smith" />)
    expect(screen.getByText('JS')).toBeDefined()
  })

  it('renders max 2 initials for a three-word name', () => {
    render(<UserAvatar name="John Michael Doe" />)
    expect(screen.getByText('JM')).toBeDefined()
  })

  it('renders image element when image prop is provided', () => {
    render(<UserAvatar name="John Doe" image="https://example.com/avatar.jpg" />)
    const img = screen.getByAltText('John Doe')
    expect(img).toBeDefined()
    expect((img as HTMLImageElement).src).toContain('example.com/avatar.jpg')
  })

  it('does not render image when image prop is absent', () => {
    render(<UserAvatar name="John Doe" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders single initial for a single-word name', () => {
    render(<UserAvatar name="Alice" />)
    expect(screen.getByText('A')).toBeDefined()
  })
})
