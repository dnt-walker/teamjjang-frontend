import fs from 'fs';

// 파일 읽기
const filePath = './src/pages/ProjectDetail.tsx';
console.log(`Reading file: ${filePath}`);
let content = fs.readFileSync(filePath, 'utf8');

// 각 버튼 텍스트에 대한 간단한 함수 생성
function replaceButton(content, searchText, newLogic, newText) {
  // 검색 텍스트가 포함된 버튼 라인 찾기
  const pattern = new RegExp(`<Button[\\s\\S]*?${searchText}[\\s\\S]*?<\\/Button>`, 'g');
  
  // 새 버튼 코드 만들기
  const newButton = `<Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => {
            // location.pathname에 따라 다른 경로로 이동
            ${newLogic}
          }}
        >
          ${newText}
        </Button>`;
  
  return content.replace(pattern, newButton);
}

// 모든 버튼에 공통으로 적용할 로직
const navigateLogic = `if (location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')) {
              navigate('/projects');
            } else {
              navigate('/dashboard');
            }`;

// 모든 버튼에 공통으로 적용할 텍스트
const buttonText = `{location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')
            ? '프로젝트 목록' 
            : '대시보드로 이동'}`;

// 일반 버튼 변경
content = replaceButton(content, '대시보드로 돌아가기', navigateLogic, buttonText);

// 수정된 내용 저장
fs.writeFileSync(filePath, content);
console.log('모든 버튼 로직이 성공적으로 변경되었습니다.');
