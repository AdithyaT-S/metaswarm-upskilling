import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { AcceptInviteForm } from './AcceptInviteForm'

export default function InvitePage({ params }: { params: { token: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept invitation</CardTitle>
        <CardDescription>
          Create your account to join your team on FreshCRM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptInviteForm token={params.token} />
      </CardContent>
    </Card>
  )
}
