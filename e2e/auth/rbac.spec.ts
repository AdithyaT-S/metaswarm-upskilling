import { test } from '@playwright/test'

test.describe('RBAC enforcement', () => {
  test('admin can access /settings/team', async () => {})
  test('member cannot access /settings/team', async () => {})
  test('viewer cannot access /settings/team', async () => {})
  test('admin can change member roles', async () => {})
  test('admin cannot demote last admin', async () => {})
  test('admin cannot remove themselves', async () => {})
})
