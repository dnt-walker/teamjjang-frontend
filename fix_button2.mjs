import fs from 'fs';

try {
  const filePath = './src/pages/TaskDetail.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 특정 줄을 직접 찾아서 변경
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('projectId ?') && lines[i].includes('.업무 목록으로 돌아가기.')) {
      console.log(`Found at line ${i+1}: ${lines[i]}`);
      lines[i] = lines[i].replace(/\.업무 목록으로 돌아가기\./g, "'업무 목록으로 돌아가기'");
      console.log(`Changed to: ${lines[i]}`);
    }
  }
  
  // 수정된 내용을 파일에 저장
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('파일이 수정되었습니다.');
} catch (err) {
  console.error('오류:', err);
}
