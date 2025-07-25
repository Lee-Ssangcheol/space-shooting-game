# 슈팅 게임

HTML5 Canvas와 Electron을 사용한 데스크톱 슈팅 게임입니다.

## 개발 환경 설정

1. Node.js 설치 (https://nodejs.org/)
2. 프로젝트 의존성 설치:
```bash
npm install
```

## 개발 모드 실행

```bash
npm start
```

## 실행 파일 빌드

### Windows 설치 파일 생성
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에서 찾을 수 있습니다:
- `dist/win-unpacked/` - 포터블 버전
- `dist/Shooting Game Setup.exe` - 설치 파일

## 게임 조작 방법

- 방향키: 플레이어 이동
- 스페이스바: 총알 발사
- 게임 오버 시 스페이스바: 재시작

## 리소스 파일

게임에 필요한 리소스 파일들을 다음 위치에 배치해야 합니다:

### 이미지 파일
- `assets/images/player.png` - 플레이어 우주선
- `assets/images/enemy.png` - 적 우주선
- `assets/images/bullet.png` - 총알
- `assets/images/explosion.png` - 폭발 효과 (스프라이트 시트)
- `assets/images/background.png` - 배경 이미지

### 사운드 파일
- `assets/sounds/shoot.mp3` - 발사 효과음
- `assets/sounds/explosion.mp3` - 폭발 효과음
- `assets/sounds/collision.mp3` - 충돌 효과음
- `assets/sounds/background.mp3` - 배경 음악

## 라이선스

ISC License 