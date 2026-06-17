import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { type Activity } from '@/types/crm'

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Called client',
    createdAt: new Date('2024-01-15T10:30:00'),
    userId: 'u1',
  },
  {
    id: '2',
    type: 'email',
    title: 'Sent follow-up email',
    description: 'Sent pricing info',
    createdAt: new Date('2024-01-15T11:00:00'),
    userId: 'u1',
  },
]

describe('ActivityTimeline', () => {
  it('shows 5 skeleton items when isLoading=true', () => {
    const { container } = render(
      <ActivityTimeline activities={[]} isLoading={true} />
    )
    // Each skeleton item is a div with flex items-start gap-3
    const skeletonItems = container.querySelectorAll('.flex.items-start.gap-3')
    expect(skeletonItems).toHaveLength(5)
  })

  it('shows "No activity yet." when activities=[] and isLoading=false', () => {
    render(<ActivityTimeline activities={[]} isLoading={false} />)
    expect(screen.getByText('No activity yet.')).toBeInTheDocument()
  })

  it('renders title for each activity', () => {
    render(<ActivityTimeline activities={mockActivities} />)
    expect(screen.getByText('Called client')).toBeInTheDocument()
    expect(screen.getByText('Sent follow-up email')).toBeInTheDocument()
  })

  it('renders correct icon background class for "call" type (bg-blue-100)', () => {
    render(<ActivityTimeline activities={[mockActivities[0]]} />)
    // The icon wrapper span has the bg class from ACTIVITY_TYPE_CONFIG
    const iconSpan = screen.getByText('Called client')
      .closest('li')
      ?.querySelector('span')
    expect(iconSpan?.className).toMatch(/bg-blue-100/)
  })

  it('renders formatted timestamp', () => {
    render(<ActivityTimeline activities={[mockActivities[0]]} />)
    // formatDateTime uses toLocaleString — check that some date text is present
    const dateText = screen.getByText(/Jan 15, 2024/i)
    expect(dateText).toBeInTheDocument()
  })
})
