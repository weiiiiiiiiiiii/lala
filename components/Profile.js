import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, Dimensions, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 💡 引入 useSafeAreaInsets
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import useListStore from '../store/useListStore';

// 引入萬能控色版返回鍵
import TurnBackIcon from '../assets/images/TurnBack.svg';

// 加載亮暗模式 PNG 靜態資產
const SUN_PNG = require('../assets/images/Sun.png');
const MOON_PNG = require('../assets/images/Moon.png');

const { height } = Dimensions.get('window');

// ==========================================
// 滾輪選擇器常數與組件
// ==========================================
const ITEM_HEIGHT = 52;
const MINUTE_DATA = Array.from({ length: 60 }, (_, i) => i);
const SECOND_DATA_5 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const SECOND_DATA_1 = Array.from({ length: 60 }, (_, i) => i);

const PickerColumn = ({ data, value, onValueChange, label }) => {
  const scrollRef = useRef(null);
  const justSettledRef = useRef(false);

  const getIdx = (val) => {
    const idx = data.indexOf(val);
    return idx >= 0 ? idx : 0;
  };

  const scrollToIdx = (idx, animated) => {
    scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated });
  };

  useEffect(() => {
    if (justSettledRef.current) {
      justSettledRef.current = false;
      return;
    }
    const timer = setTimeout(() => scrollToIdx(getIdx(value), false), 30);
    return () => clearTimeout(timer);
  }, [value, data.length]);

  const handleScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_HEIGHT)));
    justSettledRef.current = true;
    onValueChange(data[idx]);
    scrollToIdx(idx, true);
  };

  return (
    <View style={pickerColStyles.container}>
      <View style={{ position: 'relative', height: ITEM_HEIGHT * 5 }}>
        <View pointerEvents="none" style={pickerColStyles.centerHighlight} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentOffset={{ x: 0, y: getIdx(value) * ITEM_HEIGHT }}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
          nestedScrollEnabled={true}
        >
          {data.map((val) => (
            <Pressable key={val} onPress={() => {
              justSettledRef.current = true;
              onValueChange(val);
              scrollToIdx(getIdx(val), true);
            }}>
              <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Text style={[
                  pickerColStyles.itemText,
                  val === value && pickerColStyles.itemTextSelected,
                ]}>
                  {String(val).padStart(2, '0')}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <Text style={pickerColStyles.label}>{label}</Text>
    </View>
  );
};

const pickerColStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2 ,
    left: -5,
    height: ITEM_HEIGHT ,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
  },
  itemText: { fontSize: 22, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  itemTextSelected: { fontSize: 22, fontWeight: '700', color: '#fff' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 8 },
});

// 統一主視覺配色變數
const HEADER_BG = '#838D95';        // 上半部大背景色
const CONTENT_BG = '#626C72';       // 下半部運動設定背景色
const LOGOUT_BG = '#424E58';        // 登出按鈕專屬底色
const DARK_NAVY = '#2D3A48';        // 亮暗按鈕選中深色背景
const TEXT_PINK = '#F3C0BA';        // 「運動設定」、「其他」的小標桃粉色
const TEXT_YELLOW = '#FFFBDD';      // 時間數據與音量的柔黃色

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, colors } = useTheme();
  const settings = useListStore((state) => state.settings);
  const updateSettings = useListStore((state) => state.updateSettings);

  // 使用者頭像與狀態資料夾 (邏輯完美保留)
  const [userPic, setUserpic] = useState(null);
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(true);

  // 控制時間選擇器 Modal 顯示
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [currentSettingLabel, setCurrentSettingLabel] = useState('');

  // TimePicker 選取狀態
  const [pickerMinutes, setPickerMinutes] = useState(0);
  const [pickerSeconds, setPickerSeconds] = useState(30);

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

  // 登出邏輯
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('已成功登出');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  const parseTimeStr = (str) => {
    const parts = (str || '00:00').split(':');
    return { m: parseInt(parts[0]) || 0, s: parseInt(parts[1]) || 0 };
  };

  const openTimePicker = (label) => {
    if (!userLogin) return;
    setCurrentSettingLabel(label);
    let timeStr = '00:30';
    if (label === '預設運動時間') timeStr = settings?.defaultWorkoutTime || '00:30';
    else if (label === '每次休息時間') timeStr = settings?.restTime || '00:15';
    else if (label === '姿勢準備倒計時') timeStr = settings?.countdownTime || '00:08';
    const { m, s } = parseTimeStr(timeStr);
    setPickerMinutes(m);
    if (label === '姿勢準備倒計時') {
      setPickerSeconds(s);
    } else {
      setPickerSeconds(Math.round(s / 5) * 5 % 60);
    }
    setIsPickerVisible(true);
  };

  const handlePickerDone = () => {
    const totalSec = pickerMinutes * 60 + pickerSeconds;
    const minSec = currentSettingLabel === '預設運動時間' ? 10 : 5;
    if (totalSec < minSec) {
      Alert.alert('時間太短', `「${currentSettingLabel}」最少需要 ${minSec} 秒`);
      return;
    }
    const timeStr = `${String(pickerMinutes).padStart(2, '0')}:${String(pickerSeconds).padStart(2, '0')}`;
    if (currentSettingLabel === '預設運動時間') updateSettings('defaultWorkoutTime', timeStr);
    else if (currentSettingLabel === '每次休息時間') updateSettings('restTime', timeStr);
    else if (currentSettingLabel === '姿勢準備倒計時') updateSettings('countdownTime', timeStr);
    setIsPickerVisible(false);
  };

  if (init) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.headerBg }]} edges={['top']}>
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
      <View style={[styles.lowerSettingsContainer, { backgroundColor: colors.contentBg }]}>
        
        {/* 亮暗模式大膠囊列 */}
        <View style={[styles.themeToggleCapsule, { backgroundColor: colors.headerBg }]}>
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
                themeMode === 'light' && { backgroundColor: colors.darkNavy },
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
                themeMode === 'dark' && { backgroundColor: colors.darkNavy },
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
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>{settings?.defaultWorkoutTime || '00:30'}</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              {/* 每次休息時間項目 */}
              <Pressable style={styles.menuItemRow} onPress={() => openTimePicker('每次休息時間')}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>每次休息時間</Text>
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>{settings?.restTime || '00:15'}</Text>
              </Pressable>
              <View style={styles.innerRowDivider} />

              {/* 姿勢準備倒計時項目 */}
              <Pressable style={styles.menuItemRow} onPress={() => openTimePicker('姿勢準備倒計時')}>
                <Text style={userLogin ? styles.menuItemText : styles.menuItemTextDisabled}>姿勢準備倒計時</Text>
                <Text style={userLogin ? styles.timeValueText : styles.timeValueTextDisabled}>{settings?.countdownTime || '00:08'}</Text>
              </Pressable>
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
          style={[styles.logoutBtnOuterWrapper, { bottom: 110 + insets.bottom }]}
        >
          <Animated.View style={[styles.logoutBarBtn, { backgroundColor: colors.logoutBg, transform: [{ scale: logoutBtnScale }] }]}>
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
          <View style={[styles.bottomSheetContainer, { backgroundColor: colors.headerBg }]}>
            
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
                onPress={handlePickerDone}
              >
                <Animated.Text style={[styles.pickerActionBtnText, { color: '#007AFF', fontWeight: '700', transform: [{ scale: doneBtnScale }] }]}>完成</Animated.Text>
              </Pressable>
            </View>

            {/* 滾動選時區：左右兩欄滑動滾輪 */}
            <View style={styles.scrollWheelsWrapper}>
              <PickerColumn
                data={MINUTE_DATA}
                value={pickerMinutes}
                onValueChange={setPickerMinutes}
                label="分鐘"
              />
              <View style={styles.colonSeparatorView}>
                <Text style={styles.colonSeparatorText}>:</Text>
              </View>
              <PickerColumn
                data={currentSettingLabel === '姿勢準備倒計時' ? SECOND_DATA_1 : SECOND_DATA_5}
                value={pickerSeconds}
                onValueChange={setPickerSeconds}
                label="秒"
              />
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

  // 登出按鈕底座滿版橫條 (背景 424E58)
  logoutBtnOuterWrapper: { width: '100%', height: 60, position: 'absolute' }, // 💡 移除了寫死的 bottom: 0，改由行內 style 動態傳入計算
  logoutBarBtn: { width: '100%', height: 60, backgroundColor: LOGOUT_BG, justifyContent: 'center', alignItems: 'center' },
  logoutTextText: { color: '#FF453A', fontSize: 18, fontWeight: '700', letterSpacing: 1 },

  // TimePicker 底部滑出層樣式
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  bottomSheetContainer: { width: '100%', height: height * 0.45, backgroundColor: HEADER_BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  pickerHeaderActionBar: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  pickerActionBtnText: { fontSize: 17, color: '#fff' },
  
  scrollWheelsWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 },
  colonSeparatorView: { paddingBottom: 32, paddingHorizontal: 4 },
  colonSeparatorText: { fontSize: 30, fontWeight: '700', color: '#fff' }
});