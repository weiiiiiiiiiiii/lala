import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../config/firebase';

// 引入自訂 SVG 圖示
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';
import AddToList from '../assets/images/addtolist.svg';

// 引入全域 Store 與 靜態資料
import useListStore from '../store/useListStore';
import { ALL_STRETCHES } from './stretchData';

const { width } = Dimensions.get('window');

const THEME_COLOR = '#2D3A48';
const BUTTON_COLOR = '#7F8CDA';

// ==========================================
// 【方案 A 專用】為了讓列表卡片和愛心鍵可以獨立觸動動畫，
// 我們建立一個獨立封裝的動畫 Pressable 元件，這樣各卡片就不會互相干擾。
// ==========================================
const AnimatedPressable = ({ children, style, onPress, scaleTo = 0.96 }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleValue, {
      toValue: scaleTo,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,  // 控制彈簧的阻力，越低越 Q 彈
      tension: 40,  // 控制彈簧的張力
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={{ width: '100%' }}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function LalaDetail({ title, onBack }) {
  const router = useRouter();
  const { colors } = useTheme();
  const defaultWorkoutTime = useListStore((state) => state.settings?.defaultWorkoutTime || '00:30');

  const toggleFavoriteStore = useListStore((state) => state.toggleFavorite);
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];
  const copyBulkActionsToList = useListStore((state) => state.copyBulkActionsToList);
  const addList = useListStore((state) => state.addList);

  const [actionList, setActionList] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // ==========================================
  // 【方案 A】Header 按鈕與底部開始按鈕的專屬動態核心
  // ==========================================
  const backAnimScale = useRef(new Animated.Value(1)).current;
  const addListAnimScale = useRef(new Animated.Value(1)).current;
  const startBtnAnimScale = useRef(new Animated.Value(1)).current;

  // 動畫觸發工具函式
  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    if (title === '喜愛清單') {
      const listWithState = favorites.map(item => ({ ...item, isFavorite: true }));
      setActionList(listWithState);
    } else {
      const list = ALL_STRETCHES[title] || [];
      const listWithState = list.map(item => ({
        ...item,
        isFavorite: favorites.some(fav => fav.id === item.id)
      }));
      setActionList(listWithState);
    }
  }, [title, favorites]);

  const handleToggleFavorite = (item) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('尚未登入', '請先進行登入作業',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '前往登入',
            onPress: () => {
              // 如果你的登入入口在 /loginsignup，直接推頁面過去
              router.push('/loginsignup');
            }
          }
        ]
      );
      return;
    }
    const isCurrentlyFavorite = favorites.some((fav) => fav.id === item.id);
    toggleFavoriteStore(item);

    if (isCurrentlyFavorite) {
      Alert.alert('提示', '已從喜愛清單移除');
    } else {
      Alert.alert('提示', '已加入喜愛清單');
    }
  };

  const isItemFavorite = (id) => favorites.some(fav => fav.id === id);

  const handleOpenActionDetail = (item) => {
    router.push({
      pathname: '/actionPage',
      params: {
        actionId: item.id,
        parentTitle: title
      }
    });
  }

  const handleCopyEntireList = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('尚未登入', '請先進行登入作業',
        [
          { text: '取消', style: 'cancel' },
          { text: '前往登入', onPress: () => router.push('/loginsignup') }
        ]
      );
      return;
    }
    setIsMenuVisible(true);
  };

  const handleSelectTargetList = (targetList) => {
    setIsMenuVisible(false);
    if (!copyBulkActionsToList) return;

    const { successCount, duplicateCount } = copyBulkActionsToList(targetList.id, actionList);

    if (successCount > 0) {
      Alert.alert('已加入清單', `成功匯入 ${successCount} 個新動作！`);
    } else if (duplicateCount > 0) {
      Alert.alert('提示', `這些動作已在「${targetList.title}」清單裡`);
    }
  };

  const handleCreateNewList = () => {
    setIsMenuVisible(false);

    Alert.prompt(
      '建立新清單',
      '請輸入新清單的名稱：',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '建立並匯入',
          onPress: (text) => {
            if (!text || text.trim() === '') {
              Alert.alert('提示', '清單名稱不能為空！');
              return;
            }

            const uniqueNewActions = actionList.map((act, idx) => ({
              ...act,
              id: `${act.id}_bulk_${Date.now()}_${idx}_${Math.floor(Math.random() * 100)}`
            }));

            if (addList) {
              addList(text.trim(), uniqueNewActions);
              Alert.alert('成功', `已建立「${text.trim()}」並成功匯入整份動作！`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleStartWorkout = async () => {
    if (actionList.length === 0) return;

    try {
      const ScreenOrientation = require('expo-screen-orientation');
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      console.log("⚠️ 提早轉橫屏失敗", e);
    }

    setTimeout(() => {
      router.push({
        pathname: '/workoutPlayer',
        params: {
          listTitle: title,
          actionsData: JSON.stringify(actionList)
        }
      });
    }, 150);
  };

  const userCustomLists = myLists.filter(list => !list.id.toString().startsWith('rec_'));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.darkNavy }]} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.headerWrapper, { backgroundColor: colors.darkNavy }]}>
        <View style={styles.header}>
          {/* 【方案 A】返回鍵 Q彈化 */}
          <Pressable
            onPressIn={() => animateScale(backAnimScale, 0.92)}
            onPressOut={() => animateScale(backAnimScale, 1, true)}
            onPress={onBack}
          >
            <Animated.View style={[styles.backButton, { transform: [{ scale: backAnimScale }] }]}>
              <TurnBackIcon width={20} height={20} stroke="#fff" color="#fff" />
            </Animated.View>
          </Pressable>

          <Text style={styles.headText}>{title}</Text>

          {title === '喜愛清單' ? (
            <View style={{ width: 40 }} />
          ) : (
            /* 【方案 A】加入清單鍵 Q彈化 */
            <Pressable
              onPressIn={() => animateScale(addListAnimScale, 0.92)}
              onPressOut={() => animateScale(addListAnimScale, 1, true)}
              onPress={handleCopyEntireList}
            >
              <Animated.View style={[styles.rightHeaderButton, { transform: [{ scale: addListAnimScale }] }]}>
                <AddToList width={22} height={22} stroke="#fff" color="#fff" />
              </Animated.View>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            actionList.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
        >
          {actionList.length > 0 ? (
            actionList.map((item) => (
              /* 【方案 A】動作列表卡片：替換為獨立彈性縮小組件，維持原本寬高比例 */
              <AnimatedPressable
                key={item.id}
                style={styles.actionListItem}
                onPress={() => handleOpenActionDetail(item)}
                scaleTo={0.97}
              >
                <View style={styles.infoArea}>
                  {/* 【方案 A】愛心鍵：替換為獨立彈性縮小組件，防止點擊事件穿透卡片 */}
                  <View style={styles.heartContainerOuter}>
                    <AnimatedPressable
                      style={styles.heartBtn}
                      onPress={() => handleToggleFavorite(item)}
                      scaleTo={0.85}
                    >
                      {isItemFavorite(item.id) ? (
                        <LoveIconActive width={24} height={24} />
                      ) : (
                        <LoveIcon width={24} height={24} />
                      )}
                    </AnimatedPressable>
                  </View>

                  <View style={styles.textGroup}>
                    <Text style={styles.actionTitle}>{item.name}</Text>
                    <Text style={styles.actionDesc}>{item.detail}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time || defaultWorkoutTime}</Text>
                </View>

                <View style={styles.imageContainer}>
                  <Image source={item.img} style={styles.actionImage} resizeMode="cover" />
                </View>
              </AnimatedPressable>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>目前沒有運動項目在此清單</Text>
            </View>
          )}

          <View style={{ height: actionList.length > 0 ? 120 : 20 }} />
        </ScrollView>

        {/* 【方案 A】底部開始按鈕 Q彈化 */}
        {actionList.length > 0 && (
          <View style={styles.bottomContainer}>
            <Pressable
              onPressIn={() => animateScale(startBtnAnimScale, 0.95)}
              onPressOut={() => animateScale(startBtnAnimScale, 1, true)}
              onPress={handleStartWorkout}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <Animated.View style={[styles.startBtn, { backgroundColor: colors.floatBtn, shadowColor: colors.floatBtn, transform: [{ scale: startBtnAnimScale }] }]}>
                <Text style={styles.startBtnText}>開始</Text>
              </Animated.View>
            </Pressable>
          </View>
        )}
      </View>

      {/* 右上角懸浮下拉彈出選單 */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {userCustomLists.length > 0 ? (
                userCustomLists.map((list) => (
                  <View key={list.id}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => handleSelectTargetList(list)}
                    >
                      <Text style={styles.menuItemText}>{list.title}</Text>
                    </Pressable>
                    <View style={{ height: 16, backgroundColor: 'transparent' }} />
                  </View>
                ))
              ) : (
                <View style={styles.noListPlaceholder}>
                  <Text style={styles.noListText}>尚無自創清單</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={handleCreateNewList}
            >
              <Text style={[styles.menuItemText, styles.createNewText]}>建立新的清單...</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  headerWrapper: { backgroundColor: THEME_COLOR, height: 80, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headText: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingVertical: 10 },

  // 保持卡片感視覺，同時移除原本壓扁的寬度，交由外層 Animated 完美延展
  actionListItem: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginVertical: 8,
    paddingVertical: 25,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoArea: { flex: 1, justifyContent: 'space-between' },
  heartContainerOuter: { width: 40, height: 40, marginBottom: 5 },
  heartBtn: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  textGroup: { marginBottom: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  actionDesc: { fontSize: 14, color: '#777', marginTop: 4 },
  timeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  imageContainer: { width: 110, height: 110, backgroundColor: 'transparent', marginLeft: 15, overflow: 'hidden', borderRadius: 8 },
  actionImage: { width: '100%', height: '100%' },
  emptyContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60 },
  emptyView: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '500' },
  bottomContainer: {
    position: 'absolute', bottom: 0, width: '100%', height: 110,
    alignItems: 'center', justifyContent: 'center',
    paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
    zIndex: 9999,
  },
  startBtn: {
    width: '88%',
    height: 56,
    backgroundColor: BUTTON_COLOR,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: BUTTON_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  startBtnText: { fontSize: 20, fontWeight: '700', color: '#000', letterSpacing: 3 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 130,
    right: 20,
    width: 200,
    maxHeight: 450,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  menuItem: {
    width: '100%',
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginLeft: 25,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#D1D1D1',
    marginTop: 4,
    marginBottom: 16,
    marginHorizontal: 6,
  },
  createNewText: {
    fontWeight: '600',
    color: '#333',
  },
  noListPlaceholder: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  noListText: {
    fontSize: 14,
    color: '#999',
  }
});