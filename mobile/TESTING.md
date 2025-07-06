# React Native 앱 테스트 가이드

## 🚀 빠른 시작

### 1. 개발 환경 설정

#### Android 테스트 (권장)
```bash
# 1. Android Studio 설치 및 SDK 설정
# 2. Android 에뮬레이터 생성 또는 실제 기기 연결

# 3. 프로젝트 의존성 설치
cd mobile
npm install

# 4. Android 앱 실행
npm run android
```

#### iOS 테스트 (macOS만 가능)
```bash
# 1. Xcode 설치
# 2. CocoaPods 설치
brew install cocoapods

# 3. iOS 의존성 설치
cd ios
pod install
cd ..

# 4. iOS 앱 실행
npm run ios
```

### 2. 개발 서버 시작

```bash
# Metro bundler 시작 (별도 터미널)
npm start

# 또는 리셋과 함께 시작
npm start -- --reset-cache
```

## 🔧 상세 설정 가이드

### Android 설정

1. **Android Studio 설치**
   - [Android Studio 다운로드](https://developer.android.com/studio)
   - Android SDK, Android SDK Platform, Android Virtual Device 설치

2. **환경 변수 설정**
   ```bash
   # ~/.bashrc 또는 ~/.zshrc에 추가
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **AVD (Android Virtual Device) 생성**
   - Android Studio > Tools > AVD Manager
   - Create Virtual Device
   - 권장: Pixel 4 with API 30+

4. **실제 기기 연결 (USB 디버깅)**
   ```bash
   # 기기 연결 확인
   adb devices
   
   # 기기가 보이지 않으면
   adb kill-server
   adb start-server
   ```

### iOS 설정 (macOS만)

1. **Xcode 설치**
   - App Store에서 Xcode 설치
   - Command Line Tools 설치: `xcode-select --install`

2. **시뮬레이터 실행**
   ```bash
   # 사용 가능한 시뮬레이터 목록
   xcrun simctl list devices
   
   # 특정 시뮬레이터 실행
   open -a Simulator
   ```

## 🧪 테스트 유형별 가이드

### 1. 개발 테스트 (Hot Reload)

```bash
# 개발 모드로 실행
npm run android  # 또는 npm run ios

# 코드 변경 시 자동 리로드
# - JavaScript: 자동 리로드
# - Native 코드: 수동 리빌드 필요
```

**개발 중 유용한 기능:**
- `Ctrl+M` (Android) / `Cmd+D` (iOS): 개발자 메뉴
- `R`: 앱 리로드
- `D`: 원격 디버깅 (Chrome DevTools)

### 2. 프로덕션 빌드 테스트

#### Android APK 빌드
```bash
cd android

# Release 빌드 생성
./gradlew assembleRelease

# APK 위치: android/app/build/outputs/apk/release/
# 기기에 설치: adb install app-release.apk
```

#### iOS Archive 빌드
```bash
# Xcode에서 빌드
cd ios
xcodebuild -workspace StockDashboard.xcworkspace \
           -scheme StockDashboard \
           -configuration Release \
           archive
```

### 3. 단위 테스트

```bash
# Jest 테스트 실행
npm test

# 커버리지 포함
npm test -- --coverage

# 감시 모드
npm test -- --watch
```

### 4. E2E 테스트 (Detox - 선택사항)

```bash
# Detox 설치 및 설정
npm install -g detox-cli
npm install --save-dev detox

# E2E 테스트 실행
detox test
```

## 🔍 디버깅 방법

### 1. React DevTools
```bash
# React DevTools 설치
npm install -g react-devtools

# 실행
react-devtools
```

### 2. Chrome DevTools
1. 개발자 메뉴에서 "Debug" 선택
2. Chrome에서 `chrome://inspect` 접속
3. "Open dedicated DevTools for Node" 클릭

### 3. Flipper (페이스북 디버깅 도구)
```bash
# Flipper 다운로드 및 설치
# https://fbflipper.com/

# 네트워크, 로그, 레이아웃 등 디버깅 가능
```

### 4. 로그 확인
```bash
# Android 로그
adb logcat

# iOS 로그 (시뮬레이터)
xcrun simctl spawn booted log stream --predicate 'process == "StockDashboard"'

# Metro bundler 로그
npm start
```

## 🐛 문제 해결

### 자주 발생하는 문제들

1. **Metro bundler 캐시 문제**
   ```bash
   npm start -- --reset-cache
   npx react-native start --reset-cache
   ```

2. **Android 빌드 실패**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

3. **iOS 의존성 문제**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   npm run ios
   ```

4. **Node modules 문제**
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **포트 충돌**
   ```bash
   # 8081 포트 종료
   lsof -ti:8081 | xargs kill -9
   ```

### 성능 최적화 테스트

1. **번들 크기 분석**
   ```bash
   npx react-native bundle \
     --platform android \
     --dev false \
     --entry-file index.js \
     --bundle-output android-bundle.js \
     --verbose
   ```

2. **메모리 사용량 확인**
   - Flipper의 Memory 플러그인 사용
   - Xcode Instruments (iOS)

## 📊 테스트 체크리스트

### 기능 테스트
- [ ] 앱 시작 및 스플래시 화면
- [ ] 탭 네비게이션 (Dashboard, Portfolio, News, Settings)
- [ ] 포트폴리오 생성/편집/삭제
- [ ] 주식 추가/편집/삭제
- [ ] 차트 렌더링 및 상호작용
- [ ] 뉴스 로딩 및 필터링
- [ ] 설정 저장 및 불러오기
- [ ] 새로고침 (Pull to Refresh)

### UI/UX 테스트
- [ ] 다양한 화면 크기 대응
- [ ] 다크 테마 적용
- [ ] 터치 피드백 및 애니메이션
- [ ] 로딩 상태 표시
- [ ] 에러 상태 처리
- [ ] 빈 상태 (Empty State) 표시

### 성능 테스트
- [ ] 앱 시작 시간 (< 3초)
- [ ] 화면 전환 속도
- [ ] 스크롤 성능
- [ ] 메모리 사용량
- [ ] 배터리 소모

### 네트워크 테스트
- [ ] 오프라인 상태 처리
- [ ] 네트워크 에러 처리
- [ ] API 응답 시간
- [ ] 이미지 로딩

## 📱 실제 기기 테스트

### Android
```bash
# USB 디버깅 활성화 후
adb devices
npm run android
```

### iOS
- TestFlight를 통한 베타 테스트
- 또는 개발자 인증서로 기기에 직접 설치

## 🚀 배포 전 최종 테스트

1. **프로덕션 빌드 테스트**
2. **다양한 기기/OS 버전 테스트**
3. **성능 프로파일링**
4. **앱 스토어 가이드라인 준수 확인**
5. **접근성 테스트**

이 가이드를 따라하면 React Native 앱을 체계적으로 테스트할 수 있습니다!