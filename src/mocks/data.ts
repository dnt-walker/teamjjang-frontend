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

// 작업 샘플 데이터
export const jobs = [
  {
    id: 1,
    name: '요구사항 문서 작성',
    assignedUser: 'admin',
    description: '고객으로부터 수집한 요구사항을 기반으로 문서 작성',
    startTime: '2025-04-01T09:00:00',
    endTime: '2025-04-05T18:00:00',
    completionTime: '2025-04-05T16:30:00',
    completed: true
  },
  {
    id: 2,
    name: '요구사항 검토 회의',
    assignedUser: 'user',
    description: '작성된 요구사항 문서 검토 및 피드백',
    startTime: '2025-04-06T10:00:00',
    endTime: '2025-04-06T12:00:00',
    completionTime: '2025-04-06T12:30:00',
    completed: true
  },
  {
    id: 3,
    name: '요구사항 최종 수정',
    assignedUser: 'admin',
    description: '피드백을 반영한 요구사항 문서 최종 수정',
    startTime: '2025-04-07T09:00:00',
    endTime: '2025-04-08T18:00:00',
    completionTime: '2025-04-08T17:00:00',
    completed: true
  },
  {
    id: 4,
    name: '프로토타입 제작',
    assignedUser: 'admin',
    description: '핵심 기능에 대한 프로토타입 제작',
    startTime: '2025-04-20T09:00:00',
    endTime: '2025-04-30T18:00:00',
    completionTime: null,
    completed: false
  },
  {
    id: 5,
    name: '사용자 테스트 계획 수립',
    assignedUser: 'user',
    description: '개발된 프로토타입을 기반으로 사용자 테스트 계획 수립',
    startTime: '2025-05-01T09:00:00',
    endTime: '2025-05-05T18:00:00',
    completionTime: null,
    completed: false
  },
  {
    id: 6,
    name: 'DB 스키마 분석',
    assignedUser: 'user',
    description: '현재 데이터베이스 구조 분석',
    startTime: '2025-05-01T09:00:00',
    endTime: '2025-05-05T18:00:00',
    completionTime: null,
    completed: false
  },
  {
    id: 7,
    name: '쿼리 성능 테스트',
    assignedUser: 'admin',
    description: '주요 쿼리의 성능 벤치마크 테스트',
    startTime: '2025-05-06T09:00:00',
    endTime: '2025-05-10T18:00:00',
    completionTime: null,
    completed: false
  },
  {
    id: 8,
    name: '보안 취약점 스캔',
    assignedUser: 'admin',
    description: '자동화된 보안 도구를 사용하여 취약점 스캔',
    startTime: '2025-03-01T09:00:00',
    endTime: '2025-03-03T18:00:00',
    completionTime: '2025-03-03T15:00:00',
    completed: true
  },
  {
    id: 9,
    name: '보안 보고서 작성',
    assignedUser: 'user',
    description: '발견된 보안 취약점에 대한 보고서 작성',
    startTime: '2025-03-04T09:00:00',
    endTime: '2025-03-07T18:00:00',
    completionTime: '2025-03-07T18:00:00',
    completed: true
  },
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
    project: projects[0],
    jobs: [jobs[0], jobs[1], jobs[2]]
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
    project: projects[0],
    jobs: [jobs[3], jobs[4]]
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
    project: projects[0],
    jobs: []
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
    project: projects[1],
    jobs: []
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
    project: projects[2],
    jobs: [jobs[5], jobs[6]]
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
    project: projects[3],
    jobs: [jobs[7], jobs[8]]
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
    project: undefined,
    jobs: []
  }
];