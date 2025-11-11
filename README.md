# Valkey Express 테스트 서버

이 프로젝트는 Valkey 데이터베이스의 기본적인 `SET` 및 `GET` 명령을 테스트하기 위해 TypeScript로 작성된 간단한 Express.js 서버입니다.

## 요구 사항

-   [Docker](https://www.docker.com/)
-   [Node.js](https://nodejs.org/) (npm 포함)

## 시작하기

프로젝트를 로컬에서 실행하려면 다음 단계를 따르세요.

### 1. Valkey 서버 실행

먼저, Docker를 사용하여 Valkey 서버를 백그라운드에서 시작합니다.

```bash
sudo docker run -d --name valkey-server -p 6379:6379 valkey/valkey
```

### 2. 종속성 설치

프로젝트에 필요한 모든 npm 패키지를 설치합니다.

```bash
npm install
```

### 3. Express 서버 실행

TypeScript 코드를 컴파일하고 서버를 시작합니다.

```bash
npx ts-node index.ts
```

서버가 성공적으로 시작되면, `http://localhost:3000`에서 실행됩니다.

## API 사용법

`curl`과 같은 도구를 사용하여 API 엔드포인트를 테스트할 수 있습니다.

### `POST /set`

Valkey에 키-값 쌍을 저장합니다.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"key": "name", "value": "Valkey"}' http://localhost:3000/set
```

### `GET /get/:key`

키를 사용하여 Valkey에서 값을 조회합니다.

```bash
curl http://localhost:3000/get/name
```
