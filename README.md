# 업무 일지 시스템 (프론트엔드)

백엔드 API와 연동되는 업무 일지 관리 시스템의 프론트엔드 애플리케이션입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router v6
- Ant Design (UI 컴포넌트 라이브러리)
- Zustand (상태 관리)
- Formik & Yup (폼 관리)
- Axios (API 통신)

## 개발 환경 설정

### 필수 요구사항

- Node.js v20.19.0 이상
- npm 10.x 이상

### 설치 및 실행

1. 의존성 패키지 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000`으로 접속

## 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

## 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   └── layout/       # 레이아웃 관련 컴포넌트
├── pages/            # 페이지 컴포넌트
├── services/         # API 통신 관련 코드
├── store/            # Zustand 스토어
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── App.tsx           # 메인 컴포넌트 및 라우팅 구성
└── main.tsx          # 엔트리 포인트
```

## 주요 기능

- 사용자 인증 (로그인/로그아웃)
- 대시보드 (업무 요약 및 통계)
- 업무 관리 (목록, 추가, 수정, 삭제)
- 역할 기반 접근 제어

## Ant Design 사용

이 프로젝트는 UI 구성을 위해 Ant Design을 사용합니다. Ant Design은 엔터프라이즈급 애플리케이션을 위한 React UI 라이브러리로, 다양한 컴포넌트와 디자인 패턴을 제공합니다.

## 상태 관리

이 프로젝트는 상태 관리를 위해 Zustand를 사용합니다. Zustand는 복잡한 보일러플레이트 없이 간결하고 직관적인 API를 제공합니다.

주요 상태 스토어:
- `authStore.ts`: 인증 관련 상태 및 액션 관리

## 백엔드 연동

이 프로젝트는 `http://localhost:8080`에서 실행되는 백엔드 API 서버와 통신하도록 설정되어 있습니다. 개발 모드에서는 Vite의 프록시 기능을 사용하여 CORS 이슈를 방지합니다.

백엔드 서버의 URL을 변경하려면 `vite.config.ts` 파일에서 프록시 설정을 수정하세요.

## 로그인 정보

테스트 계정:
- 아이디: admin
- 비밀번호: password

- 아이디: user 
- 비밀번호: password
