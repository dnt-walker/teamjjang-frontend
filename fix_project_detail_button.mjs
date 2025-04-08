import fs from 'fs';

try {
  const filePath = './src/pages/ProjectDetail.tsx';
  console.log(`Reading file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. useLocation 임포트 추가
  if (!content.includes('useLocation')) {
    content = content.replace(
      'import { useParams, useNavigate } from \'react-router-dom\';',
      'import { useParams, useNavigate, useLocation } from \'react-router-dom\';'
    );
    console.log('useLocation 임포트 추가됨');
  }

  // 2. location 객체 초기화
  if (!content.includes('const location = useLocation()')) {
    content = content.replace(
      'const navigate = useNavigate();',
      'const navigate = useNavigate();\n  const location = useLocation();'
    );
    console.log('location 객체 초기화 추가됨');
  }

  // 3. 버튼 로직 변경 - 일반 상태에서의 버튼
  const oldButton = `<Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
        >
          대시보드로 돌아가기
        </Button>`;

  const newButton = `<Button 
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

  if (content.includes(oldButton)) {
    content = content.replace(oldButton, newButton);
    console.log('일반 상태 버튼 로직 변경됨');
  }

  // 4. Empty 상태일 때의 버튼 로직도 변경
  const oldEmptyButton = `<Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
          >
            대시보드로 돌아가기
          </Button>`;

  const newEmptyButton = `<Button 
            type="primary" 
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

  if (content.includes(oldEmptyButton)) {
    content = content.replace(oldEmptyButton, newEmptyButton);
    console.log('Empty 상태 버튼 로직 변경됨');
  }

  // 수정된 내용을 파일에 저장
  fs.writeFileSync(filePath, content);
  console.log('ProjectDetail.tsx 파일이 성공적으로 수정되었습니다.');
} catch (err) {
  console.error('오류:', err);
}
