import fs from 'fs';

const filePath = './src/pages/ProjectDetail.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. useLocation 임포트 추가
content = content.replace(
  'import { useParams, useNavigate } from \'react-router-dom\';',
  'import { useParams, useNavigate, useLocation } from \'react-router-dom\';'
);

// 2. location 객체 사용 추가
content = content.replace(
  'const navigate = useNavigate();',
  'const navigate = useNavigate();\n  const location = useLocation();'
);

// 저장
fs.writeFileSync(filePath, content);
console.log('imports 수정 완료');
