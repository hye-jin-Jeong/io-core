'use server';

import { redirect } from 'next/navigation';
import { signIn } from 'next-auth/react';

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    if (result?.ok) {
      redirect('/dashboard');
    }

    return {
      success: false,
      error: '로그인에 실패했습니다.',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}
