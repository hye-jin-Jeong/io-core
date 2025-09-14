# Prisma 스키마 멀티 파일 마이그레이션 가이드

## 변경 사항

기존의 단일 `prisma/schema.prisma` 파일을 여러 파일로 분리하여 가독성과 관리 편의성을 향상시켰습니다.

## 새로운 파일 구조

```
prisma/
├── schema/
│   ├── base.prisma          # 기본 설정 + ENUM 정의
│   ├── user.prisma          # 사용자 관련 모델
│   ├── facility.prisma      # 시설 관련 모델
│   ├── attendance.prisma    # 출결 관련 모델
│   └── auth.prisma          # 인증 관련 모델
└── schema.prisma            # (기존 파일 - 백업용)
```

## 파일별 내용

### `base.prisma`
- `generator client` 설정
- `datasource db` 설정
- 모든 ENUM 정의 (UserRole, AttendanceStatus, TagType, DeviceStatus)

### `user.prisma`
- `User` 모델
- `UserFacility` 모델 (사용자-시설 관계)
- `UserGroup` 모델 (사용자-그룹 관계)

### `facility.prisma`
- `Facility` 모델
- `Group` 모델
- `Device` 모델
- `Tag` 모델

### `attendance.prisma`
- `AttendanceRecord` 모델

### `auth.prisma`
- `Session` 모델

## 사용 방법

### 1. Prisma 버전 확인
현재 Prisma 6.16.1을 사용 중이므로 멀티 파일 스키마가 기본 지원됩니다. (6.7.0+ 에서 GA)

### 2. 기존 파일 백업
```bash
# 기존 schema.prisma를 백업
cp prisma/schema.prisma prisma/schema.prisma.backup
```

### 3. 기존 파일 제거 (선택사항)
```bash
# 새로운 구조 적용 후 기존 파일 제거
rm prisma/schema.prisma
```

### 4. Prisma 명령어 실행
기존과 동일하게 사용 가능:

```bash
# 스키마 검증
npx prisma validate

# 스키마 포맷팅
npx prisma format

# 클라이언트 생성
npx prisma generate

# 마이그레이션 생성
npx prisma migrate dev

# 스키마 푸시
npx prisma db push
```

## 장점

### 1. 가독성 향상
- 도메인별로 모델이 분리되어 찾기 쉬움
- 각 파일이 특정 기능에 집중

### 2. 팀 협업 개선
- 여러 개발자가 동시에 다른 파일을 수정 가능
- Git 충돌 가능성 감소

### 3. 유지보수성
- 특정 도메인 모델 수정 시 해당 파일만 열면 됨
- 코드 리뷰가 더 쉬워짐

## 주의사항

### 1. 모델 간 참조
- 다른 파일의 모델을 자유롭게 참조 가능
- import 구문 불필요 (Prisma가 자동으로 처리)

### 2. 중복 정의 방지
- 같은 모델이나 ENUM을 여러 파일에 정의하면 안됨
- generator와 datasource는 하나의 파일에만 정의

### 3. 파일명 규칙
- `.prisma` 확장자 필수
- 파일명은 자유롭게 설정 가능

## 마이그레이션 체크리스트

- [ ] 새로운 스키마 파일들이 올바르게 생성되었는지 확인
- [ ] `npx prisma validate` 실행하여 스키마 검증
- [ ] `npx prisma generate` 실행하여 클라이언트 재생성
- [ ] 기존 데이터베이스와 호환성 확인
- [ ] 테스트 실행하여 동작 확인

## 롤백 방법

문제가 발생한 경우 기존 구조로 복원:

```bash
# schema 디렉토리 제거
rm -rf prisma/schema

# 백업 파일 복원
cp prisma/schema.prisma.backup prisma/schema.prisma

# 클라이언트 재생성
npx prisma generate
```