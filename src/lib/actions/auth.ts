'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Resend } from 'resend'
import { query, transaction, queryForOrg } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { signupSchema, inviteSchema, acceptInviteSchema } from '@/lib/validations/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

// ── signUp (public) ──────────────────────────────────────────────
export async function signUp(input: unknown) {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { full_name, org_name, email, password } = parsed.data

  const existing = await query<{ id: string }>('SELECT id FROM users WHERE email = $1 LIMIT 1', [email])
  if (existing.length > 0) return { error: { email: ['An account with this email already exists'] } }

  const password_hash = await bcrypt.hash(password, 12)
  const slug = slugify(org_name)

  try {
    await transaction(async (q) => {
      const [org] = await q<{ id: string }>('INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING id', [org_name, slug])
      await q(`INSERT INTO users (org_id, email, full_name, role, password_hash) VALUES ($1, $2, $3, 'admin', $4)`, [org.id, email, full_name, password_hash])
    })
  } catch (err) {
    console.error('signUp failed:', err)
    return { error: { _form: ['Account creation failed. Please try again.'] } }
  }
  return { success: true as const }
}

// ── inviteUser (admin only) ──────────────────────────────────────
export async function inviteUser(input: unknown) {
  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.role !== 'admin') return { error: 'Insufficient permissions' }

  const { email, role } = parsed.data

  const existing = await queryForOrg<{ id: string }>(
    user.orgId, user.id,
    'SELECT id FROM users WHERE org_id = $1 AND email = $2 LIMIT 1', [user.orgId, email]
  )
  if (existing.length > 0) return { error: { email: ['This person is already a member of your org'] } }

  const token = crypto.randomUUID()

  await queryForOrg(
    user.orgId, user.id,
    `INSERT INTO invitations (org_id, invited_by, email, role, token, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + interval '7 days')`,
    [user.orgId, user.id, email, role, token]
  )

  try {
    await resend.emails.send({
      from: process.env.INVITE_FROM_EMAIL ?? 'noreply@freshcrm.local',
      to: email,
      subject: 'You have been invited to FreshCRM',
      html: `<p>You have been invited to join FreshCRM. <a href="${process.env.NEXTAUTH_URL}/invite/${token}">Accept invitation</a></p>`,
    })
  } catch (err) {
    console.error('inviteUser: email send failed, rolling back invitation row:', err)
    // Compensating delete — ensures no orphaned invitation row on send failure
    await queryForOrg(user.orgId, user.id, 'DELETE FROM invitations WHERE token = $1', [token])
    return { error: { _form: ['Failed to send invitation'] } }
  }

  return { success: true as const }
}

// ── acceptInvite (public) ────────────────────────────────────────
export async function acceptInvite(input: unknown) {
  const parsed = acceptInviteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { token, full_name, password } = parsed.data

  const invites = await query<{
    id: string; org_id: string; role: string; accepted_at: string | null; expires_at: string
  }>('SELECT id, org_id, role, accepted_at, expires_at FROM invitations WHERE token = $1 LIMIT 1', [token])

  const invite = invites[0]
  if (!invite || invite.accepted_at) return { error: 'Invitation not found or already used' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'This invitation has expired' }

  const password_hash = await bcrypt.hash(password, 12)

  try {
    await transaction(async (q) => {
      await q(
        `INSERT INTO users (org_id, email, full_name, role, password_hash)
         SELECT org_id, email, $1, $2, $3 FROM invitations WHERE id = $4`,
        [full_name, invite.role, password_hash, invite.id]
      )
      await q('UPDATE invitations SET accepted_at = now() WHERE id = $1', [invite.id])
    })
  } catch (err) {
    console.error('acceptInvite failed:', err)
    return { error: { _form: ['Failed to create account'] } }
  }

  return { success: true as const }
}

// ── updateMemberRole (admin only) ────────────────────────────────
const updateRoleSchema = z.object({ userId: z.string(), role: z.enum(['admin', 'member', 'viewer']) })

export async function updateMemberRole(input: unknown) {
  const parsed = updateRoleSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.role !== 'admin') return { error: 'Insufficient permissions' }

  const { userId, role } = parsed.data

  const target = await queryForOrg<{ id: string; role: string }>(
    user.orgId, user.id,
    'SELECT id, role FROM users WHERE id = $1 AND org_id = $2 LIMIT 1', [userId, user.orgId]
  )
  if (!target[0]) return { error: 'User not found in your org' }

  if (target[0].role === 'admin' && role !== 'admin') {
    const admins = await queryForOrg<{ count: string }>(
      user.orgId, user.id,
      'SELECT COUNT(*)::text AS count FROM users WHERE org_id = $1 AND role = $2', [user.orgId, 'admin']
    )
    if (parseInt(admins[0].count) <= 1) return { error: 'Cannot demote the last admin' }
  }

  await queryForOrg(
    user.orgId, user.id,
    'UPDATE users SET role = $1, updated_at = now() WHERE id = $2 AND org_id = $3',
    [role, userId, user.orgId]
  )

  return { success: true as const }
}

// ── removeMember (admin only) ────────────────────────────────────
const removeMemberSchema = z.object({ userId: z.string() })

export async function removeMember(input: unknown) {
  const parsed = removeMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.role !== 'admin') return { error: 'Insufficient permissions' }

  const { userId } = parsed.data
  if (userId === user.id) return { error: 'Cannot remove yourself' }

  const target = await queryForOrg<{ id: string; role: string }>(
    user.orgId, user.id,
    'SELECT id, role FROM users WHERE id = $1 AND org_id = $2 LIMIT 1', [userId, user.orgId]
  )
  if (!target[0]) return { error: 'User not found in your org' }

  if (target[0].role === 'admin') {
    const admins = await queryForOrg<{ count: string }>(
      user.orgId, user.id,
      'SELECT COUNT(*)::text AS count FROM users WHERE org_id = $1 AND role = $2', [user.orgId, 'admin']
    )
    if (parseInt(admins[0].count) <= 1) return { error: 'Cannot remove the last admin' }
  }

  await queryForOrg(
    user.orgId, user.id,
    'DELETE FROM users WHERE id = $1 AND org_id = $2', [userId, user.orgId]
  )

  return { success: true as const }
}
