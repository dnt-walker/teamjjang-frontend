const fs = require('fs');

// 파일 읽기
const filePath = './src/pages/ProjectDetail.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// 일반 상태의 버튼 변경
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

// Empty 상태의 버튼 변경
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

// 버튼 내용 변경
let modifiedContent = content.replace(oldButton, newButton);
modifiedContent = modifiedContent.replace(oldEmptyButton, newEmptyButton);

// 수정된 내용 저장
fs.writeFileSync(filePath, modifiedContent);
console.log('버튼 로직이 성공적으로 변경되었습니다.');
