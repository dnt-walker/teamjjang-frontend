import fs from 'fs';

try {
  const filePath = './src/pages/ProjectDetail.tsx';
  console.log(`Reading file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. location 및 상태 관리 로직 추가
  const importStatement = 'import { useState, useEffect } from \'react\';';
  const newImportStatement = 'import { useState, useEffect } from \'react\';\nimport { useLocation } from \'react-router-dom\';';
  
  content = content.replace(importStatement, newImportStatement);
  
  // 2. 상태 추가
  const beforeLocation = '  const [taskLoading, setTaskLoading] = useState<boolean>(true);';
  const afterLocation = '  const [taskLoading, setTaskLoading] = useState<boolean>(true);\n  \n  // 이전 페이지 경로 확인\n  const location = useLocation();';
  
  content = content.replace(beforeLocation, afterLocation);
  
  // 3. 버튼 로직 변경 (Button 부분)
  const oldBackButton = `<div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
        >
          대시보드로 돌아가기
        </Button>
      </div>`;
  
  const newBackButton = `<div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => {
            // 이전 경로가 /projects인 경우 프로젝트 목록으로 이동, 그 외에는 대시보드로 이동
            if (location.pathname.includes('/projects') && !location.pathname.includes('/tasks')) {
              navigate('/projects');
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {location.pathname.includes('/projects') && !location.pathname.includes('/tasks') 
            ? '프로젝트 목록' 
            : '대시보드로 이동'}
        </Button>
      </div>`;
  
  content = content.replace(oldBackButton, newBackButton);
  
  // 4. Empty 상태에서의 버튼 로직 변경
  const oldEmptyButton = `<div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
          >
            대시보드로 돌아가기
          </Button>
        </div>`;
  
  const newEmptyButton = `<div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              // 이전 경로가 /projects인 경우 프로젝트 목록으로 이동, 그 외에는 대시보드로 이동
              if (location.pathname.includes('/projects') && !location.pathname.includes('/tasks')) {
                navigate('/projects');
              } else {
                navigate('/dashboard');
              }
            }}
          >
            {location.pathname.includes('/projects') && !location.pathname.includes('/tasks') 
              ? '프로젝트 목록' 
              : '대시보드로 이동'}
          </Button>
        </div>`;
  
  content = content.replace(oldEmptyButton, newEmptyButton);
  
  // 수정된 내용을 파일에 저장
  fs.writeFileSync(filePath, content);
  console.log('ProjectDetail.tsx 파일이 성공적으로 수정되었습니다.');
} catch (err) {
  console.error('오류:', err.message);
}
