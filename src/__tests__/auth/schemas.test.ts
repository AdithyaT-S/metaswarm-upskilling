import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema, inviteSchema, acceptInviteSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'password123' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'password123' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = {
    full_name: 'Alice Smith',
    org_name: 'Acme Corp',
    email: 'alice@acme.com',
    password: 'password123',
  }

  it('accepts valid signup input', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })

  it('rejects password over 72 characters', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'a'.repeat(73) }).success).toBe(false)
  })

  it('rejects short full_name', () => {
    expect(signupSchema.safeParse({ ...valid, full_name: 'A' }).success).toBe(false)
  })

  it('rejects short org_name', () => {
    expect(signupSchema.safeParse({ ...valid, org_name: 'A' }).success).toBe(false)
  })
})

describe('inviteSchema', () => {
  it('accepts valid email and role', () => {
    expect(inviteSchema.safeParse({ email: 'bob@example.com', role: 'member' }).success).toBe(true)
  })

  it('accepts admin role', () => {
    expect(inviteSchema.safeParse({ email: 'bob@example.com', role: 'admin' }).success).toBe(true)
  })

  it('accepts viewer role', () => {
    expect(inviteSchema.safeParse({ email: 'bob@example.com', role: 'viewer' }).success).toBe(true)
  })

  it('rejects invalid role', () => {
    expect(inviteSchema.safeParse({ email: 'bob@example.com', role: 'superuser' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(inviteSchema.safeParse({ email: 'not-an-email', role: 'member' }).success).toBe(false)
  })
})

describe('acceptInviteSchema', () => {
  const valid = {
    token: 'some-uuid-token',
    full_name: 'Bob Jones',
    password: 'securepass',
  }

  it('accepts valid accept-invite input', () => {
    expect(acceptInviteSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty token', () => {
    expect(acceptInviteSchema.safeParse({ ...valid, token: '' }).success).toBe(false)
  })

  it('rejects short full_name', () => {
    expect(acceptInviteSchema.safeParse({ ...valid, full_name: 'B' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(acceptInviteSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })

  it('rejects password over 72 characters', () => {
    expect(acceptInviteSchema.safeParse({ ...valid, password: 'a'.repeat(73) }).success).toBe(false)
  })
})
