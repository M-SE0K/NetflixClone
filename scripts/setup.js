#!/usr/bin/env node

/**
 * M-FLIX 프로젝트 초기 설정 스크립트
 * npm run setup 으로 실행
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

// .env.example 내용
const ENV_EXAMPLE_CONTENT = `# M-FLIX 환경 변수 설정
# TMDB API Key를 입력하세요 (https://www.themoviedb.org/ 에서 발급)
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY_HERE
`;

// readline 인터페이스
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log(`
${colors.bold}${colors.cyan}╔═══════════════════════════════════════╗
║     M-FLIX 프로젝트 설정 스크립트     ║
╚═══════════════════════════════════════╝${colors.reset}
`);

  // 1. .env.example 생성
  log.title('1. 환경 변수 템플릿 확인');
  
  const envExamplePath = path.join(ROOT_DIR, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, ENV_EXAMPLE_CONTENT);
    log.success('.env.example 파일 생성 완료');
  } else {
    log.info('.env.example 파일이 이미 존재합니다');
  }

  // 2. .env 파일 확인 및 생성
  log.title('2. 환경 변수 파일 설정');
  
  const envPath = path.join(ROOT_DIR, '.env');
  if (!fs.existsSync(envPath)) {
    log.warn('.env 파일이 없습니다.');
    
    const answer = await question(`${colors.yellow}TMDB API Key를 입력하시겠습니까? (y/n): ${colors.reset}`);
    
    if (answer.toLowerCase() === 'y') {
      const apiKey = await question(`${colors.cyan}TMDB API Key: ${colors.reset}`);
      
      if (apiKey && apiKey.trim()) {
        const envContent = `# M-FLIX 환경 변수 설정
VITE_TMDB_API_KEY=${apiKey.trim()}
`;
        fs.writeFileSync(envPath, envContent);
        log.success('.env 파일 생성 완료 (API Key 설정됨)');
      } else {
        fs.copyFileSync(envExamplePath, envPath);
        log.warn('.env 파일 생성됨 (API Key를 나중에 설정해주세요)');
      }
    } else {
      fs.copyFileSync(envExamplePath, envPath);
      log.warn('.env 파일 생성됨 (.env.example 복사)');
      log.info('나중에 .env 파일에서 VITE_TMDB_API_KEY를 설정해주세요');
    }
  } else {
    log.success('.env 파일이 이미 존재합니다');
    
    // API Key가 설정되어 있는지 확인
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('YOUR_TMDB_API_KEY_HERE') || !envContent.includes('VITE_TMDB_API_KEY=')) {
      log.warn('TMDB API Key가 아직 설정되지 않았습니다. .env 파일을 수정해주세요');
    }
  }

  // 3. 디렉토리 구조 확인
  log.title('3. 프로젝트 구조 확인');
  
  const requiredDirs = [
    'src/api',
    'src/components/common',
    'src/components/domain',
    'src/hooks',
    'src/pages',
    'src/store',
    'src/types'
  ];

  let allDirsExist = true;
  for (const dir of requiredDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      log.success(`${dir}/ 존재`);
    } else {
      log.error(`${dir}/ 없음`);
      allDirsExist = false;
    }
  }

  // 4. TypeScript 설정 확인
  log.title('4. TypeScript 설정 확인');
  
  const tsConfigPath = path.join(ROOT_DIR, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    log.success('tsconfig.json 존재');
  } else {
    log.error('tsconfig.json이 없습니다');
  }

  // 5. 완료 메시지
  log.title('설정 완료!');
  
  console.log(`
${colors.green}다음 명령어로 개발 서버를 시작하세요:${colors.reset}

  ${colors.cyan}npm run dev${colors.reset}

${colors.yellow}주의사항:${colors.reset}
  • TMDB API Key가 필요합니다
  • .env 파일에서 VITE_TMDB_API_KEY를 설정하세요
  • https://www.themoviedb.org/ 에서 API Key를 발급받을 수 있습니다

${colors.cyan}사용 가능한 스크립트:${colors.reset}
  npm run dev       - 개발 서버 시작
  npm run build     - 프로덕션 빌드
  npm run preview   - 빌드 미리보기
  npm run lint      - ESLint 검사
  npm run typecheck - TypeScript 타입 체크
  npm run deploy    - GitHub Pages 배포
`);

  rl.close();
}

main().catch((err) => {
  log.error(`설정 중 오류 발생: ${err.message}`);
  rl.close();
  process.exit(1);
});

