#!/usr/bin/env tsx
/**
 * scripts/seed.ts
 *
 * FreshCRM seed script — populates a single clean org with
 * full, well-linked test data across all CRM entities.
 *
 * Usage:
 *   npm run db:seed              — normal (drop + re-insert)
 *   npm run db:seed -- --dry-run — print SQL, don't execute
 *
 * Requires fresh migrations (npm run db:migrate) first.
 *
 * Login after seeding:
 *   admin@demo.com / password123
 */

import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import fs   from 'fs'
import path from 'path'

const dryRun = process.argv.includes('--dry-run')

const COLOR = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
}

// ── Hardcoded IDs for cross-referencing ──────────────────────────────
// All valid UUID v4 (position 14 = 4, position 19 = 8/a/b)
const ID = {
  org: '00000000-0000-4000-8000-000000000001',

  users: {
    admin:    '00000000-0000-4000-8000-000000000011',
    member:   '00000000-0000-4000-8000-000000000012',
    e2e_admin: '00000000-0000-4000-8000-000000000013',
  },

  contacts: {
    website:       '00000000-0000-4000-8000-000000000101',
    referral:      '00000000-0000-4000-8000-000000000102',
    cold_outreach: '00000000-0000-4000-8000-000000000103',
    social:        '00000000-0000-4000-8000-000000000104',
    event:         '00000000-0000-4000-8000-000000000105',
    other:         '00000000-0000-4000-8000-000000000106',
  },

  pipeline: '00000000-0000-4000-8000-000000000020',

  stages: {
    new:         '00000000-0000-4000-8000-000000000021',
    qualified:   '00000000-0000-4000-8000-000000000022',
    proposal:    '00000000-0000-4000-8000-000000000023',
    negotiation: '00000000-0000-4000-8000-000000000024',
    won:         '00000000-0000-4000-8000-000000000025',
    lost:        '00000000-0000-4000-8000-000000000026',
  },

  leads: {
    new_lead:       '00000000-0000-4000-8000-000000000201',
    contacted_lead: '00000000-0000-4000-8000-000000000202',
    qualified_lead: '00000000-0000-4000-8000-000000000203',
    lost_lead:      '00000000-0000-4000-8000-000000000204',
  },

  deals: {
    in_negotiation:  '00000000-0000-4000-8000-000000000301',
    in_proposal:     '00000000-0000-4000-8000-000000000302',
    in_new:          '00000000-0000-4000-8000-000000000303',
    closed_lost:     '00000000-0000-4000-8000-000000000304',
    closed_won:      '00000000-0000-4000-8000-000000000305',
  },

  tickets: {
    urgent_open:     '00000000-0000-4000-8000-000000000401',
    medium_pending:  '00000000-0000-4000-8000-000000000402',
    low_resolved:    '00000000-0000-4000-8000-000000000403',
  },

  activities: {
    call_activity:    '00000000-0000-4000-8000-000000000501',
    email_activity:   '00000000-0000-4000-8000-000000000502',
    note_activity:    '00000000-0000-4000-8000-000000000503',
    task_activity:    '00000000-0000-4000-8000-000000000504',
    meeting_activity: '00000000-0000-4000-8000-000000000505',
  },

  email: {
    thread: '00000000-0000-4000-8000-000000000601',
    inbound:  '00000000-0000-4000-8000-000000000611',
    outbound: '00000000-0000-4000-8000-000000000612',
  },
} as const

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
    max: 1,
  })

  console.log(COLOR.bold('\nFreshCRM Seed\n'))

  if (dryRun) {
    console.log(COLOR.dim('  Dry-run mode — no SQL will be executed\n'))
  }

  const client = await pool.connect()

  try {
    // ── 1. Clear existing data ──────────────────────────────────
    console.log(COLOR.yellow('  → Clearing existing data...'))
    if (!dryRun) {
      await client.query('DELETE FROM email_messages')
      await client.query('DELETE FROM email_threads')
      await client.query('DELETE FROM activities')
      await client.query('DELETE FROM tickets')
      await client.query('DELETE FROM deals')
      await client.query('DELETE FROM leads')
      await client.query('DELETE FROM pipeline_stages')
      await client.query('DELETE FROM pipelines')
      await client.query('DELETE FROM custom_field_definitions')
      await client.query('DELETE FROM contacts')
      await client.query('DELETE FROM users')
      await client.query('DELETE FROM orgs')
    }

    // ── 2. Hash passwords ───────────────────────────────────────
    const password      = dryRun ? '' : await bcrypt.hash('password123', 12)
    const e2ePassword   = dryRun ? '' : await bcrypt.hash('testpassword123', 12)

    // ── 3. Orgs ─────────────────────────────────────────────────
    console.log(COLOR.dim('    → orgs'))
    if (!dryRun) {
      await client.query(
        `INSERT INTO orgs (id, name, slug, plan)
         VALUES ($1, 'Demo Corp', 'demo-corp', 'free')`,
        [ID.org]
      )
    }

    // ── 4. Users ────────────────────────────────────────────────
    console.log(COLOR.dim('    → users'))
    if (!dryRun) {
      await client.query(
        `INSERT INTO users (id, org_id, email, full_name, role, password_hash)
         VALUES ($1, $2, 'admin@demo.com', 'Admin User', 'admin', $3)`,
        [ID.users.admin, ID.org, password]
      )
      await client.query(
        `INSERT INTO users (id, org_id, email, full_name, role, password_hash)
         VALUES ($1, $2, 'member@demo.com', 'Member User', 'member', $3)`,
        [ID.users.member, ID.org, password]
      )
      await client.query(
        `INSERT INTO users (id, org_id, email, full_name, role, password_hash)
         VALUES ($1, $2, 'admin@test-org.com', 'Test Admin', 'admin', $3)`,
        [ID.users.e2e_admin, ID.org, e2ePassword]
      )
    }

    // ── 5. Contacts ─────────────────────────────────────────────
    // One per lead_source, each with different field combos
    const now = new Date()
    const week = (n: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - n * 7)
      return d.toISOString()
    }

    const contacts = [
      {
        id: ID.contacts.website,
        first_name: 'Alice', last_name: 'Johnson',
        email: 'alice@example.com', phone: '+1-555-0101',
        company: 'TechNova Inc', job_title: 'CTO',
        lead_source: 'website', owner_id: ID.users.admin,
        tags: ['vip', 'tech'], custom_fields: { industry: 'SaaS', employee_count: 50 },
        created_at: week(4),
      },
      {
        id: ID.contacts.referral,
        first_name: 'Bob', last_name: 'Smith',
        email: 'bob@example.com', phone: '+1-555-0102',
        company: 'DataFlow Labs', job_title: 'VP Engineering',
        lead_source: 'referral', owner_id: ID.users.member,
        tags: ['referral', 'enterprise'], custom_fields: { industry: 'FinTech' },
        created_at: week(3),
      },
      {
        id: ID.contacts.cold_outreach,
        first_name: 'Carol', last_name: 'Davis',
        email: 'carol@example.com', phone: null,
        company: 'GreenLeaf Corp', job_title: 'Head of Sales',
        lead_source: 'cold_outreach', owner_id: null,
        tags: ['cold'], custom_fields: {},
        created_at: week(3),
      },
      {
        id: ID.contacts.social,
        first_name: 'David', last_name: 'Lee',
        email: 'david@example.com', phone: '+1-555-0104',
        company: null, job_title: 'Founder',
        lead_source: 'social', owner_id: ID.users.admin,
        tags: [], custom_fields: { linkedin: 'davidlee' },
        created_at: week(2),
      },
      {
        id: ID.contacts.event,
        first_name: 'Eve', last_name: 'Martinez',
        email: null, phone: null,
        company: 'BrightPath Inc', job_title: null,
        lead_source: 'event', owner_id: ID.users.member,
        tags: ['event-q1'], custom_fields: { event: 'SaaStr 2026' },
        created_at: week(1),
      },
      {
        id: ID.contacts.other,
        first_name: 'Frank', last_name: 'Wilson',
        email: 'frank@example.com', phone: '+1-555-0106',
        company: 'CloudBase', job_title: 'CEO',
        lead_source: 'other', owner_id: ID.users.admin,
        tags: ['vip', 'board'], custom_fields: { priority: 'high' },
        created_at: week(1),
      },
    ]

    console.log(COLOR.dim('    → contacts'))
    if (!dryRun) {
      for (const c of contacts) {
        await client.query(
          `INSERT INTO contacts
             (id, org_id, first_name, last_name, email, phone, company,
              job_title, lead_source, owner_id, tags, custom_fields, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [c.id, ID.org, c.first_name, c.last_name, c.email,
           c.phone, c.company, c.job_title, c.lead_source,
           c.owner_id, c.tags, JSON.stringify(c.custom_fields),
           c.created_at]
        )
      }
    }

    // ── 6. Pipeline + Stages ────────────────────────────────────
    console.log(COLOR.dim('    → pipeline'))
    if (!dryRun) {
      await client.query(
        `INSERT INTO pipelines (id, org_id, name, is_default)
         VALUES ($1, $2, 'Sales Pipeline', true)`,
        [ID.pipeline, ID.org]
      )

      const stages = [
        { id: ID.stages.new,         name: 'New',         pos: 0, prob: 10 },
        { id: ID.stages.qualified,   name: 'Qualified',   pos: 1, prob: 30 },
        { id: ID.stages.proposal,    name: 'Proposal',    pos: 2, prob: 60 },
        { id: ID.stages.negotiation, name: 'Negotiation',  pos: 3, prob: 80 },
        { id: ID.stages.won,         name: 'Closed Won',  pos: 4, prob: 100 },
        { id: ID.stages.lost,        name: 'Closed Lost', pos: 5, prob: 0 },
      ]

      for (const s of stages) {
        await client.query(
          `INSERT INTO pipeline_stages (id, pipeline_id, name, position, probability)
           VALUES ($1, $2, $3, $4, $5)`,
          [s.id, ID.pipeline, s.name, s.pos, s.prob]
        )
      }
    }

    // ── 7. Leads ────────────────────────────────────────────────
    const leads = [
      {
        id: ID.leads.new_lead, contact_id: ID.contacts.website,
        status: 'new', score: 25, source: 'website',
        owner_id: ID.users.admin, notes: 'Just signed up for trial',
      },
      {
        id: ID.leads.contacted_lead, contact_id: ID.contacts.referral,
        status: 'contacted', score: 50, source: 'referral',
        owner_id: ID.users.member, notes: 'Had initial call — interested',
      },
      {
        id: ID.leads.qualified_lead, contact_id: ID.contacts.social,
        status: 'qualified', score: 85, source: 'social',
        owner_id: ID.users.admin, notes: 'Strong fit — demo scheduled',
      },
      {
        id: ID.leads.lost_lead, contact_id: ID.contacts.cold_outreach,
        status: 'lost', score: 10, source: 'cold_outreach',
        owner_id: null, notes: 'Budget constraints',
      },
    ]

    console.log(COLOR.dim('    → leads'))
    if (!dryRun) {
      for (const l of leads) {
        await client.query(
          `INSERT INTO leads (id, org_id, contact_id, status, score, source, owner_id, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [l.id, ID.org, l.contact_id, l.status, l.score, l.source, l.owner_id, l.notes]
        )
      }
    }

    // ── 8. Deals ────────────────────────────────────────────────
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + 90)
    const fmtDate = (d: Date) => d.toISOString().slice(0, 10)

    const deals = [
      {
        id: ID.deals.in_negotiation,
        name: 'Enterprise Platform Deal',
        contact_id: ID.contacts.website,
        stage_id: ID.stages.negotiation,
        value: 120000, currency: 'USD',
        close_date: fmtDate(futureDate),
        owner_id: ID.users.admin, status: 'open',
      },
      {
        id: ID.deals.in_proposal,
        name: 'Data Migration Project',
        contact_id: ID.contacts.referral,
        stage_id: ID.stages.proposal,
        value: 45000, currency: 'INR',
        close_date: null,
        owner_id: ID.users.member, status: 'open',
      },
      {
        id: ID.deals.in_new,
        name: 'Basic Subscription',
        contact_id: ID.contacts.event,
        stage_id: ID.stages.new,
        value: 9900, currency: 'INR',
        close_date: null,
        owner_id: null, status: 'open',
      },
      {
        id: ID.deals.closed_lost,
        name: 'Infra Upgrade Deal',
        contact_id: ID.contacts.cold_outreach,
        stage_id: ID.stages.lost,
        value: 25000, currency: 'INR',
        close_date: null,
        owner_id: ID.users.admin, status: 'lost',
        lost_reason: 'Customer chose a competitor',
      },
      {
        id: ID.deals.closed_won,
        name: 'Analytics Suite',
        contact_id: ID.contacts.social,
        stage_id: ID.stages.won,
        value: 80000, currency: 'USD',
        close_date: fmtDate(now),
        owner_id: ID.users.admin, status: 'won',
      },
    ]

    console.log(COLOR.dim('    → deals'))
    if (!dryRun) {
      for (const d of deals) {
        await client.query(
          `INSERT INTO deals
             (id, org_id, name, contact_id, pipeline_id, stage_id,
              value, currency, close_date, owner_id, status, lost_reason)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [d.id, ID.org, d.name, d.contact_id, ID.pipeline, d.stage_id,
           d.value, d.currency, d.close_date, d.owner_id, d.status,
           (d as { lost_reason?: string }).lost_reason ?? null]
        )
      }
    }

    // ── 9. Tickets ──────────────────────────────────────────────
    const slaDate = new Date(now)
    slaDate.setDate(slaDate.getDate() + 7)

    const resolvedDate = new Date(now)
    resolvedDate.setDate(resolvedDate.getDate() - 2)

    const tickets = [
      {
        id: ID.tickets.urgent_open,
        subject: 'Payment gateway down — production outage',
        status: 'open', priority: 'urgent',
        contact_id: ID.contacts.website,
        assignee_id: ID.users.member,
        sla_due_at: slaDate.toISOString(),
      },
      {
        id: ID.tickets.medium_pending,
        subject: 'Need API documentation for webhooks',
        status: 'pending', priority: 'medium',
        contact_id: ID.contacts.referral,
        assignee_id: null,
        sla_due_at: null,
      },
      {
        id: ID.tickets.low_resolved,
        subject: 'Feature request: dark mode',
        status: 'resolved', priority: 'low',
        contact_id: null,
        assignee_id: ID.users.admin,
        sla_due_at: null,
        resolved_at: resolvedDate.toISOString(),
      },
    ]

    console.log(COLOR.dim('    → tickets'))
    if (!dryRun) {
      for (const t of tickets) {
        await client.query(
          `INSERT INTO tickets
             (id, org_id, subject, status, priority, contact_id,
              assignee_id, sla_due_at, resolved_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [t.id, ID.org, t.subject, t.status, t.priority,
           t.contact_id, t.assignee_id,
           t.sla_due_at, (t as { resolved_at?: string }).resolved_at ?? null]
        )
      }
    }

    // ── 10. Activities ──────────────────────────────────────────
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(now)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const threeDaysAgo = new Date(now)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const activities = [
      {
        id: ID.activities.call_activity,
        type: 'call',
        body: 'Discussed pricing options. Client interested in enterprise plan.',
        contact_id: ID.contacts.website,
        deal_id: ID.deals.in_negotiation,
        ticket_id: null,
        due_at: null,
        owner_id: ID.users.admin,
        created_at: yesterday.toISOString(),
      },
      {
        id: ID.activities.email_activity,
        type: 'email',
        body: 'Sent proposal document with pricing breakdown.',
        contact_id: ID.contacts.referral,
        deal_id: ID.deals.in_proposal,
        ticket_id: null,
        due_at: null,
        owner_id: ID.users.member,
        created_at: twoDaysAgo.toISOString(),
      },
      {
        id: ID.activities.note_activity,
        type: 'note',
        body: 'Internal note: Follow up on compliance requirements before closing.',
        contact_id: ID.contacts.website,
        deal_id: null,
        ticket_id: ID.tickets.urgent_open,
        due_at: null,
        owner_id: ID.users.admin,
        created_at: threeDaysAgo.toISOString(),
      },
      {
        id: ID.activities.task_activity,
        type: 'task',
        body: 'Prepare Q3 forecast report',
        contact_id: null,
        deal_id: ID.deals.in_negotiation,
        ticket_id: null,
        due_at: futureDate.toISOString(),
        owner_id: ID.users.admin,
        created_at: lastWeek.toISOString(),
      },
      {
        id: ID.activities.meeting_activity,
        type: 'meeting',
        body: 'Quarterly business review with stakeholders.',
        contact_id: ID.contacts.social,
        deal_id: ID.deals.closed_won,
        ticket_id: null,
        due_at: null,
        owner_id: ID.users.admin,
        created_at: yesterday.toISOString(),
      },
    ]

    console.log(COLOR.dim('    → activities'))
    if (!dryRun) {
      for (const a of activities) {
        await client.query(
          `INSERT INTO activities
             (id, org_id, type, body, contact_id, deal_id, ticket_id,
              due_at, owner_id, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [a.id, ID.org, a.type, a.body, a.contact_id, a.deal_id,
           a.ticket_id, a.due_at, a.owner_id, a.created_at]
        )
      }
    }

    // ── 11. Email Thread + Messages ─────────────────────────────
    console.log(COLOR.dim('    → email'))
    if (!dryRun) {
      await client.query(
        `INSERT INTO email_threads (id, org_id, contact_id, ticket_id, subject)
         VALUES ($1, $2, $3, $4, 'Support: Payment gateway issue')`,
        [ID.email.thread, ID.org, ID.contacts.website, ID.tickets.urgent_open]
      )

      await client.query(
        `INSERT INTO email_messages (id, thread_id, from_addr, to_addrs, body_html, direction, sent_at)
         VALUES ($1, $2, 'alice@example.com', ARRAY[$3],
          '<p>Hi, our payment gateway is returning 500 errors. Can you help?</p>',
          'inbound', $4)`,
        [ID.email.inbound, ID.email.thread, 'support@demo-corp.com',
         threeDaysAgo.toISOString()]
      )

      await client.query(
        `INSERT INTO email_messages (id, thread_id, from_addr, to_addrs, body_html, direction, sent_at)
         VALUES ($1, $2, 'support@demo-corp.com', ARRAY[$3],
          '<p>Hi Alice, we are looking into this urgently. Will update within 2 hours.</p>',
          'outbound', $4)`,
        [ID.email.outbound, ID.email.thread, 'alice@example.com',
         twoDaysAgo.toISOString()]
      )
    }

    console.log(COLOR.green('\n✓ Seed complete!\n'))
    console.log(COLOR.dim('  Login:  admin@demo.com / password123'))
    console.log(COLOR.dim('  E2E:    admin@test-org.com / testpassword123\n'))

  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(COLOR.red('\n✗ Seed failed: ' + err.message))
  process.exit(1)
})
