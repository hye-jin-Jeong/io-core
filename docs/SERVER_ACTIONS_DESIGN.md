# Server Actions 설계 문서

## 개요
Next.js App Router의 Server Actions를 사용하여 타입 안전한 서버사이드 로직을 구현합니다.

## 아키텍처 구조

### 디렉토리 구조
```
src/
├── domains/
│   ├── auth/
│   │   └── _common/
│   │       └── actions/
│   │           ├── signIn.ts
│   │           ├── signOut.ts
│   │           └── getCurrentUser.ts
│   ├── facility/
│   │   └── _common/
│   │       └── actions/
│   │           ├── create.ts
│   │           ├── update.ts
│   │           ├── delete.ts
│   │           └── getList.ts
│   ├── user/
│   │   └── _common/
│   │       └── actions/
│   │           ├── create.ts
│   │           ├── update.ts
│   │           ├── delete.ts
│   │           └── getList.ts
│   ├── group/
│   │   └── _common/
│   │       └── actions/
│   │           ├── create.ts
│   │           ├── update.ts
│   │           ├── delete.ts
│   │           └── getList.ts
│   ├── device/
│   │   └── _common/
│   │       └── actions/
│   │           ├── create.ts
│   │           ├── update.ts
│   │           ├── delete.ts
│   │           └── getList.ts
│   ├── tag/
│   │   └── _common/
│   │       └── actions/
│   │           ├── create.ts
│   │           ├── update.ts
│   │           ├── delete.ts
│   │           └── getList.ts
│   └── attendance/
│       └── _common/
│           └── actions/
│               ├── create.ts
│               ├── update.ts
│               ├── delete.ts
│               ├── getRecords.ts
│               └── getRealTimeStatus.ts
├── lib/
│   ├── prisma.ts
│   ├── auth/
│   │   ├── config.ts
│   │   └── permissions.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── facility.ts
│   │   ├── user.ts
│   │   ├── device.ts
│   │   └── attendance.ts
│   └── utils/
│       ├── response.ts
│       └── permissions.ts
└── app/
    └── api/
        └── device/              # 장치 통신용 REST API
            ├── attendance/
            ├── status/
            └── tags/
```

## Server Actions 설계 패턴

### 1. 기본 구조
```typescript
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { checkPermission } from '@/lib/auth/permissions'

// Input 검증 스키마
const createFacilitySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  description: z.string().optional(),
})

// Response 타입
type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
}

export async function createFacility(
  formData: FormData
): Promise<ActionResult<Facility>> {
  try {
    // 1. 인증 확인
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    // 2. 권한 확인
    if (!checkPermission(user, 'facility', 'create')) {
      return { success: false, error: '권한이 없습니다.' }
    }

    // 3. 입력값 검증
    const validatedData = createFacilitySchema.parse({
      name: formData.get('name'),
      address: formData.get('address'),
      description: formData.get('description'),
    })

    // 4. 비즈니스 로직 실행
    const facility = await prisma.facility.create({
      data: validatedData,
    })

    return { success: true, data: facility }
  } catch (error) {
    console.error('createFacility error:', error)
    return {
      success: false,
      error: error instanceof z.ZodError
        ? '입력값이 유효하지 않습니다.'
        : '시설 생성에 실패했습니다.'
    }
  }
}
```

### 2. 권한 시스템
```typescript
// lib/auth/permissions.ts
export function checkPermission(
  user: User,
  resource: string,
  action: string,
  targetId?: string
): boolean {
  switch (user.role) {
    case 'INTERNAL_ADMIN':
      return true // 모든 권한

    case 'FACILITY_MANAGER':
      if (resource === 'facility') {
        // 자신이 관리하는 시설만
        return user.managedFacilities.some(f => f.facilityId === targetId)
      }
      return false

    case 'USER':
      if (resource === 'attendance' && action === 'read') {
        // 본인 출결 기록만
        return user.id === targetId
      }
      return false

    default:
      return false
  }
}
```

## 도메인별 Actions

### 1. 인증 (auth/_common/actions)

#### signIn.ts
- 사용자 로그인 처리
- 세션 생성
- 권한별 리다이렉트

#### signOut.ts
- 세션 삭제
- 로그아웃 처리

#### getCurrentUser.ts
- 현재 사용자 정보 조회
- 권한 정보 포함

### 2. 시설 관리 (facility/_common/actions)

#### create.ts
- 새 시설 등록
- 내부 관리자만 가능

#### update.ts
- 시설 정보 수정
- 내부 관리자 또는 해당 시설 관리자 가능

#### delete.ts
- 시설 삭제 (soft delete)
- 관련 데이터 정리

#### getList.ts
- 시설 목록 조회
- 권한별 필터링

### 3. 사용자 관리 (user/_common/actions)

#### create.ts
- 사용자 등록
- 그룹 배정
- 태그 할당

#### update.ts
- 사용자 정보 수정
- 그룹 변경

#### delete.ts
- 사용자 삭제
- 관련 데이터 정리

#### getList.ts
- 사용자 목록 조회
- 시설/그룹별 필터링

### 4. 출결 관리 (attendance/_common/actions)

#### create.ts
- 수동 출결 등록
- 시설 관리자 권한 필요

#### update.ts
- 출결 기록 수정
- 사유 기록 필수

#### delete.ts
- 출결 기록 삭제
- 감사 로그 남김

#### getRecords.ts
- 출결 기록 조회
- 다양한 필터링 옵션

#### getRealTimeStatus.ts
- 실시간 출결 현황
- 시설별 현재 상태

## 장치 통신용 REST API

### /api/device/attendance/route.ts
```typescript
// POST /api/device/attendance
// 장치에서 출결 데이터 전송
export async function POST(request: Request) {
  const { deviceId, tagId, timestamp } = await request.json()

  // 1. 장치 인증
  // 2. 태그 검증
  // 3. 출결 기록 생성
  // 4. 응답
}
```

### /api/device/status/route.ts
```typescript
// POST /api/device/status
// 장치 상태 업데이트
export async function POST(request: Request) {
  const { deviceId, status, lastSeenAt } = await request.json()

  // 1. 장치 상태 업데이트
  // 2. 모니터링 데이터 기록
}
```

### /api/device/tags/route.ts
```typescript
// GET /api/device/tags?deviceId=xxx
// 장치별 태그 목록 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get('deviceId')

  // 1. 장치 인증
  // 2. 태그 목록 반환
}
```

## 에러 처리 및 로깅

### 표준 에러 응답
```typescript
type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}
```

### 로깅 전략
- 모든 Action에 기본 로깅
- 에러 발생 시 상세 로그
- 보안 관련 이벤트 별도 로깅

## 성능 최적화

### 1. 캐싱
- React Query 활용
- Server Component에서 적절한 캐싱

### 2. 데이터베이스 최적화
- 적절한 인덱스 활용
- N+1 쿼리 방지
- 페이지네이션 구현

### 3. 검증 최적화
- Zod 스키마 재사용
- 클라이언트/서버 검증 분리

## 테스트 전략

### Unit Test
- 각 Action별 단위 테스트
- Mock 데이터 활용

### Integration Test
- 데이터베이스 연동 테스트
- 권한 시스템 테스트

### E2E Test
- 실제 워크플로 테스트
- 장치 통신 테스트