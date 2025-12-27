# Phase 2 설정 가이드

Phase 2 구현이 완료되었습니다. 이제 Supabase 설정 및 환경 변수를 구성해야 합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: mck-gg)
4. Database Password 설정
5. Region 선택 (한국: Northeast Asia (Seoul))
6. "Create new project" 클릭

## 2. 데이터베이스 마이그레이션 실행

Supabase 대시보드에서:

1. 좌측 메뉴에서 "SQL Editor" 클릭
2. 다음 파일들을 순서대로 실행:
   - `supabase/migrations/001_create_members_table.sql`
   - `supabase/migrations/002_create_matches_table.sql`
   - `supabase/migrations/003_create_game_results_table.sql`
   - `supabase/migrations/004_create_indexes.sql`

각 파일의 내용을 복사하여 SQL Editor에 붙여넣고 "Run" 버튼 클릭

## 3. Supabase API 키 가져오기

1. 좌측 메뉴에서 "Settings" > "API" 클릭
2. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - **service_role** (Show 클릭 후): `SUPABASE_SERVICE_ROLE_KEY`에 사용

## 4. 관리자 비밀번호 해시 생성

터미널에서 다음 명령 실행:

```bash
yarn add -D tsx
npx tsx scripts/generate-password-hash.ts your-admin-password
```

출력된 `ADMIN_PASSWORD_HASH` 값을 복사합니다.

## 5. 환경 변수 설정

`.env.local` 파일 생성 (프로젝트 루트):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Auth
ADMIN_PASSWORD_HASH=bcrypt-hash-from-step-4
JWT_SECRET=random-secret-key-minimum-32-characters

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**JWT_SECRET 생성** (Node.js REPL):
```javascript
require('crypto').randomBytes(32).toString('hex')
```

## 6. 개발 서버 실행

```bash
yarn dev
```

## 7. 기능 테스트

### 관리자 로그인
1. http://localhost:3000/admin/login 접속
2. Step 4에서 설정한 비밀번호로 로그인
3. 로그인 성공 시 `/admin/members`로 리다이렉트

### 멤버 관리
1. 로그인 후 "멤버 추가" 버튼 클릭
2. 소환사명 입력 및 포지션 선택
3. 멤버 생성, 수정, 삭제 테스트

### 네비게이션
- 로그인 전: 홈, 경기 기록, 통계 메뉴만 표시
- 로그인 후: 멤버 관리, 경기 등록 메뉴 추가 표시
- 로그아웃 버튼 클릭 시 로그아웃 및 홈으로 이동

## 구현된 기능

### 데이터베이스
- [x] Members 테이블
- [x] Matches 테이블
- [x] GameResults 테이블 (모든 통계 필드 포함)
- [x] 인덱스 최적화

### 관리자 인증
- [x] 단일 비밀번호 기반 인증
- [x] JWT 토큰 생성/검증
- [x] HttpOnly 쿠키 사용
- [x] 로그인 페이지
- [x] 로그아웃 기능

### 멤버 관리
- [x] 멤버 목록 조회
- [x] 멤버 생성
- [x] 멤버 수정
- [x] 멤버 삭제
- [x] 소환사명 중복 검증
- [x] 선호 포지션 설정

### UI/UX
- [x] 인증 상태 기반 네비게이션
- [x] 보호된 관리자 페이지
- [x] 로딩 및 에러 상태 처리
- [x] Modal을 사용한 폼
- [x] 반응형 디자인

## 다음 단계 (Phase 3)

Phase 3에서는 다음 기능을 구현할 예정입니다:

1. **경기 등록**
   - 스크린샷 업로드
   - Claude Vision API를 사용한 자동 파싱
   - 수동 검수 UI
   - 경기 결과 저장

2. **경기 히스토리**
   - 날짜별 경기 목록
   - 경기 상세 정보
   - 팀 구성 및 결과

3. **기본 통계**
   - 개인별 승률, KDA
   - 챔피언별 통계
   - 포지션별 성적

## 문제 해결

### 환경 변수가 인식되지 않을 때
- 개발 서버를 재시작하세요
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 변수명 오타 확인

### 로그인이 안 될 때
- `ADMIN_PASSWORD_HASH`가 올바르게 생성되었는지 확인
- `JWT_SECRET`이 32자 이상인지 확인
- 브라우저 콘솔에서 에러 확인

### Supabase 연결 오류
- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 확인
