// 프로젝트 샘플 데이터
export const projects = [
  {
    id: 1,
    name: '웹 애플리케이션 개발',
    description: '고객을 위한 새로운 전자상거래 웹 애플리케이션 개발',
    startDate: '2025-04-01',
    endDate: '2025-08-31',
    manager: 'admin',
    active: true
  },
  {
    id: 2,
    name: '모바일 앱 리디자인',
    description: '기존 모바일 애플리케이션 UX/UI 개선 프로젝트',
    startDate: '2025-04-15',
    endDate: '2025-07-15',
    manager: 'admin',
    active: true
  },
  {
    id: 3,
    name: '데이터베이스 최적화',
    description: '시스템 성능 향상을 위한 데이터베이스 구조 개선',
    startDate: '2025-05-01',
    endDate: '2025-06-30',
    manager: 'user',
    active: true
  },
  {
    id: 4,
    name: '보안 시스템 업그레이드',
    description: '보안 취약점 개선 및 침입 방지 시스템 업그레이드',
    startDate: '2025-03-01',
    endDate: '2025-03-30',
    manager: 'admin',
    active: false
  }
];

// 태스크 샘플 데이터
export const tasks = [
  {
    id: 1,
    name: '요구사항 분석',
    description: '고객 요구사항 수집 및 분석',
    startDate: '2025-04-01',
    plannedEndDate: '2025-04-15',
    completionDate: '2025-04-14',
    creator: 'admin',
    assignees: ['admin', 'user'],
    project: projects[0]
  },
  {
    id: 2,
    name: 'UI/UX 설계',
    description: '웹 애플리케이션 UI/UX 디자인 및 프로토타입 개발',
    startDate: '2025-04-16',
    plannedEndDate: '2025-05-15',
    completionDate: null,
    creator: 'admin',
    assignees: ['admin'],
    project: projects[0]
  },
  {
    id: 3,
    name: '백엔드 개발',
    description: 'API 및 서버 로직 구현',
    startDate: '2025-05-01',
    plannedEndDate: '2025-07-15',
    completionDate: null,
    creator: 'user',
    assignees: ['user'],
    project: projects[0]
  },
  {
    id: 4,
    name: '현행 앱 분석',
    description: '기존 모바일 앱 사용성 및 디자인 평가',
    startDate: '2025-04-15',
    plannedEndDate: '2025-04-30',
    completionDate: null,
    creator: 'admin',
    assignees: ['admin'],
    project: projects[1]
  },
  {
    id: 5,
    name: '데이터베이스 분석',
    description: '현재 데이터베이스 성능 평가 및 문제점 파악',
    startDate: '2025-05-01',
    plannedEndDate: '2025-05-15',
    completionDate: null,
    creator: 'user',
    assignees: ['user'],
    project: projects[2]
  },
  {
    id: 6,
    name: '보안 취약점 분석',
    description: '시스템 보안 취약점 분석 및 평가',
    startDate: '2025-03-01',
    plannedEndDate: '2025-03-10',
    completionDate: '2025-03-08',
    creator: 'admin',
    assignees: ['admin', 'user'],
    project: projects[3]
  },
  {
    id: 7,
    name: '개인 업무',
    description: '프로젝트에 속하지 않는 개인 업무',
    startDate: '2025-04-01',
    plannedEndDate: '2025-04-05',
    completionDate: null,
    creator: 'user',
    assignees: ['user'],
    project: undefined
  }
];
