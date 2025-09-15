'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/layouts/card';

import { useAuthValidation } from '../_common/hooks';

export function SigninForm() {
  const [email] = useState('');
  const [password] = useState('');
  const router = useRouter();
  const { validateAuth } = useAuthValidation();

  // TODO: Implement form submission logic

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>내부 관리자 시스템</CardTitle>
        <CardDescription>로그인 후 사용할 수 있습니다.</CardDescription>
        <CardAction>
          <Button variant='link'>회원가입</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                required
              />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
              </div>
              <Input id='password' type='password' required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex-col gap-2'>
        <Button type='submit' className='w-full'>
          로그인
        </Button>
      </CardFooter>
    </Card>
  );
}
