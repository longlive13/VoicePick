# 🎙️ AI Dubbing Service

## 1. 서비스 소개

AI Dubbing Service는 사용자가 업로드한 음성 또는 영상 파일을 기반으로
AI를 활용하여 자동 더빙을 수행하는 웹 서비스입니다.

Google OAuth를 통한 인증 이후,
파일 업로드 → 음성 추출 → 전사(STT) → 번역 → 음성 합성(TTS)까지
전체 더빙 파이프라인을 자동으로 처리하도록 구현했습니다.

프론트엔드와 백엔드를 분리하여 개발하였으며,
인증, 파일 처리, AI API 연동, 데이터 저장까지
실제 서비스 구조를 경험하는 것을 목표로 제작되었습니다.

![로그인화면](https://github.com/user-attachments/assets/3fbf4fea-cda8-4d7a-b879-9349373ba522)
![더빙1](https://github.com/user-attachments/assets/bcc51074-1592-4bcc-b9f7-38d85c56a8bf)



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

### AI

* OpenAI (번역)
* ElevenLabs (STT, TTS)

### Database

* Turso (libSQL)

### Deployment

* Vercel (Serverless)

### Authentication

* Google OAuth

---

## 4. 프로젝트 구조

```
project-root
├─ frontend                 # Next.js (App Router 기반 프론트엔드)
│  ├─ app                   # 페이지 및 라우팅
│  │  ├─ api               # NextAuth API (Google 로그인)
│  │  └─ ...
│  ├─ components           # UI 컴포넌트
│  ├─ lib                  # API 통신, util 함수
│  ├─ providers            # SessionProvider 등 전역 설정
│  ├─ public               # 정적 파일
│  └─ ...
│
├─ backend                 # NestJS 서버 (Vercel Serverless)
│  ├─ src
│  │  ├─ auth
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.service.ts
│  │  │  └─ auth.guard.ts
│  │  │
│  │  ├─ dubbing
│  │  │  ├─ controller
│  │  │  ├─ service
│  │  │  ├─ dto
│  │  │  └─ dubbing.module.ts
│  │  │
│  │  ├─ database
│  │  │  └─ database.service.ts
│  │  │
│  │  ├─ app.module.ts
│  │  ├─ app.controller.ts
│  │  └─ main.ts
│  │
│  └─ ...
│
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

### 7-2. 전체 더빙 파이프라인

1. 파일 업로드 (Multer)
2. ffmpeg로 오디오 추출 및 편집
3. 음성 → 텍스트 변환 (STT)
4. 텍스트 번역 (OpenAI)
5. 음성 합성 (TTS)
6. 결과 파일 저장 및 반환

---

### 7-3. 프론트 → 백엔드 통신

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

### 7-4. Turso DB 연결

```ts
import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});
```

* 로컬 DB → Turso 클라우드 DB로 전환
* 환경변수를 통한 안전한 인증 처리
* Vercel Serverless 환경에서 `/tmp` 디렉토리 사용
* `ffmpeg-static`을 통해 서버 환경에서도 ffmpeg 실행 가능
* 환경변수를 통해 API 키 및 DB 연결 관리

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

### 🔧 트러블슈팅

#### 문제 1. Vercel에서 파일 업로드 실패

* **원인**
  서버리스 환경에서는 로컬 파일 시스템을 영구적으로 사용할 수 없음
* **해결**
  `/tmp` 디렉토리를 사용하도록 변경

---

#### 문제 2. ffmpeg 실행 실패

* **원인**
  Vercel 환경에 ffmpeg 바이너리가 없음
* **해결**
  `ffmpeg-static` 패키지 사용

---

#### 문제 3. 업로드 파일 경로 오류

* **원인**
  `/tmp/uploads` 와 `storage/uploads` 경로 불일치
* **해결**
  경로를 `/tmp`로 통일

---

## 9. 회고

이 프로젝트를 통해 인증, API 통신, 데이터베이스 연동, 배포 환경 설정까지 전체적인 서비스 흐름을 경험했습니다.

특히 로컬 환경에서 동작하던 서비스를 배포 환경에서도 안정적으로 동작하도록 수정하는 과정에서 환경변수 관리와 외부 DB 연동의 중요성을 이해하게 되었습니다.

또한 AI 코딩 에이전트를 활용하여 개발 속도를 높일 수 있었지만, 최종적으로는 코드 검증과 구조 이해가 필수적이라는 점을 배울 수 있었습니다.

---

## 10. 문서 작성 방식

※ 본 README는 AI 코딩 에이전트의 도움을 받아 초안을 작성한 뒤, 실제 프로젝트 구현 내용에 맞게 수정·보완하였습니다.
