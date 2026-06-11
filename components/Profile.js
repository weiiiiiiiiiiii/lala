import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, Dimensions, Modal, ScrollView, PanResponder } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 💡 引入 useSafeAreaInsets
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// 引入萬能控色版返回鍵
import TurnBackIcon from '../assets/images/TurnBack.svg';

// 加載亮暗模式 PNG 靜態資產
const SUN_PNG = require('../assets/images/Sun.png');
const MOON_PNG = require('../assets/images/Moon.png');

const { width, height } = Dimensions.get('window');

// 統一主視覺配色變數
const HEADER_BG = '#838D95';        // 上半部大背景色
const CONTENT_BG = '#626C72';       // 下半部運動設定背景色
const LOGOUT_BG = '#424E58';        // 登出按鈕專屬底色
const DARK_NAVY = '#2D3A48';        // 亮暗按鈕選中深色背景
const TEXT_PINK = '#F3C0BA';        // 「運動設定」、「其他」的小標桃粉色
const TEXT_YELLOW = '#FFFBDD';      // 時間數據與音量的柔黃色

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 💡 取得安全區域數據，用來與導覽列高度對齊

  // 使用者頭像與狀態資料夾 (邏輯完美保留)
  const [userPic, setUserpic] = useState(null);
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(true);

  // 💡 1. 亮暗模式狀態（預設為暗色模式 'dark'）
  const [themeMode, setThemeMode] = useState('dark');

  // 💡 2. 音量狀態值（範圍 0 ~ 1，預設 0.8 代表 80%）
  const [volume, setVolume] = useState(0.8);
  const trackWidth = 160; // 軌道固定物理寬度

  // 控制時間選擇器 Modal 顯示
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [currentSettingLabel, setCurrentSettingLabel] = useState('');

  // ==========================================
  // 【方案 A】控制按鈕回饋之專屬動態核心
  // ==========================================
  const loginRowScale = useRef(new Animated.Value(1)).current;
  const sunBtnScale = useRef(new Animated.Value(1)).current;
  const moonBtnScale = useRef(new Animated.Value(1)).current;
  const logoutBtnScale = useRef(new Animated.Value(1)).current;
  const cancelBtnScale = useRef(new Animated.Value(1)).current;
  const doneBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  // 使用者登入與 Firestore 頭像獲取狀態監聽 (核心邏輯原封不動)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserpic(data.avatar || null); 
          }
        } catch (error) {
          console.error('撈取使用者頭像失敗:', error);
        }
      } else {
        setUserpic(null);
      }
      setInit(false);
    });
    return unsubscribe;
  }, []);

  // 偵測是否login
  const userLogin = !!user;

  // ==========================================
  // 💡 【核心重構：手動音量滑動監聽大腦】
  // 只有在 userLogin === true 時才激活滑動權限，未登入直接阻斷
  // ==========================================
  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => userLogin,
      onMoveShouldSetPanResponder: () => userLogin,
      onPanResponderGrant: (e, gestureState) => {
        // 點擊軌道任何地方時，即時瞬移更新音量數值，手感極佳
        const clickX = gestureState.x0 - (width * 0.9 - trackWidth - 60); 
        let newVol = Math.max(0, Math.min(1, clickX / trackWidth));
        setVolume(newVol);
      },
      onPanResponderMove: (e, gestureState) => {
        // 計算手指拖曳時的橫向座標百分比
        const currentX = gestureState.x0 + gestureState.dx - (width * 0.9 - trackWidth - 60);
        let newVol = Math.max(0, Math.min(1, currentX / trackWidth));
        setVolume(newVol);
      },
      onPanResponderRelease: (e, gestureState) => {
        // 💡 幫你預留好未來串接真實控制音量的入口防線！
        // 未來安裝 expo-av 後，直接在此處呼叫變音：Audio.setAudioModeAsync({ ... }) 或者是控制音效播放
        console.log("當前最新變音釋放數據（0~1）:", volume);
      }
    })
  ).current;

  // 登出邏輯
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('已成功登出');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  const openTimePicker = (label) => {
    if (!userLogin) return; 
    setCurrentSettingLabel(label);
    setIsPickerVisible(true);
  };

  if (init) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* ==========================================
          1. Upper Header：用戶資訊區域 (背景 838D95)
         ========================================== */}
      <View style={styles.topProfileSection}>
        <Pressable
          onPressIn={() => animateScale(loginRowScale, 0.98)}
          onPressOut={() => animateScale(loginRowScale, 1, true)}
          onPress={() => {
            if (!userLogin) router.push('/loginsignup');
          }}
          style={{ width: '100%' }}
        >
          <Animated.View style={[styles.loginContentRow, { transform: [{ scale: loginRowScale }] }]}>
            <View style={styles.loginLeftCheck}>
              {userLogin && userPic ? (
                <Image source={{ uri: userPic }} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle} />
              )}
              
              <Text style={styles.userNameText}>
                {userLogin ? (user.displayName || '未命名用戶') : '登入/註冊'}
              </Text>
            </View>
            <TurnBackIcon 
              width={22} 
              height={22} 
              stroke="#fff" 
              color="#fff" 
              style={styles.arrowInverse} 
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* ==========================================
          2. Lower Container：運動設定與其他區塊 (背景 626C72)
         ========================================== */}
      <View style={styles.lowerSettingsContainer}>
        
        {/* 亮暗模式大膠囊列 (背景 838D95) */}
        <View style={styles.themeToggleCapsule}>
          <Text style={styles.themeToggleLabel}>亮暗模式</Text>
          <View style={styles.toggleButtonsGroup}>
            
            {/* 太陽按鈕 */}
            <Pressable
              onPressIn={() => animateScale(sunBtnScale, 0.85)}
              onPressOut={() => animateScale(sunBtnScale, 1, true)}
              onPress={() => setThemeMode('light')}
              style={styles.themeIconButtonWrapper}
            >
              <Animated.View style={[
                styles.themeIconBtn, 
                themeMode === 'light' && styles.activeThemeBtn, // 💡 智慧底槽連動
                { transform: [{ scale: sunBtnScale }] }
              ]}>
                <Image 
                  source={SUN_PNG} 
                  style={[
                    styles.themePngStyle, 
                    { tintColor: themeMode === 'light' ? '#ffffff' : '#000000' } // 💡 智慧控色
                  ]} 
                  resizeMode="contain" 
                />
              </Animated.View>
            </Pressable>

            {/* 月亮按鈕 */}
            <Pressable
              onPressIn={() => animateScale(moonBtnScale, 0.85)}
              onPressOut={() => animateScale(moonBtnScale, 1, true)}
              onPress={() => setThemeMode('dark')}
              style={styles.themeIconButtonWrapper}
            >
              <Animated.View style={[
                styles.themeIconBtn, 
                themeMode === 'dark' && styles.activeThemeBtn, // 💡 智慧底槽連動
                { transform: [{ scale: moonBtnScale }] }
              ]}>
                <Image 
                  source={MOON_PNG} 
                  style={[
                    styles.themePngStyle, 
                    { tintColor: themeMode === 'dark' ? '#ffffff' : '#000000' } // 💡 智慧控色
                  ]} 
                  resizeMode="contain" 
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* 滾動設定選單 */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.innerMenuGap}>
            
            {/* 分類一：運動設定 */}
            <View style={styles.menuGroup}>
              <Text style={styles.categorySubTitle}>運動設定</Text>
              <View style={styles.horizontalDivider} />

              {/* 預設運動時間項目 */}
              <Pressable style={styles.menuItemRow} onPress={() => openTimePicker('預設運動時間')}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>預設運動時間</Text>
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>00:30</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              {/* 每次休息時間項目 */}
              <Pressable style={styles.menuItemRow} onPress={() => openTimePicker('每次休息時間')}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>每次休息時間</Text>
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>00:15</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              {/* 姿勢準備倒計時項目 */}
              <Pressable style={styles.menuItemRow} onPress={() => openTimePicker('姿勢準備倒計時')}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>姿勢準備倒計時</Text>
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>00:08</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              {/* 💡 提示音量智慧滑軌項目 (綁定原生手勢監聽) */}
              <View style={styles.menuItemRow}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>提示音量</Text>
                <View style={styles.volumeSliderControlWrapper}>
                  
                  {/* 精置手作滑動軌道列 */}
                  <View 
                    {...volumePanResponder.panHandlers}
                    style={[styles.customTrackLine, !userLogin && { opacity: 0.25 }]}
                  >
                    {/* 白色滿版進度填充區，寬度百分比動態連動 */}
                    <View style={[styles.customFillProgress, { width: `${volume * 100}%` }]} />
                    {/* 圓形小滑塊，橫向座標依百分比動態移動 */}
                    <View style={[styles.customSliderThumb, { left: `${volume * 100}%`, marginLeft: volume > 0.9 ? -10 : -5 }]} />
                  </View>

                  <Text style={userLogin ? styles.volumePercentageLabel : styles.volumePercentageLabelDisabled}>
                    {Math.round(volume * 100)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* 分類二：其他 */}
            <View style={styles.menuGroup}>
              <Text style={styles.categorySubTitle}>其他</Text>
              <View style={styles.horizontalDivider} />

              <Pressable style={styles.menuItemRow}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>問題回報</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              <Pressable style={styles.menuItemRow}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>聯絡我們</Text>
              </Pressable>
            </View>

          </View>
          {/* 💡 底部緩衝高度從 120 增加到 180，避免選單最後一項滾動時被「登出鈕+導覽列」雙重遮擋 */}
          <View style={{ height: 180 }} />
        </ScrollView>
      </View>

      {/* 💡 移至最外層的登出按鈕：透過動態 bottom (60 + insets.bottom) 精準避開並卡在自訂導覽列之上 */}
      {userLogin && (
        <Pressable
          onPressIn={() => animateScale(logoutBtnScale, 0.98)}
          onPressOut={() => animateScale(logoutBtnScale, 1, true)}
          onPress={handleLogout}
          style={[styles.logoutBtnOuterWrapper, { bottom: 60 + insets.bottom }]}
        >
          <Animated.View style={[styles.logoutBarBtn, { transform: [{ scale: logoutBtnScale }] }]}>
            <Text style={styles.logoutTextText}>登出</Text>
          </Animated.View>
        </Pressable>
      )}

      {/* TimePicker 滑出式時間選擇器彈窗 (Modal) */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.bottomSheetContainer}>
            
            {/* 頂部取消與完成動作列 */}
            <View style={styles.pickerHeaderActionBar}>
              <Pressable 
                onPressIn={() => animateScale(cancelBtnScale, 0.9)}
                onPressOut={() => animateScale(cancelBtnScale, 1, true)}
                onPress={() => setIsPickerVisible(false)}
              >
                <Animated.Text style={[styles.pickerActionBtnText, { color: '#007AFF', transform: [{ scale: cancelBtnScale }] }]}>取消</Animated.Text>
              </Pressable>
              
              <Pressable 
                onPressIn={() => animateScale(doneBtnScale, 0.9)}
                onPressOut={() => animateScale(doneBtnScale, 1, true)}
                onPress={() => setIsPickerVisible(false)}
              >
                <Animated.Text style={[styles.pickerActionBtnText, { color: '#007AFF', fontWeight: '700', transform: [{ scale: doneBtnScale }] }]}>完成</Animated.Text>
              </Pressable>
            </View>

            {/* 復刻設計圖高質感滾動模擬展示層 */}
            <View style={styles.scrollWheelsWrapper}>
              <Text style={styles.ambientWheelNumber}>10</Text>
              <Text style={styles.ambientWheelNumber}>15</Text>
              <Text style={styles.ambientWheelNumber}>20</Text>
              <Text style={styles.ambientWheelNumber}>25</Text>
              
              {/* 核心選中高亮排版列 */}
              <View style={styles.activeSelectionCenterRow}>
                <View style={styles.numberCapsuleContainer}>
                  <Text style={styles.centerActiveNumberText}>0</Text>
                </View>
                <Text style={styles.unitLabelText}>分鐘</Text>

                <View style={styles.numberCapsuleContainer}>
                  <Text style={styles.centerActiveNumberText}>30</Text>
                </View>
                <Text style={styles.unitLabelText}>秒</Text>
              </View>

              <Text style={styles.ambientWheelNumber}>35</Text>
              <Text style={styles.ambientWheelNumber}>40</Text>
              <Text style={styles.ambientWheelNumber}>45</Text>
              <Text style={styles.ambientWheelNumber}>50</Text>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HEADER_BG },
  
  topProfileSection: { height: 160, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 10 },
  loginContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loginLeftCheck: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  
  avatarCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#EAE0D5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userNameText: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', letterSpacing: 0.5 },
  arrowInverse: { transform: [{ scaleX: -1 }] }, 

  lowerSettingsContainer: { flex: 1, backgroundColor: CONTENT_BG, paddingTop: 24 },
  
  themeToggleCapsule: {
    width: '90%',
    height: 60,
    borderRadius: 30,
    backgroundColor: HEADER_BG, 
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  themeToggleLabel: { fontSize: 18, color: '#fff', fontWeight: '600' },
  toggleButtonsGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeIconButtonWrapper: { width: 44, height: 44 },
  themeIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  activeThemeBtn: { backgroundColor: DARK_NAVY },
  themePngStyle: { width: 22, height: 22 },

  innerMenuGap: { paddingHorizontal: 24, gap: 32 },
  menuGroup: { width: '100%' },
  
  categorySubTitle: { color: TEXT_PINK, fontSize: 16, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  horizontalDivider: { borderBottomColor: TEXT_PINK, borderBottomWidth: 1, opacity: 0.3, marginBottom: 16, width: '100%' },
  innerRowDivider: { borderBottomColor: 'rgba(255, 255, 255, 0.08)', borderBottomWidth: 1, marginVertical: 14, width: '100%' },
  
  menuItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 30 },
  
  menuItemText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  menuItemTextDisabled: { color: '#fff', fontSize: 17, fontWeight: '600', opacity: 0.2 },
  
  timeValueText: { color: TEXT_YELLOW, fontSize: 17, fontWeight: '600' },
  timeValueTextDisabled: { color: TEXT_YELLOW, fontSize: 17, fontWeight: '600', opacity: 0.5 },

  // 客製化提示音量滑軌外觀尺寸
  volumeSliderControlWrapper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  customTrackLine: { width: 160, height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, position: 'relative', justifyContent: 'center' },
  customFillProgress: { height: 8, backgroundColor: '#fff', borderRadius: 4, position: 'absolute', left: 0 },
  customSliderThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', position: 'absolute', top: -4 },
  
  volumePercentageLabel: { color: TEXT_YELLOW, fontSize: 15, fontWeight: '600', minWidth: 36, textAlign: 'right' },
  volumePercentageLabelDisabled: { color: TEXT_YELLOW, fontSize: 15, fontWeight: '600', minWidth: 36, textAlign: 'right', opacity: 0.5 },

  // 登出按鈕底座滿版橫條 (背景 424E58)
  logoutBtnOuterWrapper: { width: '100%', height: 60, position: 'absolute' }, // 💡 移除了寫死的 bottom: 0，改由行內 style 動態傳入計算
  logoutBarBtn: { width: '100%', height: 60, backgroundColor: LOGOUT_BG, justifyContent: 'center', alignItems: 'center' },
  logoutTextText: { color: '#FF453A', fontSize: 18, fontWeight: '700', letterSpacing: 1 },

  // TimePicker 底部滑出層樣式
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  bottomSheetContainer: { width: '100%', height: height * 0.45, backgroundColor: HEADER_BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  pickerHeaderActionBar: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  pickerActionBtnText: { fontSize: 17, color: '#fff' },
  
  scrollWheelsWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  ambientWheelNumber: { fontSize: 18, color: 'rgba(255, 255, 255, 0.25)', marginVertical: 4, fontWeight: '500' },
  
  activeSelectionCenterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10, gap: 12 },
  numberCapsuleContainer: { width: 85, height: 38, backgroundColor: 'rgba(255, 255, 255, 0.35)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  centerActiveNumberText: { fontSize: 22, fontWeight: '700', color: '#000' },
  unitLabelText: { fontSize: 18, color: '#fff', fontWeight: '600' }
});