import fs from 'fs';

try {
  const filePath = './src/pages/TaskDetail.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 버튼 텍스트 변경: "목록으로 돌아가기"를 "프로젝트로 돌아가기"로 수정
  content = content.replace(/\{projectId \? ['"]목록으로 돌아가기['"] : ['"]업무 목록으로 돌아가기['"]\}/g, 
                           '{projectId ? "프로젝트로 돌아가기" : "업무 목록으로 돌아가기"}');
  
  // 저장
  fs.writeFileSync(filePath, content);
  console.log('버튼 텍스트 변경 완료: "목록으로 돌아가기" → "프로젝트로 돌아가기"');
} catch (err) {
  console.error('오류:', err);
}
