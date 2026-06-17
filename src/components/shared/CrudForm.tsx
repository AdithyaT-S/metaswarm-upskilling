'use client'

import { type UseFormReturn, type FieldValues } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface CrudFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
  title: string
  description?: string
  isPending?: boolean
  cancelHref?: string
  children: React.ReactNode
  submitLabel?: string
}

export function CrudForm<T extends FieldValues>({
  form,
  onSubmit,
  title,
  description,
  isPending = false,
  cancelHref,
  children,
  submitLabel = 'Save',
}: CrudFormProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">{children}</CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
            {cancelHref && (
              <Button variant="ghost" asChild>
                <Link href={cancelHref}>Cancel</Link>
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
