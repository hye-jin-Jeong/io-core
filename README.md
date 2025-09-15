# IO-Core Project

Feature-Sliced Design 기반 Next.js 프로젝트

## 프로젝트 구조

이 프로젝트는 [Feature-Sliced Design (FSD)](https://feature-sliced.design/) 아키텍처를 기반으로 하며, 다음과 같은 구조를 따릅니다:

```
src/
├── app/                 # Next.js App Router
├── components/          # 도메인에 종속되지 않는 공통 컴포넌트
├── domains/             # 도메인 종속적인 컴포넌트
│   └── [domain]/
│       ├── _common/     # 도메인 내 공통 모듈 (hooks, utils, types)
│       ├── [subdomain]/ # 하위 도메인 컴포넌트
│       └── ...
├── widgets/             # 여러 도메인을 조합하는 복합 컴포넌트
├── lib/                 # 외부 라이브러리 설정 및 유틸리티
└── generated/           # 자동 생성 코드 (Prisma 등)
```

### 레이어 설명

#### 1. **Components (공통 레이어)**

- `src/components/`: 도메인에 종속되지 않는 재사용 가능한 UI 컴포넌트
- 예: Button, Input, Modal, Layout 등
- 모든 도메인에서 자유롭게 사용 가능

#### 2. **Domains (도메인 레이어)**

- `src/domains/[domain]/`: 특정 도메인에 종속적인 컴포넌트
- 각 도메인은 독립적이며, 동일 레벨의 다른 도메인을 직접 참조할 수 없음

##### 도메인 내부 구조:

- `_common/`: 도메인 내 공통 모듈
  - `hooks/`: 도메인 전용 커스텀 훅
  - `utils/`: 도메인 전용 유틸리티 함수
  - `types/`: 도메인 전용 타입 정의
- `[subdomain]/`: 하위 도메인별 컴포넌트

#### 3. **Widgets (위젯 레이어)**

- `src/widgets/`: 여러 도메인을 조합하는 복합 컴포넌트
- 높은 레벨의 도메인 간 참조가 필요한 경우 사용
- 페이지 레벨의 복잡한 UI 구성

## 참조 규칙

### ✅ 허용되는 참조

1. **상위 → 하위 참조**

   ```typescript
   // widgets에서 domains 참조
   import { UserProfile } from '../../domains/auth/user';

   // domains에서 components 참조
   import { Button } from '../../../components/ui/Button';
   ```

2. **같은 도메인 내 \_common 참조**

   ```typescript
   // domains/auth/user에서 domains/auth/_common 참조
   import { useAuthValidation } from '../_common/hooks';
   ```

3. **라이브러리 및 Next.js 기본 모듈**
   ```typescript
   import { useState } from 'react';
   import { NextPage } from 'next';
   ```

### ❌ 금지되는 참조

1. **동일 레벨 도메인 간 참조**

   ```typescript
   // ❌ domains/auth/user에서 domains/auth/board 참조 금지
   import { BoardList } from '../board/BoardList';

   // ❌ domains/auth에서 domains/dashboard 참조 금지
   import { Dashboard } from '../dashboard';
   ```

2. **하위 → 상위 참조**

   ```typescript
   // ❌ components에서 domains 참조 금지
   import { UserProfile } from '../domains/auth/user';

   // ❌ domains에서 widgets 참조 금지
   import { AuthDashboard } from '../widgets/auth';
   ```

## 명명 규칙

### 컴포넌트

- **PascalCase** 사용
- 의미 있고 구체적인 이름
- 예: `UserProfile`, `LoginForm`, `ProductCard`

### 파일명

- **PascalCase** (컴포넌트 파일)
- **camelCase** (훅, 유틸리티)
- **kebab-case** (페이지 파일, Next.js 라우팅)

### 디렉토리

- **camelCase** 또는 **kebab-case**
- `_common` 디렉토리는 밑줄로 시작 (개발 편의성)

### 훅

- `use`로 시작하는 **camelCase**
- 예: `useAuthValidation`, `useLocalStorage`

### 타입/인터페이스

- **PascalCase**
- Interface는 `I` 접두사 없이 사용
- 예: `User`, `AuthState`, `ApiResponse`

## 개발 규칙

### Import 순서

```typescript
// 1. 외부 라이브러리
import React from 'react';
import { NextPage } from 'next';

// 2. 내부 라이브러리 (lib)
import { cn } from '@/lib/utils';

// 3. 공통 컴포넌트 (components)
import { Button } from '@/components/ui/Button';

// 4. 도메인 컴포넌트 (domains)
import { UserProfile } from '@/domains/auth/user';

// 5. 상대 경로
import './styles.css';
```

### 경로 별칭

- `@/`: src 디렉토리 루트
- 절대 경로 사용 권장

### Export 패턴

```typescript
// index.ts에서 re-export
export * from './UserProfile'
export * from './UserSettings'

// Named export 사용
export const UserProfile = () => { ... }

// Default export는 페이지 컴포넌트에서만 사용
export default function HomePage() { ... }
```

## Getting Started

### 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 빌드

```bash
npm run build
npm run start
```

### 린팅 및 타입 체크

```bash
npm run lint
npm run type-check
```

## 예시 사용법

### 도메인 컴포넌트 생성

```typescript
// src/domains/auth/user/UserProfile.tsx
import { useAuthValidation } from '../_common/hooks'

export const UserProfile = () => {
  const { isValid } = useAuthValidation()

  return (
    <div>
      <h2>User Profile</h2>
      {/* 구현 */}
    </div>
  )
}
```

### 위젯에서 도메인 조합

```typescript
// src/widgets/auth/AuthDashboard.tsx
import { UserProfile } from '../../domains/auth/user'
import { BoardList } from '../../domains/auth/board'

export const AuthDashboard = () => {
  return (
    <div>
      <UserProfile />
      <BoardList />
    </div>
  )
}
```

### 공통 훅 생성

```typescript
// src/domains/auth/_common/hooks/useAuthValidation.ts
import { useState } from 'react';

export const useAuthValidation = () => {
  const [isValid, setIsValid] = useState(false);

  const validateAuth = (token: string) => {
    setIsValid(!!token);
  };

  return { isValid, validateAuth };
};
```

## 배포

### Vercel

```bash
vercel --prod
```

자세한 배포 방법은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참고하세요.
