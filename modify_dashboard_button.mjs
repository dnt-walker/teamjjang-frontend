import fs from 'fs';

const filePath = './src/pages/ProjectDetail.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 대시보드 돌아가기 버튼 변경
content = content.replace(
  `onClick={() => navigate('/dashboard')}
        >
          대시보드로 돌아가기`,
  `onClick={() => {
            // location.pathname에 따라 다른 경로로 이동
            if (location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')) {
              navigate('/projects');
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {location.pathname.startsWith('/projects') && !location.pathname.includes('/tasks')
            ? '프로젝트 목록' 
            : '대시보드로 이동'}`
);

// 저장
fs.writeFileSync(filePath, content);
console.log('dashboard 버튼 수정 완료');
