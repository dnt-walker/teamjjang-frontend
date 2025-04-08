import fs from 'fs';

try {
  const filePath = './src/pages/ProjectDetail.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 중복된 import 제거
  content = content.replace(
    "import { useState, useEffect } from 'react';\nimport { useLocation } from 'react-router-dom';\nimport { useParams, useNavigate } from 'react-router-dom';",
    "import { useState, useEffect } from 'react';\nimport { useParams, useNavigate, useLocation } from 'react-router-dom';"
  );
  
  // 중복된 location 객체 초기화 제거
  content = content.replace(
    "const [taskLoading, setTaskLoading] = useState<boolean>(true);\n  \n  // 이전 페이지 경로 확인\n  const location = useLocation();",
    "const [taskLoading, setTaskLoading] = useState<boolean>(true);"
  );
  
  // 버튼 텍스트 확인 및 수정
  // 모든 '대시보드로 이동'를 '대시보드로 이동'으로 수정
  content = content.replace(/대시보드로 이동/g, '대시보드로 이동');
  
  // 저장
  fs.writeFileSync(filePath, content);
  console.log('중복된 imports 및 객체 초기화 제거 완료');
} catch (err) {
  console.error('오류:', err);
}
