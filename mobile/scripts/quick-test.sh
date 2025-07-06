#!/bin/bash

# 빠른 테스트 스크립트

echo "⚡ React Native 앱 빠른 테스트를 시작합니다..."

# 사용법 표시
show_usage() {
    echo "사용법: $0 [android|ios|metro|clean]"
    echo ""
    echo "옵션:"
    echo "  android    Android 에뮬레이터/기기에서 실행"
    echo "  ios        iOS 시뮬레이터에서 실행 (macOS만)"
    echo "  metro      Metro bundler만 시작"
    echo "  clean      캐시 정리 후 실행"
    echo ""
    echo "예시:"
    echo "  $0 android"
    echo "  $0 ios"
    echo "  $0 clean android"
    exit 1
}

# 인수가 없으면 사용법 표시
if [ $# -eq 0 ]; then
    show_usage
fi

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ mobile 디렉토리에서 실행해주세요."
    echo "cd mobile"
    exit 1
fi

# clean 옵션 처리
if [ "$1" = "clean" ]; then
    echo "🧹 캐시 정리 중..."
    
    # Metro 캐시 정리
    if command -v npx &> /dev/null; then
        npx react-native start --reset-cache &
        metro_pid=$!
        sleep 3
        kill $metro_pid 2>/dev/null
    fi
    
    # node_modules 재설치
    echo "📦 의존성 재설치 중..."
    rm -rf node_modules
    npm install
    
    # Android 클린 (있는 경우)
    if [ -d "android" ]; then
        echo "🤖 Android 프로젝트 클린..."
        cd android
        ./gradlew clean
        cd ..
    fi
    
    # iOS 클린 (있는 경우, macOS만)
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        echo "🍎 iOS 프로젝트 클린..."
        cd ios
        rm -rf build/
        pod install
        cd ..
    fi
    
    # 두 번째 인수가 있으면 해당 플랫폼 실행
    if [ -n "$2" ]; then
        platform=$2
    else
        echo "✅ 정리 완료!"
        exit 0
    fi
else
    platform=$1
fi

# Metro bundler 시작 함수
start_metro() {
    echo "📱 Metro bundler 시작 중..."
    npm start
}

# Android 실행 함수
run_android() {
    echo "🤖 Android에서 앱 실행 중..."
    
    # Android 기기/에뮬레이터 확인
    if command -v adb &> /dev/null; then
        devices=$(adb devices | grep -E "(device|emulator)" | wc -l)
        if [ "$devices" -eq 0 ]; then
            echo "⚠️ 연결된 Android 기기나 에뮬레이터가 없습니다."
            echo "Android Studio에서 에뮬레이터를 시작하거나 USB로 기기를 연결하세요."
            exit 1
        fi
        
        echo "📱 연결된 기기:"
        adb devices
    fi
    
    # Metro와 Android 앱을 동시에 실행
    npm start &
    metro_pid=$!
    
    # Metro가 시작될 때까지 잠시 대기
    echo "⏳ Metro bundler 시작 대기 중..."
    sleep 5
    
    # Android 앱 실행
    npm run android
    
    # 종료 시 Metro도 함께 종료
    cleanup() {
        echo "🛑 프로세스 종료 중..."
        kill $metro_pid 2>/dev/null
        exit 0
    }
    trap cleanup INT TERM
    
    # Metro 프로세스 대기
    wait $metro_pid
}

# iOS 실행 함수
run_ios() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "❌ iOS 개발은 macOS에서만 가능합니다."
        exit 1
    fi
    
    echo "🍎 iOS에서 앱 실행 중..."
    
    # iOS 의존성 설치 확인
    if [ -d "ios" ] && [ ! -d "ios/Pods" ]; then
        echo "📦 iOS 의존성 설치 중..."
        cd ios
        pod install
        cd ..
    fi
    
    # Metro와 iOS 앱을 동시에 실행
    npm start &
    metro_pid=$!
    
    # Metro가 시작될 때까지 잠시 대기
    echo "⏳ Metro bundler 시작 대기 중..."
    sleep 5
    
    # iOS 앱 실행
    npm run ios
    
    # 종료 시 Metro도 함께 종료
    cleanup() {
        echo "🛑 프로세스 종료 중..."
        kill $metro_pid 2>/dev/null
        exit 0
    }
    trap cleanup INT TERM
    
    # Metro 프로세스 대기
    wait $metro_pid
}

# 플랫폼별 실행
case $platform in
    "android")
        run_android
        ;;
    "ios")
        run_ios
        ;;
    "metro")
        start_metro
        ;;
    *)
        echo "❌ 알 수 없는 옵션: $platform"
        show_usage
        ;;
esac