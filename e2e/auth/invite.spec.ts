import { test } from '@playwright/test'

test.describe('Invite flow', () => {
  test('admin can invite a new user via /settings/team', async () => {})
  test('invited user lands on /invite/:token and creates account', async () => {})
  test('shows error for expired invitation token', async () => {})
  test('shows error for already-used invitation token', async () => {})
  test('non-admin cannot access invite form', async () => {})
})
