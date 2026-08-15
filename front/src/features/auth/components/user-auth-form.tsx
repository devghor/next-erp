'use client';
import { LoadingButton } from '@/components/ui/loading-button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Enter your password' })
});

interface UserAuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

export default function UserAuthForm({ mode }: UserAuthFormProps) {
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/overview';

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await signIn('credentials', {
          email: value.email,
          password: value.password,
          redirect: false
        });

        if (!result || result.error) {
          toast.error('Invalid email or password');
          return;
        }

        toast.success('Signed in successfully!');
        router.push(callbackUrl);
      });
    }
  });

  return (
    <form
      className='w-full space-y-2'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField
          name='email'
          children={(field) => (
            <field.TextField
              label='Email'
              type='email'
              placeholder='Enter your email...'
              disabled={loading}
            />
          )}
        />
        <form.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label='Password'
              type='password'
              placeholder='Enter your password...'
              disabled={loading}
            />
          )}
        />
      </FieldGroup>
      {mode === 'sign-up' && (
        <p className='text-muted-foreground text-xs'>
          Registration isn&apos;t wired up yet — sign in with an account created via the backend.
        </p>
      )}
      <LoadingButton loading={loading} type='submit' className='mt-2 ml-auto w-full'>
        {mode === 'sign-up' ? 'Sign Up' : 'Sign In'}
      </LoadingButton>
    </form>
  );
}
