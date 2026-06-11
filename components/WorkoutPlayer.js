import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, BackHandler, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Speech from 'expo-speech';
import Svg, { Circle, Line } from 'react-native-svg';

// ==========================================
// 【親兒子套件完美引入】看齊 Expo Go 官方標準規範
// ==========================================
import { Camera, CameraView } from 'expo-camera';

import TurnBackIcon from '../assets/images/TurnBack.svg';
import NextIcon from '../assets/images/SkipIcon.svg';
import useListStore from '../store/useListStore';

const AiCameraSource = require('../assets/images/AiCamera.png');
// 休息時間動圖資產
const RestGifSource = require('../assets/images/Rest.gif');

export default function WorkoutPlayer({ listTitle = '伸展運動', actionsData }) {
  const router = useRouter();
  const rawActions = actionsData ? JSON.parse(actionsData) : [];

  // 讀取時間設定，計算秒數
  const storedSettings = useListStore.getState().settings || {};
  const parseTime = (str, fallback) => {
    const parts = (str || '').split(':');
    if (parts.length === 2) {
      const total = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      return total > 0 ? total : fallback;
    }
    return fallback;
  };
  const defaultActionSecs = parseTime(storedSettings.defaultWorkoutTime, 30);
  const restSecs = parseTime(storedSettings.restTime, 15);
  const countdownSecs = parseTime(storedSettings.countdownTime, 8);
  const countdownSecsRef = useRef(countdownSecs);

  const buildPlaybackList = () => {
    let list = [];
    rawActions.forEach((act, idx) => {
      let seconds = defaultActionSecs;
      if (act.time && act.time.includes(':')) {
        const [m, s] = act.time.split(':').map(Number);
        seconds = m * 60 + s || defaultActionSecs;
      }

      list.push({ ...act, totalSeconds: seconds, isRest: false });

      if (idx < rawActions.length - 1) {
        list.push({
          id: `rest_${Date.now()}_${idx}`,
          name: '休息時間',
          detail: '準備下一個動作',
          totalSeconds: restSecs,
          isRest: true,
          img: null
        });
      }
    });
    return list;
  };

  const playbackList = useRef(buildPlaybackList()).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAction = playbackList[currentIndex] || null;

  const [timeLeft, setTimeLeft] = useState(currentAction ? currentAction.totalSeconds : 0);
  const [bufferTime, setBufferTime] = useState(countdownSecs);
  const [isBuffering, setIsBuffering] = useState(true);

  const [isPaused, setIsPaused] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);

  const timerRef = useRef(null);
  const nextVoiceTriggered = useRef(false);
  const isFirstMount = useRef(true);

  // ==========================================
  // 【方案 A】控制按鈕回饋之專屬動態核心
  // ==========================================
  const backArrowScale = useRef(new Animated.Value(1)).current;
  const aiToggleScale = useRef(new Animated.Value(1)).current;
  const skipBtnScale = useRef(new Animated.Value(1)).current;
  const restartBtnScale = useRef(new Animated.Value(1)).current;
  const exitBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  // 💡 Expo Camera 親兒子相機權限狀態
  const [hasPermission, setHasPermission] = useState(null);

  // 坐姿側向拉頸 AI 骨骼即時動態模擬器邏輯完整保留（增強科技互動感）
  const [poseData, setPoseData] = useState({
    leftEar: { x: 140, y: 80 },
    rightEar: { x: 180, y: 80 },
    nose: { x: 160, y: 90 },
    leftShoulder: { x: 100, y: 160 },
    rightShoulder: { x: 220, y: 160 },
    isSafe: true
  });

  // ==================== 📐 🛠️ 30格離散虛線核心數學矩陣 ====================
  const radius = 60;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  const totalGridLength = circumference / 30;
  const lineLength = 5.5;
  const gapLength = totalGridLength - lineLength;

  const getVisibleDotsCount = () => {
    if (!currentAction) return 0;
    const ratio = isBuffering
      ? bufferTime / 5
      : timeLeft / currentAction.totalSeconds;

    return Math.ceil(ratio * 30);
  };

  const visibleDots = getVisibleDotsCount();

  const getDynamicDashArray = () => {
    if (visibleDots <= 0) return `0, ${circumference}`;
    if (visibleDots >= 30) return `${lineLength}, ${gapLength}`;

    let pattern = [];
    for (let i = 0; i < visibleDots; i++) {
      pattern.push(lineLength, gapLength);
    }
    const remainingLength = circumference - (visibleDots * totalGridLength);
    pattern.push(0, remainingLength + gapLength);

    return pattern.join(', ');
  };
  // ======================================================================

  // 💡 【智慧型情境式權限請求】當使用者第一次按下 AI 按鈕時，非同步彈出 Expo Go 的權限詢問
  const handleToggleAiMode = async () => {
    if (!isAiMode) {
      if (hasPermission !== true) {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert("提示", "需要相機權限才能載入前置鏡頭做對位輔助喔！");
          return;
        }
      }
      setIsAiMode(true);
    } else {
      setIsAiMode(false);
    }
  };

  // AI 坐姿拉頸動作即時動態模擬
  useEffect(() => {
    if (!isAiMode || isPaused) return;

    let frameCount = 0;
    const aiInterval = setInterval(() => {
      frameCount += 0.05;
      const headOffset = Math.sin(frameCount) * 25;
      const currentNoseX = 160 + headOffset;
      const isPostureSafe = Math.abs(headOffset) < 18;

      setPoseData({
        leftEar: { x: 140 + headOffset, y: 80 + (headOffset * 0.2) },
        rightEar: { x: 180 + headOffset, y: 80 - (headOffset * 0.2) },
        nose: { x: currentNoseX, y: 90 },
        leftShoulder: { x: 100, y: 160 },
        rightShoulder: { x: 220, y: 160 },
        isSafe: isPostureSafe
      });
    }, 30);

    return () => clearInterval(aiInterval);
  }, [isAiMode, isPaused]);

  useEffect(() => {
    const lockToLandscape = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (error) {
        console.log("⚠️ iOS 轉橫屏失敗:", error);
      }
    };

    lockToLandscape();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      triggerPause();
      return true;
    });

    return () => {
      const unlockOrientation = async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        } catch (e) {
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
          } catch (err) {
            console.log("⚠️ 裝置拒絕還原轉向設定");
          }
        }
      };

      unlockOrientation();
      backHandler.remove();
      clearInterval(timerRef.current);
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (!currentAction || isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    if (isBuffering && bufferTime === countdownSecsRef.current) {
      if (isFirstMount.current) {
        if (currentAction.isRest) {
          Speech.speak("休息時間");
        } else {
          Speech.speak(`${currentAction.name}`);
        }
        isFirstMount.current = false;
      } else {
        if (currentAction.isRest) {
          Speech.speak("休息時間");
        } else {
          Speech.speak(`${currentAction.name}`);
        }
      }
    }

    timerRef.current = setInterval(() => {
      if (isBuffering) {
        setBufferTime((prevBuffer) => {
          if (prevBuffer <= 1) {
            setIsBuffering(false);
            clearInterval(timerRef.current);
            if (currentAction.isRest) {
              Speech.speak("休息開始");
            } else {
              Speech.speak("開始運動");
            }
            return 5;
          }

          const nextBuffer = prevBuffer - 1;
          if (nextBuffer <= 3 && nextBuffer > 0) {
            Speech.speak(nextBuffer.toString());
          }
          return nextBuffer;
        });
      }
      else {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleNext();
            return 0;
          }

          const nextTime = prevTime - 1;

          if (nextTime <= 3 && nextTime > 0) {
            Speech.speak(nextTime.toString());
          }

          if (currentAction.isRest && nextTime === 10 && !nextVoiceTriggered.current) {
            const [nextRealAction] = [playbackList[currentIndex + 1]];
            if (nextRealAction) {
              Speech.speak(`準備下一個運動：${nextRealAction.name}`);
              nextVoiceTriggered.current = true;
            }
          }

          return nextTime;
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, isBuffering, bufferTime]);

  const triggerPause = async () => {
    clearInterval(timerRef.current);
    Speech.stop();
    Speech.speak("運動已暫停");

    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    } catch (error) {
      console.log("⚠️ iOS 翻轉請求被攔截：", error);
    }

    setTimeout(() => {
      setIsPaused(true);
    }, 280);
  };

  const triggerResume = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (error) {
      console.log("⚠️ iOS 恢復橫屏失敗：", error);
    }

    setTimeout(() => {
      setIsBuffering(true);
      setBufferTime(countdownSecsRef.current);
      setIsPaused(false);
    }, 280);
  };

  const handleNext = () => {
    if (currentIndex < playbackList.length - 1) {
      clearInterval(timerRef.current);
      Speech.stop();

      const nextAction = playbackList[currentIndex + 1];

      setIsBuffering(true);
      setBufferTime(countdownSecsRef.current);

      setTimeLeft(nextAction.totalSeconds);
      nextVoiceTriggered.current = false;
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert("太棒了！", "你已經完成本次所有的伸展項目的囉！", [
        { text: "確認", onPress: () => handleExit() }
      ]);
    }
  };

  const handleRestartCurrent = () => {
    setIsBuffering(true);
    setBufferTime(countdownSecsRef.current);
    setTimeLeft(currentAction.totalSeconds);
    nextVoiceTriggered.current = false;
    triggerResume();
  };

  const handleRestartCurrentPause = () => {
    setIsBuffering(true);
    setBufferTime(countdownSecsRef.current);
    setTimeLeft(currentAction.totalSeconds);
    nextVoiceTriggered.current = false;
    triggerResume();
  };

  const handleExit = async () => {
    clearInterval(timerRef.current);
    Speech.stop();
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } catch (e) { }
    router.back();
  };

  const formatTime = () => {
    if (isBuffering) {
      return bufferTime.toString();
    }
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ==================== 🛠️ 畫面渲染區 ====================

  if (isPaused) {
    return (
      <SafeAreaView style={styles.pauseOverlay} edges={['top', 'bottom']}>
        <View style={styles.pauseHeader}>
          <Pressable onPress={triggerResume} style={styles.resumeNavBtn}>
            <TurnBackIcon width={24} height={24} />
            <Text style={styles.resumeNavText}>繼續運動</Text>
          </Pressable>
        </View>

        <View style={styles.pauseMenuContainer}>
          <Pressable 
            onPressIn={() => animateScale(restartBtnScale, 0.95)}
            onPressOut={() => animateScale(restartBtnScale, 1, true)}
            style={styles.pauseMenuBtn} 
            onPress={handleRestartCurrentPause}
          >
            <Animated.View style={{ transform: [{ scale: restartBtnScale }], width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.pauseBtnText}>重新開始此運動</Text>
            </Animated.View>
          </Pressable>

          <Pressable 
            onPressIn={() => animateScale(exitBtnScale, 0.95)}
            onPressOut={() => animateScale(exitBtnScale, 1, true)}
            style={[styles.pauseMenuBtn, styles.exitBtn]} 
            onPress={handleExit}
          >
            <Animated.View style={{ transform: [{ scale: exitBtnScale }], width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.pauseBtnText}>退出</Text>
            </Animated.View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const skeletonColor = poseData.isSafe ? '#34C759' : '#FF3B30';

  const showActionImg = currentAction && currentAction.img;
  const showRestText = currentAction && !currentAction.img && isBuffering;
  const showRestGif = currentAction && !currentAction.img && !isBuffering;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.topBar}>
        <Pressable 
          onPressIn={() => animateScale(backArrowScale, 0.85)}
          onPressOut={() => animateScale(backArrowScale, 1, true)}
          onPress={triggerPause} 
          style={styles.iconPressZone}
        >
          <Animated.View style={{ transform: [{ scale: backArrowScale }] }}>
            <TurnBackIcon width={24} height={24} />
          </Animated.View>
        </Pressable>

        <Text style={styles.mainActionTitle}>
          {currentAction ? (isBuffering ? `準備：${currentAction.name}` : currentAction.name) : '讀取中...'}
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <View style={styles.contentBody}>
        {/* 左側：核心畫布區 */}
        <View style={[styles.visualCanvas, isAiMode && !poseData.isSafe && styles.canvasDangerBorder]}>
          {isAiMode ? (
            /* ==========================================
                【M3 精準重構】使用 100% 內建於 Expo Go 的 CameraView 進行無死鎖預覽，
                免除了所有環境報錯，並完美融合骨骼擬真動態線條！
               ========================================== */
            <View style={styles.cameraContainer}>
              {hasPermission ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="front" // 指定呼叫前置雙向自拍鏡頭
                />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraPlaceholderText}>[ 正在喚醒前置相機... ]</Text>
                </View>
              )}

              {/* 綠色/紅色 AI 骨骼動態模擬線條完整常駐覆蓋 */}
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 320 240">
                <Line
                  x1={poseData.leftShoulder.x} y1={poseData.leftShoulder.y}
                  x2={poseData.rightShoulder.x} y2={poseData.rightShoulder.y}
                  stroke={skeletonColor} strokeWidth="4" strokeLinecap="round"
                />
                <Line
                  x1={(poseData.leftShoulder.x + poseData.rightShoulder.x) / 2}
                  y1={(poseData.leftShoulder.y + poseData.rightShoulder.y) / 2}
                  x2={poseData.nose.x} y2={poseData.nose.y}
                  stroke={skeletonColor} strokeWidth="4" strokeLinecap="round"
                />
                <Line
                  x1={poseData.leftEar.x} y1={poseData.leftEar.y}
                  x2={poseData.rightEar.x} y2={poseData.rightEar.y}
                  stroke={skeletonColor} strokeWidth="3"
                />

                <Circle cx={poseData.nose.x} cy={poseData.nose.y} r="6" fill="#FFF" stroke={skeletonColor} strokeWidth="3" />
                <Circle cx={poseData.leftEar.x} cy={poseData.leftEar.y} r="5" fill="#FFF" stroke={skeletonColor} strokeWidth="2" />
                <Circle cx={poseData.rightEar.x} cy={poseData.rightEar.y} r="5" fill="#FFF" stroke={skeletonColor} strokeWidth="2" />
                <Circle cx={poseData.leftShoulder.x} cy={poseData.leftShoulder.y} r="7" fill="#FFF" stroke={skeletonColor} strokeWidth="3" />
                <Circle cx={poseData.rightShoulder.x} cy={poseData.rightShoulder.y} r="7" fill="#FFF" stroke={skeletonColor} strokeWidth="3" />
              </Svg>

              <View style={[styles.aiBadge, { backgroundColor: poseData.isSafe ? 'rgba(52, 199, 89, 0.25)' : 'rgba(255, 59, 48, 0.25)' }]}>
                <Text style={[styles.aiBadgeText, { color: poseData.isSafe ? '#34C759' : '#FF3B30' }]}>
                  {poseData.isSafe ? '● 姿勢標準' : '⚠️ 側傾過度 / 聳肩警告'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.imageWrapper}>
              {/* 正式動作圖層 */}
              <View style={[styles.absoluteLayer, { opacity: showActionImg ? 1 : 0, zIndex: showActionImg ? 3 : 1 }]}>
                {currentAction?.img && (
                  <Image source={currentAction.img} style={styles.actionImage} resizeMode="contain" />
                )}
              </View>

              {/* 5秒純文字休息圖層 */}
              <View style={[styles.absoluteLayer, { opacity: showRestText ? 1 : 0, zIndex: showRestText ? 3 : 1 }]}>
                <View style={styles.restCenterView}>
                  <Text style={styles.restTitleText}>☕ 休息準備中...</Text>
                  <Text style={styles.restDescText}>調整呼吸，稍喘一下...</Text>
                </View>
              </View>

              {/* 30秒 Rest.gif 圖層 */}
              <View style={[styles.restGifWrapper, { opacity: showRestGif ? 1 : 0, zIndex: showRestGif ? 3 : 1 }]}>
                <Image
                  source={RestGifSource}
                  style={styles.restGifImage}
                  resizeMode="contain"
                  autoplay={true}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.controlTower}>
          <Pressable
            onPressIn={() => animateScale(aiToggleScale, 0.88)}
            onPressOut={() => animateScale(aiToggleScale, 1, true)}
            onPress={handleToggleAiMode} // 💡 綁定權限智慧感應安全入口
          >
            <Animated.View style={[styles.aiToggleBtn, isAiMode ? styles.aiActive : styles.aiInactive, { transform: [{ scale: aiToggleScale }] }]}>
              <Image
                source={AiCameraSource}
                style={[
                  styles.cameraImage,
                  { tintColor: isAiMode ? '#ffffff' : '#000000' }
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </Pressable>

          <Pressable onPress={triggerPause} style={styles.timerRingPressZone}>
            <Svg width={160} height={160} style={styles.svgRing}>
              <Circle
                cx="80"
                cy="80"
                r={radius}
                stroke={isBuffering ? '#FFCC00' : (currentAction?.isRest ? '#8E8E93' : '#B2F6B1')}
                strokeWidth={strokeWidth}
                strokeDasharray={getDynamicDashArray()}
                strokeLinecap="round"
                fill="transparent"
                transform="rotate(-90 80 80)"
              />
            </Svg>
            <View style={styles.countdownNumberLabel}>
              <Text style={[styles.countdownText, isBuffering && styles.bufferCountdownText]}>
                {formatTime()}
              </Text>
            </View>
          </Pressable>

          <Pressable 
            onPressIn={() => animateScale(skipBtnScale, 0.9)}
            onPressOut={() => animateScale(skipBtnScale, 1, true)}
            onPress={handleNext} 
            style={styles.skipBtnPressZone}
          >
            <Animated.View style={[{ transform: [{ scale: skipBtnScale }], alignItems: 'center' }]}>
              <NextIcon width={32} height={32} />
              <Text style={styles.skipText}>跳過</Text>
            </Animated.View>
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  topBar: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconPressZone: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  mainActionTitle: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },

  contentBody: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 },
  visualCanvas: { flex: 1.4, aspectRatio: 16 / 9, backgroundColor: '#FAFAFC', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginRight: 20, borderWidth: 1, borderColor: '#F2F2F7' },
  canvasDangerBorder: { borderColor: '#FF3B30', borderWidth: 2 },
  imageWrapper: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  actionImage: { width: '85%', height: '85%' },

  absoluteLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  restGifWrapper: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  restGifImage: {
    width: '100%',
    height: '100%'
  },

  cameraContainer: { width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' },
  cameraPlaceholder: { width: '100%', height: '100%', backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' },
  cameraPlaceholderText: { color: '#8E8E93', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  aiBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  aiBadgeText: { fontSize: 13, fontWeight: 'bold' },

  restCenterView: { justifyContent: 'center', alignItems: 'center' },
  restTitleText: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  restDescText: { fontSize: 16, color: '#8E8E93' },

  controlTower: { flex: 0.6, height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', position: 'relative' },
  aiToggleBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: -20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  aiActive: { backgroundColor: '#000' },
  aiInactive: { backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  cameraImage: { width: 28, height: 28 },

  timerRingPressZone: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  svgRing: { position: 'absolute' },
  countdownNumberLabel: { justifyContent: 'center', alignItems: 'center' },
  countdownText: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
  bufferCountdownText: { fontSize: 44, color: '#FFCC00' },

  skipBtnPressZone: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  skipText: { fontSize: 14, color: '#8E8E93', marginTop: 4, fontWeight: '600' },

  pauseOverlay: { flex: 1, backgroundColor: 'rgba(28, 28, 30, 0.98)', paddingHorizontal: 25 },
  pauseHeader: { height: 70, justifyContent: 'center' },
  resumeNavBtn: { flexDirection: 'row', alignItems: 'center' },
  resumeNavText: { color: '#fff', fontSize: 20, fontWeight: '600', marginLeft: 8 },
  pauseMenuContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  pauseMenuBtn: { width: '90%', height: 70, backgroundColor: '#48484A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  exitBtn: { backgroundColor: 'rgba(255, 59, 48, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },
  pauseBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }
});