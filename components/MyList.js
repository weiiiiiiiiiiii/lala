import React, { useState, useRef, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet, Alert, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useListStore from '../store/useListStore';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../config/firebase';


// 引入自訂 SVG 圖示
import TurnBackIcon from '../assets/images/TurnBack.svg';
import PlusIcon from '../assets/images/Plus.svg';

const { width } = Dimensions.get('window');

// ==========================================
// 統一更換為新版深夜藍灰配色變數
// ==========================================
const THEME_COLOR = '#2D3A48';       // Header 與 摺疊文字主色
const PAGE_BG = '#838D95';          // 主要大背景色
const FLOAT_BTN_COLOR = '#7F8CDA';  // 右下角懸浮加號按鈕色

// 引入 3 張去背小人圖片
const SMALL_GUY_1 = require('../assets/images/SmallGuys/SmallGuy1.png');
const SMALL_GUY_2 = require('../assets/images/SmallGuys/SmallGuy2.png');
const SMALL_GUY_3 = require('../assets/images/SmallGuys/SmallGuy3.png');

// 根據 index 動態計算並輪流對應小人圖片 (1 -> 2 -> 3 -> 1)
const getSmallGuyImage = (index) => {
  const modulo = index % 3;
  if (modulo === 0) return SMALL_GUY_1;
  if (modulo === 1) return SMALL_GUY_2;
  return SMALL_GUY_3;
};

const recommend = [
  {
    id: 'rec_full_body',
    name: '全身伸展',
    actions: [
      { id: 'm2', name: '眼鏡蛇式', detail: '骨盆保持貼地。', time: '00:30', img: null },
      { id: 'm3', name: '鳥犬式', detail: '專注於身體的平衡。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_upper_limb',
    name: '上肢伸展',
    actions: [
      { id: 'b2', name: '背手下壓', detail: '過程中保持挺胸。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_back',
    name: '背部伸展',
    actions: [
      { id: 'l1', name: '貓式伸展', detail: '動作隨著呼吸頻率。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_lower_limb',
    name: '下肢伸展',
    actions: [
      { id: 'f2', name: '反手撐地', detail: '手肘微彎避免鎖死。', time: '00:30', img: null }
    ]
  },
];

// ==========================================
// 【方案 A 核心】通用的 Q 彈微互動封裝組件
// ==========================================
const AnimatedPressable = ({ children, style, onPress, onLongPress, scaleTo = 0.96 }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleValue, { toValue: scaleTo, duration: 100, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} onLongPress={onLongPress} style={{ width: '100%' }}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function MyList() {
  const router = useRouter();
  const { colors } = useTheme();
  const [recommendItem] = useState(recommend);
  const settings = useListStore((state) => state.settings);

  const [isLogin, setIsLogin] = useState(!!auth.currentUser);
  useEffect(() => {
    const unLogin = auth.onAuthStateChanged((user) => {
      setIsLogin(!!user);
    });
    return unLogin;
  }, []);

  const favorites = useListStore((state) => state.favorites) || [];
  const displayFavorites = isLogin ? favorites : [];

  const calculateDuration = (actions) => {
    if (!actions || actions.length === 0) return '約0秒';
    const parseT = (str, fallback) => {
      const parts = (str || '').split(':');
      if (parts.length === 2) {
        const t = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        return t > 0 ? t : fallback;
      }
      return fallback;
    };
    const defaultSec = parseT(settings?.defaultWorkoutTime, 30);
    const restSec = parseT(settings?.restTime, 15);
    let total = 0;
    actions.forEach(act => { total += parseT(act.time, defaultSec); });
    total += Math.max(0, actions.length - 1) * restSec;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (mins === 0) return `約${secs}秒`;
    if (secs === 0) return `約${mins}分鐘`;
    return `約${mins}分${secs}秒`;
  };
  const myLists = useListStore((state) => state.myLists) || [];
  const removeList = useListStore((state) => state.removeList);

  // 摺疊控制
  const [isShow, showed] = useState(true);
  const [isMyShow, Myshowed] = useState(true);

  const userCustomLists = isLogin ? myLists.filter(list => !list.id.toString().startsWith('rec_')) : [];

  const handlongPress = (id, title) => {
    Alert.alert(
      '刪除清單',
      `確定要刪除「${title}」清單嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => removeList(id) },
      ]
    );
  };

  const handleCreate = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('尚未登入', '請先進行登入作業');
      return;
    }
    router.push('/create');
  }


  // ==========================================
  // 【方案 A】非列表按鈕的專屬動態控制
  // ==========================================
  const recArrowScale = useRef(new Animated.Value(1)).current;
  const myArrowScale = useRef(new Animated.Value(1)).current;
  const plusBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  // 渲染統一大卡片的內部佈局
  const renderCardContent = (titleText, actions, imageSource) => (
    <>
      <View style={styles.cardLeftContent}>
        <Text style={styles.cardMainTitle}>{titleText}</Text>
        <Text style={styles.cardSubData}>{actions.length}項</Text>
        <Text style={styles.cardSubData}>{calculateDuration(actions)}</Text>
      </View>
      <View style={styles.cardRightImageContainer}>
        <Image source={imageSource} style={styles.guyImage} resizeMode="contain" />
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.darkNavy }]} edges={['top']}>
      <StatusBar style="light" />

      {/* 1. Header */}
      <View style={[styles.header, { backgroundColor: colors.darkNavy }]}>
        <Text style={styles.headText}>我的清單</Text>
      </View>

      {/* 2. 內容主要區塊 */}
      <View style={[styles.mainContentArea, { backgroundColor: colors.headerBg }]}>
        <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
          <View style={styles.listCon}>

            {/* 【喜愛清單卡片】 */}
            <View style={styles.categoryBlock}>
              <Text style={styles.sectionHeaderLabel}>喜愛</Text>
              <AnimatedPressable
                style={styles.modernContentCard}
                onPress={() => {
                  router.push({
                    pathname: '/exerciseDetail',
                    params: { name_zh: '喜愛清單', mode: 'favorites' }
                  });
                }}
              >
                {renderCardContent('喜愛動作', favorites, SMALL_GUY_1)}
              </AnimatedPressable>
            </View>

            {/* 【推薦清單區塊】 */}
            <View style={styles.categoryBlock}>
              <View style={styles.foldHeader}>
                <Text style={styles.sectionHeaderLabel}>推薦</Text>
                <Pressable
                  onPressIn={() => animateScale(recArrowScale, 0.8)}
                  onPressOut={() => animateScale(recArrowScale, 1, true)}
                  onPress={() => showed(!isShow)}
                >
                  <Animated.View style={{ transform: [{ scale: recArrowScale }, { rotate: isShow ? '0deg' : '180deg' }] }}>
                    <TurnBackIcon width={24} height={24} stroke="#fff" color="#fff" style={styles.arrowRotated} />
                  </Animated.View>
                </Pressable>
              </View>

              {isShow && (
                <View style={styles.cardGridGap}>
                  {recommendItem.map((item, index) => (
                    <AnimatedPressable
                      key={item.id}
                      style={styles.modernContentCard}
                      onPress={() => {
                        router.push({
                          pathname: '/exerciseDetail',
                          params: { name_zh: item.name, mode: 'recommend', id: item.id }
                        });
                      }}
                    >
                      {renderCardContent(item.name, item.actions, getSmallGuyImage(index))}
                    </AnimatedPressable>
                  ))}
                </View>
              )}
            </View>

            {/* 【我的自訂清單區塊】 */}
            <View style={styles.categoryBlock}>
              <View style={styles.foldHeader}>
                <Text style={styles.sectionHeaderLabel}>我的</Text>
                <Pressable
                  onPressIn={() => animateScale(myArrowScale, 0.8)}
                  onPressOut={() => animateScale(myArrowScale, 1, true)}
                  onPress={() => Myshowed(!isMyShow)}
                >
                  <Animated.View style={{ transform: [{ scale: myArrowScale }, { rotate: isMyShow ? '0deg' : '180deg' }] }}>
                    <TurnBackIcon width={24} height={24} stroke="#fff" color="#fff" style={styles.arrowRotated} />
                  </Animated.View>
                </Pressable>
              </View>

              {isMyShow && (
                <View style={styles.cardGridGap}>
                  {userCustomLists.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.alertText}>點擊下方 + 建立你的清單</Text>
                    </View>
                  ) : (
                    userCustomLists.map((item, index) => (
                      <AnimatedPressable
                        key={item.id}
                        style={styles.modernContentCard}
                        onPress={() => {
                          router.push({
                            pathname: '/emptyList',
                            params: { id: item.id, name: item.title }
                          });
                        }}
                        onLongPress={() => handlongPress(item.id, item.title)}
                      >
                        {renderCardContent(item.title, item.actions || [], getSmallGuyImage(index))}
                      </AnimatedPressable>
                    ))
                  )}
                </View>
              )}
            </View>

          </View>
          {/* 優化：稍微增加底部留白距離，避免最後一張卡片被浮動按鈕大範圍遮擋 */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* 3. 【方案 A】右下角加號按鈕微互動升級 */}
      <Pressable
        onPressIn={() => animateScale(plusBtnScale, 0.9)}
        onPressOut={() => animateScale(plusBtnScale, 1, true)}
        onPress={handleCreate}
        style={styles.floatingBtnWrapper}
      >
        <Animated.View style={[styles.btn, { backgroundColor: colors.floatBtn, transform: [{ scale: plusBtnScale }] }]}>
          <PlusIcon width={32} height={32} stroke={'#000'} strokeWidth={2.5} fill="none" />
        </Animated.View>
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLOR },
  header: { height: 80, backgroundColor: THEME_COLOR, alignItems: 'center', justifyContent: 'center' },
  headText: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  mainContentArea: { flex: 1, backgroundColor: PAGE_BG },
  scrollInner: { flexGrow: 1 },
  listCon: { paddingVertical: 30, paddingHorizontal: 16 },

  categoryBlock: { marginBottom: 20 },
  foldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  sectionHeaderLabel: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 15 },

  arrowRotated: { transform: [{ rotate: '-90deg' }] },
  cardGridGap: { gap: 12, width: '100%' },

  modernContentCard: {
    width: '100%',
    height: 115,
    backgroundColor: '#FFF',
    borderRadius: 24,
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    marginValue: 4,
  },
  cardLeftContent: { flex: 1, justifyContent: 'center' },
  cardMainTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 6 },
  cardSubData: { fontSize: 12, color: '#666', fontWeight: '600', marginTop: 1 },

  cardRightImageContainer: { width: 100, height: '100%', justifyContent: 'center', alignItems: 'center' },
  guyImage: { width: '100%', height: '90%' },

  // ==========================================
  // 【關鍵修正】提升 zIndex 層級、並向上挪移拉高底距，徹底免於導覽列遮擋
  // ==========================================
  floatingBtnWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 150, // 從 30 大幅拉高到 90，完美浮在 TabBar 上方！
    zIndex: 99999, // 提高層級，確保百分之百霸氣穿透並蓋在導覽列最上層
  },
  btn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: FLOAT_BTN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  emptyContainer: { width: '100%', paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  alertText: { fontSize: 15, color: '#DDD', fontWeight: '600', letterSpacing: 0.5 }
});