import fs from 'fs';

try {
  // TaskDetail.tsx 파일 읽기
  const filePath = './src/pages/TaskDetail.tsx';
  console.log(`Reading file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`File content length: ${content.length} bytes`);
  
  // 간단한 방식으로 "프로젝트로 돌아가기"를 "목록으로 돌아가기"로 변경
  const newContent = content.replace(/프로젝트로 돌아가기/g, '목록으로 돌아가기');
  
  // 수정된 내용을 파일에 쓰기
  fs.writeFileSync(filePath, newContent);
  
  console.log('TaskDetail.tsx 파일이 수정되었습니다.');
} catch(err) {
  console.error('Error:', err.message);
}
