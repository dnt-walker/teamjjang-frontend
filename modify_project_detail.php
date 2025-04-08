<?php
$file = './src/pages/ProjectDetail.tsx';
$content = file_get_contents($file);

// 1. useLocation 추가
$content = str_replace(
    'import { useParams, useNavigate } from \'react-router-dom\';',
    'import { useParams, useNavigate, useLocation } from \'react-router-dom\';',
    $content
);

// 2. location 객체 추가
$content = str_replace(
    'const navigate = useNavigate();',
    'const navigate = useNavigate();
  const location = useLocation();',
    $content
);

// 3. 버튼 로직 변경 - 일반 상태 버튼
$oldButton = 'icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(\'/dashboard\')}';
$newButton = 'icon={<ArrowLeftOutlined />} 
          onClick={() => {
            // location.pathname에 따라 다른 경로로 이동
            if (location.pathname.startsWith(\'/projects\') && !location.pathname.includes(\'/tasks\')) {
              navigate(\'/projects\');
            } else {
              navigate(\'/dashboard\');
            }
          }}';

$content = str_replace($oldButton, $newButton, $content);

// 4. 버튼 텍스트 변경
$oldText = '>
          대시보드로 돌아가기
        </Button>';
$newText = '>
          {location.pathname.startsWith(\'/projects\') && !location.pathname.includes(\'/tasks\')
            ? \'프로젝트 목록\' 
            : \'대시보드로 이동\'}
        </Button>';

$content = str_replace($oldText, $newText, $content);

// 저장
file_put_contents($file, $content);
echo "ProjectDetail.tsx 파일 수정 완료\n";
