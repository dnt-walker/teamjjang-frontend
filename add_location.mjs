import fs from 'fs';

try {
  const filePath = './src/pages/ProjectDetail.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // location 객체 추가
  content = content.replace(
    "const navigate = useNavigate();",
    "const navigate = useNavigate();\n  const location = useLocation();"
  );
  
  // 저장
  fs.writeFileSync(filePath, content);
  console.log('location 객체 추가 완료');
} catch (err) {
  console.error('오류:', err);
}
