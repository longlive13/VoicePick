# 🎙️ AI Dubbing Service

## 1. 서비스 소개

AI Dubbing Service는 사용자가 음성 또는 영상 데이터를 기반으로 더빙 작업을 관리할 수 있는 웹 서비스입니다.
Google 로그인 기능을 통해 사용자 인증을 처리하고, 더빙 작업 정보를 데이터베이스에 저장하여 사용자별 작업을 관리할 수 있도록 구현했습니다.

프론트엔드와 백엔드를 분리하여 개발하였으며, 인증 → 데이터 저장 → 조회까지의 전체 흐름을 경험하는 것을 목표로 제작되었습니다.

---

## 2. 주요 기능

* Google OAuth 기반 로그인
* 사용자 정보 저장 및 인증 처리
* 더빙 작업 데이터 저장 및 조회
* 프론트엔드 → 백엔드 API 연동
* Turso DB 연동 (클라우드 환경 고려)
* 환경변수 기반 설정 (배포 대응)

---

## 3. 기술 스택

### Frontend

* Next.js
* TypeScript
* React
* NextAuth.js
* Tailwind CSS

### Backend

* NestJS
* TypeScript

### Database

* Turso (libSQL)

### Deployment

* Vercel

### Authentication

* Google OAuth

---

## 4. 프로젝트 구조

```
project-root
├─ frontend
│  ├─ app
│  ├─ components
│  ├─ lib
│  └─ ...
├─ backend
│  ├─ src
│  └─ ...
└─ README.md
```

---

## 5. 로컬 실행 방법

### 5-1. 사전 준비

* Node.js 18 이상
* npm 또는 pnpm
* Turso DB 생성 및 토큰 발급
* Google OAuth Client ID / Secret

---

### 5-2. 환경변수 설정

#### Frontend (`.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Backend (`.env`)

```env
DATABASE_URL=your_turso_database_url
DATABASE_AUTH_TOKEN=your_turso_auth_token

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

### 5-3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

👉 http://localhost:3000

---

### 5-4. 백엔드 실행

```bash
cd backend
npm install
npm run start:dev
```

👉 http://localhost:3001 

---

## 6. 배포된 서비스 URL

* Frontend: https://voice-pick-real-frontend.vercel.app/
* Backend: https://voice-pick-real-backend.vercel.app/

---

## 7. 주요 구현 내용

### 7-1. Google 로그인 흐름

1. NextAuth를 통해 Google 로그인 수행
2. 로그인 후 session 정보 획득
3. 사용자 email 정보를 백엔드로 전달
4. 백엔드에서 사용자 저장 또는 조회

---

### 7-2. 프론트 → 백엔드 통신

```ts
const session = await getSession();

await fetch('http://localhost:3000/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: session.user.email,
  }),
});
```

---

### 7-3. Turso DB 연결

```ts
import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});
```

* 로컬 DB → Turso 클라우드 DB로 전환
* 환경변수를 통한 안전한 인증 처리

---

## 8. 코딩 에이전트 활용 방법 및 노하우

### 활용 내용

* README 문서 초안 작성
* 오류 원인 분석 (ffmpeg, env, API 연결 등)
* Turso 연결 코드 구성
* 프론트/백엔드 통신 흐름 설계

---

### 활용 노하우

* 기능 단위로 질문 → 더 정확한 답변 가능
* 에러 발생 시 로그 + 코드 함께 제공
* AI 코드 그대로 사용하지 않고 구조에 맞게 수정
* 문서화는 초안 생성 → 직접 검증 후 보완 방식 사용

---

## 9. 회고

이 프로젝트를 통해 인증, API 통신, 데이터베이스 연동, 배포 환경 설정까지 전체적인 서비스 흐름을 경험했습니다.

특히 로컬 환경에서 동작하던 서비스를 배포 환경에서도 안정적으로 동작하도록 수정하는 과정에서 환경변수 관리와 외부 DB 연동의 중요성을 이해하게 되었습니다.

또한 AI 코딩 에이전트를 활용하여 개발 속도를 높일 수 있었지만, 최종적으로는 코드 검증과 구조 이해가 필수적이라는 점을 배울 수 있었습니다.

---

## 10. 문서 작성 방식

※ 본 README는 AI 코딩 에이전트의 도움을 받아 초안을 작성한 뒤, 실제 프로젝트 구현 내용에 맞게 수정·보완하였습니다.
