import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DB module
vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  transaction: vi.fn(),
  queryForOrg: vi.fn(),
}))

// Mock auth module
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
}))

// Mock bcryptjs so tests don't run slow hashing
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'email-id' }) },
  })),
}))

import { query, transaction, queryForOrg } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { signUp, inviteUser, acceptInvite, updateMemberRole, removeMember } from '@/lib/actions/auth'

const mockQuery = vi.mocked(query)
const mockTransaction = vi.mocked(transaction)
const mockQueryForOrg = vi.mocked(queryForOrg)
const mockGetAuthUser = vi.mocked(getAuthUser)

const adminUser = {
  id: 'user-1',
  email: 'admin@acme.com',
  orgId: 'org-1',
  role: 'admin' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── signUp ───────────────────────────────────────────────────────
describe('signUp', () => {
  const validInput = {
    full_name: 'Alice Smith',
    org_name: 'Acme Corp',
    email: 'alice@acme.com',
    password: 'password123',
  }

  it('returns success on valid input', async () => {
    mockQuery.mockResolvedValueOnce([]) // no existing user
    mockTransaction.mockResolvedValueOnce(undefined)

    const result = await signUp(validInput)

    expect(result).toEqual({ success: true })
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      ['alice@acme.com']
    )
  })

  it('returns error on duplicate email', async () => {
    mockQuery.mockResolvedValueOnce([{ id: 'existing-id' }])

    const result = await signUp(validInput)

    expect(result).toMatchObject({ error: { email: expect.any(Array) } })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns validation error on invalid input', async () => {
    const result = await signUp({ email: 'bad', password: 'x' })

    expect(result).toHaveProperty('error')
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('returns form error when transaction throws', async () => {
    mockQuery.mockResolvedValueOnce([])
    mockTransaction.mockRejectedValueOnce(new Error('DB error'))

    const result = await signUp(validInput)

    expect(result).toMatchObject({ error: { _form: expect.any(Array) } })
  })
})

// ── inviteUser ───────────────────────────────────────────────────
describe('inviteUser', () => {
  const validInput = { email: 'bob@acme.com', role: 'member' }

  it('returns success when admin invites a new user', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg
      .mockResolvedValueOnce([]) // no existing member
      .mockResolvedValueOnce([]) // insert invitation
    // Resend send is already mocked to succeed

    const result = await inviteUser(validInput)

    expect(result).toEqual({ success: true })
  })

  it('returns error when caller is not authenticated', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)

    const result = await inviteUser(validInput)

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns error when caller is not admin', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ ...adminUser, role: 'member' })

    const result = await inviteUser(validInput)

    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('returns error when invitee is already a member', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg.mockResolvedValueOnce([{ id: 'existing-member' }])

    const result = await inviteUser(validInput)

    expect(result).toMatchObject({ error: { email: expect.any(Array) } })
  })

  it('returns validation error on invalid input', async () => {
    const result = await inviteUser({ email: 'bad', role: 'superuser' })

    expect(result).toHaveProperty('error')
  })
})

// ── acceptInvite ─────────────────────────────────────────────────
describe('acceptInvite', () => {
  const validInput = {
    token: 'valid-token-uuid',
    full_name: 'Bob Jones',
    password: 'password123',
  }

  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()

  it('returns success on valid unexpired invitation', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 'inv-1', org_id: 'org-1', role: 'member', accepted_at: null, expires_at: futureDate },
    ])
    mockTransaction.mockResolvedValueOnce(undefined)

    const result = await acceptInvite(validInput)

    expect(result).toEqual({ success: true })
  })

  it('returns error when invitation is expired', async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString()
    mockQuery.mockResolvedValueOnce([
      { id: 'inv-1', org_id: 'org-1', role: 'member', accepted_at: null, expires_at: pastDate },
    ])

    const result = await acceptInvite(validInput)

    expect(result).toEqual({ error: 'This invitation has expired' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns error when invitation is already used', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 'inv-1', org_id: 'org-1', role: 'member', accepted_at: '2024-01-01T00:00:00Z', expires_at: futureDate },
    ])

    const result = await acceptInvite(validInput)

    expect(result).toEqual({ error: 'Invitation not found or already used' })
  })

  it('returns error when invitation is not found', async () => {
    mockQuery.mockResolvedValueOnce([])

    const result = await acceptInvite(validInput)

    expect(result).toEqual({ error: 'Invitation not found or already used' })
  })

  it('returns validation error on invalid input', async () => {
    const result = await acceptInvite({ token: '', full_name: 'B', password: 'x' })

    expect(result).toHaveProperty('error')
    expect(mockQuery).not.toHaveBeenCalled()
  })
})

// ── updateMemberRole ─────────────────────────────────────────────
describe('updateMemberRole', () => {
  const validInput = { userId: 'user-2', role: 'viewer' }

  it('returns success when admin updates a member role', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg
      .mockResolvedValueOnce([{ id: 'user-2', role: 'member' }]) // target user
      .mockResolvedValueOnce([]) // UPDATE
    // target role is 'member' -> not an admin demotion, no admin count check needed

    const result = await updateMemberRole(validInput)

    expect(result).toEqual({ success: true })
  })

  it('returns error when caller is not authenticated', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)

    const result = await updateMemberRole(validInput)

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns error when caller is not admin', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ ...adminUser, role: 'member' })

    const result = await updateMemberRole(validInput)

    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('returns error when demoting the last admin', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg
      .mockResolvedValueOnce([{ id: 'user-2', role: 'admin' }]) // target is admin
      .mockResolvedValueOnce([{ count: '1' }]) // only 1 admin left

    const result = await updateMemberRole({ userId: 'user-2', role: 'member' })

    expect(result).toEqual({ error: 'Cannot demote the last admin' })
  })

  it('returns error when target user not found in org', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg.mockResolvedValueOnce([])

    const result = await updateMemberRole(validInput)

    expect(result).toEqual({ error: 'User not found in your org' })
  })

  it('returns validation error on invalid input', async () => {
    const result = await updateMemberRole({ userId: '', role: 'superuser' })

    expect(result).toHaveProperty('error')
  })
})

// ── removeMember ─────────────────────────────────────────────────
describe('removeMember', () => {
  const validInput = { userId: 'user-2' }

  it('returns success when admin removes a member', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg
      .mockResolvedValueOnce([{ id: 'user-2', role: 'member' }]) // target user
      .mockResolvedValueOnce([]) // DELETE

    const result = await removeMember(validInput)

    expect(result).toEqual({ success: true })
  })

  it('returns error when caller is not authenticated', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)

    const result = await removeMember(validInput)

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns error when caller is not admin', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ ...adminUser, role: 'viewer' })

    const result = await removeMember(validInput)

    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('returns error when trying to remove self', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)

    const result = await removeMember({ userId: adminUser.id })

    expect(result).toEqual({ error: 'Cannot remove yourself' })
  })

  it('returns error when removing the last admin', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg
      .mockResolvedValueOnce([{ id: 'user-2', role: 'admin' }]) // target is admin
      .mockResolvedValueOnce([{ count: '1' }]) // only 1 admin

    const result = await removeMember(validInput)

    expect(result).toEqual({ error: 'Cannot remove the last admin' })
  })

  it('returns error when target user not found in org', async () => {
    mockGetAuthUser.mockResolvedValueOnce(adminUser)
    mockQueryForOrg.mockResolvedValueOnce([])

    const result = await removeMember(validInput)

    expect(result).toEqual({ error: 'User not found in your org' })
  })

  it('returns validation error on invalid input', async () => {
    const result = await removeMember({})

    expect(result).toHaveProperty('error')
  })
})
