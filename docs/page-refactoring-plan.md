# 페이지 분리 리팩토링 계획서 (Page Refactoring Plan)

## 문서 정보
- **버전**: 1.0
- **날짜**: 2025-07-06
- **상태**: 진행 중
- **우선순위**: 높음

---

## 1. 개요

### 1.1 현재 상황
현재 프로젝트의 메인 페이지인 `StockDashboard.tsx`(383줄)가 모든 주요 기능을 포함하고 있어 코드 유지보수성과 사용자 경험에 문제가 있습니다.

### 1.2 문제점
- **단일 컴포넌트 비대화**: 모든 기능이 하나의 컴포넌트에 집중
- **복잡한 상태 관리**: 15개 이상의 상태 변수와 핸들러
- **사용자 경험 저하**: 과도한 정보 밀도로 인한 UI 복잡성
- **성능 이슈**: 불필요한 렌더링과 메모리 사용

### 1.3 목표
- 기능별 페이지 분리를 통한 코드 구조 개선
- 사용자 경험 향상을 위한 직관적인 네비게이션
- 유지보수성과 확장성 증대

---

## 2. 페이지 분리 계획

### 2.1 새로운 페이지 구조

#### 🏠 Dashboard (`/`)
**목적**: 포트폴리오 개요 및 핵심 지표 요약
**포함 기능**:
- 포트폴리오 선택기
- 포트폴리오 비교 차트
- 요약 카드 (총 가치, 포지션 수, 총 손익)
- 간단한 포트폴리오 차트
- 빠른 주식 추가 버튼

#### 📊 Portfolio (`/portfolio`)
**목적**: 포트폴리오 상세 관리
**포함 기능**:
- 포트폴리오 테이블 (전체 기능)
- 주식 추가/수정/삭제 모달
- 데이터 가져오기/내보내기
- 포트폴리오 상세 정보

#### 📈 Analytics (`/analytics`)
**목적**: 고급 분석 및 차트
**포함 기능**:
- 포트폴리오 분석 (6가지 차트 타입)
- 섹터 분석
- 성과 지표
- 위험 분석

#### 📅 History (`/history`)
**목적**: 포트폴리오 이력 및 성과 추적
**포함 기능**:
- 포트폴리오 히스토리 차트
- 성과 지표 (Sharpe ratio, 변동성 등)
- 스냅샷 관리
- 시계열 분석

#### 📰 News (`/news`) - 기존 유지
**목적**: 뉴스 및 시장 정보
**포함 기능**:
- 포트폴리오 관련 뉴스
- 시장 뉴스
- 뉴스 필터링

#### 🎯 Goals (`/goals`) - 기존 유지
**목적**: 투자 목표 관리
**포함 기능**:
- 목표 설정 및 추적
- 진행률 모니터링

---

## 3. 기술적 구현 계획

### 3.1 라우팅 구조 개선

#### 현재 라우팅
```typescript
// App.tsx - 현재 4개 라우트만 존재
<Route path="/" element={<StockDashboard />} />
<Route path="/goals" element={<GoalsPage />} />
<Route path="/news" element={<NewsPage />} />
<Route path="/share/:shareId" element={<SharedPortfolioView />} />
```

#### 새로운 라우팅 구조
```typescript
// App.tsx - 확장된 라우팅
<Route path="/" element={<DashboardPage />} />
<Route path="/portfolio" element={<PortfolioPage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
<Route path="/history" element={<HistoryPage />} />
<Route path="/news" element={<NewsPage />} />
<Route path="/goals" element={<GoalsPage />} />
<Route path="/share/:shareId" element={<SharedPortfolioView />} />
```

### 3.2 네비게이션 컴포넌트 개선

#### 사이드바 네비게이션
```typescript
// components/layout/Sidebar.tsx
const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/news', icon: Newspaper, label: 'News' },
  { path: '/goals', icon: Target, label: 'Goals' }
];
```

### 3.3 컴포넌트 분리 및 재구성

#### 현재 StockDashboard.tsx에서 분리할 컴포넌트들
```typescript
// StockDashboard.tsx (383줄) 분리 대상:
- PortfolioSelector -> DashboardPage
- PortfolioComparisonChart -> DashboardPage
- PortfolioSummary -> DashboardPage
- PortfolioChart -> DashboardPage (간단한 버전)
- PortfolioAnalytics -> AnalyticsPage
- PortfolioHistoryChart -> HistoryPage
- PerformanceMetrics -> HistoryPage
- PortfolioNewsSection -> NewsPage (이미 존재)
- PortfolioTable -> PortfolioPage
- Modal 및 Form 컴포넌트들 -> PortfolioPage
```

### 3.4 상태 관리 최적화

#### Context 분리 및 최적화
```typescript
// 현재 사용 중인 Context들
- AuthContext
- PortfolioContext
- MultiPortfolioContext
- ToastContext
- SettingsContext
- StockPriceContext
- GoalsContext
- PortfolioHistoryContext

// 페이지별 최적화된 Context 사용
- DashboardPage: Multi, Portfolio, StockPrice
- PortfolioPage: Portfolio, Toast
- AnalyticsPage: Portfolio, StockPrice
- HistoryPage: PortfolioHistory, Portfolio
```

---

## 4. 구현 단계별 계획

### 4.1 Phase 1: 기초 구조 구축 (1-2일)
- [ ] 새로운 페이지 컴포넌트 기본 구조 생성
- [ ] 라우팅 설정 업데이트
- [ ] 네비게이션 컴포넌트 구현
- [ ] 레이아웃 컴포넌트 구조 설계

### 4.2 Phase 2: Dashboard 페이지 구현 (1-2일)
- [ ] 기존 StockDashboard에서 핵심 요약 기능 추출
- [ ] 간소화된 대시보드 레이아웃 구현
- [ ] 포트폴리오 선택 및 비교 차트 통합
- [ ] 빠른 액세스 버튼 추가

### 4.3 Phase 3: Portfolio 페이지 구현 (2-3일)
- [ ] 포트폴리오 테이블 및 관리 기능 이전
- [ ] 주식 추가/수정/삭제 모달 최적화
- [ ] 데이터 가져오기/내보내기 기능 이전
- [ ] 상세 포트폴리오 정보 표시

### 4.4 Phase 4: Analytics 페이지 구현 (2-3일)
- [ ] 포트폴리오 분석 컴포넌트 이전
- [ ] 6가지 차트 타입 구현
- [ ] 고급 분석 기능 추가
- [ ] 성과 지표 최적화

### 4.5 Phase 5: History 페이지 구현 (1-2일)
- [ ] 포트폴리오 히스토리 차트 이전
- [ ] 성과 지표 컴포넌트 이전
- [ ] 스냅샷 관리 기능 개선
- [ ] 시계열 분석 기능 추가

### 4.6 Phase 6: 통합 및 최적화 (1-2일)
- [ ] 페이지 간 네비게이션 테스트
- [ ] 상태 관리 최적화
- [ ] 성능 최적화 및 코드 정리
- [ ] 사용자 경험 개선

---

## 5. 파일 구조 변경 계획

### 5.1 현재 구조
```
src/
├── components/
│   ├── StockDashboard.tsx (383줄 - 분리 대상)
│   ├── portfolio/
│   ├── charts/
│   ├── history/
│   ├── news/
│   └── goals/
```

### 5.2 새로운 구조
```
src/
├── pages/
│   ├── DashboardPage.tsx (새로 생성)
│   ├── PortfolioPage.tsx (새로 생성)
│   ├── AnalyticsPage.tsx (새로 생성)
│   ├── HistoryPage.tsx (새로 생성)
│   ├── NewsPage.tsx (기존 유지)
│   └── GoalsPage.tsx (기존 유지)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx (새로 생성)
│   │   ├── Header.tsx (기존 유지)
│   │   └── Layout.tsx (새로 생성)
│   ├── portfolio/ (기존 유지)
│   ├── charts/ (기존 유지)
│   ├── history/ (기존 유지)
│   ├── news/ (기존 유지)
│   └── goals/ (기존 유지)
```

---

## 6. 사용자 경험 개선 계획

### 6.1 네비게이션 개선
- **사이드바 네비게이션**: 명확한 페이지 구분과 아이콘 사용
- **브레드크럼**: 현재 위치 표시
- **빠른 액세스**: 주요 기능에 대한 바로가기 제공

### 6.2 페이지별 최적화
- **Dashboard**: 핵심 정보 집중, 빠른 로딩
- **Portfolio**: 관리 기능 집중, 효율적인 워크플로우
- **Analytics**: 데이터 시각화 최적화
- **History**: 시계열 데이터 효율적 표시

### 6.3 반응형 디자인
- **모바일 우선**: 각 페이지별 모바일 최적화
- **타블렛 지원**: 중간 화면 크기 최적화
- **데스크톱 활용**: 큰 화면에서의 정보 밀도 최적화

---

## 7. 성능 최적화 계획

### 7.1 코드 분할 (Code Splitting)
```typescript
// 페이지별 동적 임포트
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
```

### 7.2 메모이제이션 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo**: 계산 비용이 큰 연산 캐싱
- **useCallback**: 콜백 함수 최적화

### 7.3 데이터 로딩 최적화
- **페이지별 필요 데이터만 로드**
- **지연 로딩**: 보이지 않는 차트 컴포넌트 지연 로딩
- **캐싱**: API 응답 결과 캐싱

---

## 8. 테스트 계획

### 8.1 단위 테스트
- [ ] 새로운 페이지 컴포넌트 테스트
- [ ] 라우팅 기능 테스트
- [ ] 네비게이션 컴포넌트 테스트

### 8.2 통합 테스트
- [ ] 페이지 간 네비게이션 테스트
- [ ] 상태 관리 통합 테스트
- [ ] 데이터 흐름 테스트

### 8.3 사용자 경험 테스트
- [ ] 페이지 로딩 시간 측정
- [ ] 사용자 워크플로우 테스트
- [ ] 반응형 디자인 테스트

---

## 9. 위험 요소 및 대응 방안

### 9.1 기술적 위험
| 위험 | 영향도 | 확률 | 대응 방안 |
|------|--------|------|-----------|
| 상태 관리 복잡성 증가 | 높음 | 중간 | Context 최적화 및 단계별 이전 |
| 라우팅 이슈 | 중간 | 낮음 | 철저한 테스트 및 점진적 배포 |
| 성능 저하 | 높음 | 낮음 | 코드 분할 및 최적화 적용 |

### 9.2 사용자 경험 위험
| 위험 | 영향도 | 확률 | 대응 방안 |
|------|--------|------|-----------|
| 사용자 혼란 | 중간 | 중간 | 명확한 네비게이션 및 가이드 제공 |
| 기능 접근성 저하 | 높음 | 낮음 | 빠른 액세스 버튼 및 바로가기 제공 |

---

## 10. 성공 지표

### 10.1 기술적 지표
- **코드 복잡성**: 각 페이지 컴포넌트 200줄 이하
- **로딩 시간**: 각 페이지 2초 이하
- **번들 크기**: 코드 분할로 초기 로딩 크기 30% 감소

### 10.2 사용자 경험 지표
- **페이지 간 네비게이션**: 1초 이하
- **사용자 만족도**: 기존 대비 향상
- **오류율**: 1% 이하 유지

---

## 11. 일정 및 마일스톤

### 11.1 전체 일정
- **총 개발 기간**: 10-14일
- **시작일**: 2025-07-06
- **완료 예정일**: 2025-07-20

### 11.2 주요 마일스톤
- **Week 1**: Phase 1-2 완료 (기초 구조 + Dashboard)
- **Week 2**: Phase 3-4 완료 (Portfolio + Analytics)
- **Week 3**: Phase 5-6 완료 (History + 통합)

---

## 12. 다음 단계

### 12.1 즉시 진행 사항
1. **Phase 1 시작**: 기초 구조 구축
2. **새로운 페이지 컴포넌트 생성**
3. **라우팅 설정 업데이트**

### 12.2 승인 대기 사항
- 최종 페이지 구조 승인
- 네비게이션 디자인 확정
- 구현 일정 승인

---

**문서 작성자**: Claude Code Assistant  
**최종 수정일**: 2025-07-06  
**다음 리뷰 예정일**: 2025-07-08

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*