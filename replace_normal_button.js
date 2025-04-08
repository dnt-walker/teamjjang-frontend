const fs = require('fs');

// 파일 읽기
const filePath = './src/pages/ProjectDetail.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// 일반 상태의 버튼 변경
const buttonTextToFind = '대시보드로 돌아가기';
const newButtonCode = `<Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => {
            // location.pathname이 /projects로 시작하면 프로젝트 목록으로, 그 외에는 대시보드로 이동
            if (location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')) {
              navigate('/projects');
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')
            ? '프로젝트 목록' 
            : '대시보드로 이동'}
        </Button>`;

// 버튼 코드 찾기 및 변경
const buttonRegex = new RegExp('<Button[\\s\\S]*?대시보드로 돌아가기[\\s\\S]*?<\\/Button>', 'g');
let modifiedContent = content.replace(buttonRegex, newButtonCode);

// 수정된 내용 저장
fs.writeFileSync(filePath, modifiedContent);
console.log('일반 버튼 로직이 성공적으로 변경되었습니다.');
