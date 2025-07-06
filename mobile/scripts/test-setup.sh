#!/bin/bash

# React Native 앱 테스트 환경 설정 스크립트

echo "🚀 React Native 앱 테스트 환경 설정을 시작합니다..."

# 1. Node.js 버전 확인
echo "📋 Node.js 버전 확인..."
node_version=$(node -v)
echo "Node.js 버전: $node_version"

if [[ "$node_version" < "v16" ]]; then
    echo "❌ Node.js 16 이상이 필요합니다. 현재 버전: $node_version"
    exit 1
fi

# 2. 프로젝트 의존성 설치
echo "📦 의존성 설치 중..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install 실패"
    exit 1
fi

# 3. React Native CLI 확인
echo "🔧 React Native CLI 확인..."
if ! command -v npx react-native &> /dev/null; then
    echo "⚠️ React Native CLI가 설치되지 않았습니다."
    echo "전역 설치: npm install -g react-native-cli"
fi

# 4. Android 개발 환경 확인
echo "🤖 Android 개발 환경 확인..."
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️ ANDROID_HOME 환경변수가 설정되지 않았습니다."
    echo "Android Studio를 설치하고 다음을 ~/.bashrc 또는 ~/.zshrc에 추가하세요:"
    echo "export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
    
    # ADB 확인
    if command -v adb &> /dev/null; then
        echo "✅ ADB 사용 가능"
        echo "📱 연결된 Android 기기/에뮬레이터:"
        adb devices
    else
        echo "❌ ADB를 찾을 수 없습니다."
    fi
fi

# 5. iOS 개발 환경 확인 (macOS만)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 iOS 개발 환경 확인..."
    
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode 설치됨"
        xcodebuild -version
        
        # CocoaPods 확인
        if command -v pod &> /dev/null; then
            echo "✅ CocoaPods 설치됨"
            pod --version
        else
            echo "⚠️ CocoaPods가 설치되지 않았습니다."
            echo "설치: sudo gem install cocoapods"
        fi
    else
        echo "⚠️ Xcode가 설치되지 않았습니다."
    fi
else
    echo "⚠️ iOS 개발은 macOS에서만 가능합니다."
fi

# 6. TypeScript 컴파일 확인
echo "🔍 TypeScript 컴파일 확인..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ TypeScript 컴파일 성공"
else
    echo "❌ TypeScript 컴파일 오류가 있습니다."
fi

# 7. ESLint 확인
echo "🔍 ESLint 검사..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ ESLint 검사 통과"
else
    echo "⚠️ ESLint 경고/오류가 있습니다."
fi

echo ""
echo "🎉 테스트 환경 설정이 완료되었습니다!"
echo ""
echo "📱 테스트 실행 방법:"
echo "  Android: npm run android"
echo "  iOS: npm run ios (macOS만)"
echo "  Metro: npm start"
echo ""
echo "🐛 문제 발생 시:"
echo "  캐시 리셋: npm start -- --reset-cache"
echo "  의존성 재설치: rm -rf node_modules && npm install"
echo "  Android 클린: cd android && ./gradlew clean"