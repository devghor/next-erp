import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfileViewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-lg'>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center gap-4'>
          <UserAvatarProfile className='h-16 w-16 rounded-lg' user={session.user} />
          <div>
            <div className='font-medium'>{session.user.name}</div>
            <div className='text-muted-foreground text-sm'>{session.user.email}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
