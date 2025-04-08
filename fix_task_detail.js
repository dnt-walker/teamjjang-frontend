const fs = require('fs');

try {
  // TaskDetail.tsx 파일 읽기
  const filePath = './src/pages/TaskDetail.tsx';
  console.log(`Reading file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`File content length: ${content.length} bytes`);
  
  // 원본 텍스트 패턴 찾기
  const originalPattern = /\{projectId \? ['"]프로젝트로 돌아가기['"] : ['"]업무 목록으로 돌아가기['"]\}/g;
  const matches = content.match(originalPattern);
  
  console.log(`Found matches: ${matches ? matches.length : 0}`);
  if (matches) {
    console.log(`First match: ${matches[0]}`);
  }
  
  // 백틱을 사용한 패턴으로 다시 시도
  const simplePattern = /프로젝트로 돌아가기/g;
  const simpleMatches = content.match(simplePattern);
  
  console.log(`Simple pattern matches: ${simpleMatches ? simpleMatches.length : 0}`);
  if (simpleMatches) {
    console.log(`Simple matches: ${JSON.stringify(simpleMatches)}`);
  }
  
  // "프로젝트로 돌아가기"를 "목록으로 돌아가기"로 변경 (간단한 방식)
  const newContent = content.replace(/프로젝트로 돌아가기/g, '목록으로 돌아가기');
  
  // 수정된 내용을 파일에 쓰기
  fs.writeFileSync(filePath, newContent);
  
  console.log('TaskDetail.tsx 파일이 수정되었습니다.');
} catch(err) {
  console.error('Error:', err.message);
}
