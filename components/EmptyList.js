import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert, LayoutAnimation, Platform, UIManager, Modal, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

// 引入全域 Store
import useListStore from '../store/useListStore';

// 引入全套萬能控色版 SVG 圖示
import TurnBackIcon from '../assets/images/TurnBack.svg';
import EditIcon  from '../assets/images/pencil_icon.svg';
import CheckIcon from '../assets/images/OK_icon.svg';
import TrashIcon from '../assets/images/Trash.svg';
import PlusTimeIcon from '../assets/images/PlusTime.svg';
import MinusTimeIcon from '../assets/images/MinusTime.svg';

const { width } = Dimensions.get('window');

// 統一主視覺配色
const THEME_COLOR = '#2D3A48';      // Header 主色
const BUTTON_COLOR = '#7F8CDA';     // 開始大按鈕色

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ==========================================
// 【方案 A 通用組件】複製自 LalaDetail 專用獨立封裝動畫 Pressable 元件
// ==========================================
const AnimatedPressable = ({ children, style, onPress, onLongPress, disabled, scaleTo = 0.97 }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.timing(scaleValue, { toValue: scaleTo, duration: 100, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(scaleValue, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Pressable 
      onPressIn={onPressIn} 
      onPressOut={onPressOut} 
      onPress={onPress} 
      onLongPress={onLongPress}
      delayLongPress={400}
      disabled={disabled}
      style={{ width: '100%' }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function EmptyList() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id, name } = useLocalSearchParams();
  const defaultWorkoutTime = useListStore((state) => state.settings?.defaultWorkoutTime || '00:30');

  const myLists = useListStore((state) => state.myLists) || [];
  const deleteActionFromList = useListStore((state) => state.deleteActionFromList);
  const favorites = useListStore((state) => state.favorites) || [];
  const addActionsToList = useListStore((state) => state.addActionsToList);
  const updateActionTimeInList = useListStore((state) => state.updateActionTimeInList);

  const currentList = myLists.find(list => list.id.toString() === id?.toString());

  const [actionsList, setActionsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentSeconds, setCurrentSeconds] = useState(30);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [tempSelectedActions, setTempSelectedActions] = useState([]);

  // Header 按鈕專屬微互動控制（比照 LalaDetail 動態核心）
  const backArrowScale = useRef(new Animated.Value(1)).current;
  const editBtnScale = useRef(new Animated.Value(1)).current;
  const startBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    if (currentList && currentList.actions) {
      setActionsList(currentList.actions);
    } else {
      setActionsList([]); 
    }
  }, [currentList, myLists]);

  const timeStringToSeconds = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 30;
    const [min, sec] = timeStr.split(':').map(Number);
    return (min * 60) + sec;
  };

  const secondsToTimeString = (secs) => {
    const min = Math.floor(secs / 60).toString().padStart(2, '0');
    const sec = (secs % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleActionPress = (item) => {
    if (isEditing) return;
    let originalId = item.id.toString();
    if (originalId.includes('_custom_')) {
      originalId = originalId.split('_custom_')[0];
    } else if (originalId.includes('_bulk_')) {
      originalId = originalId.split('_bulk_')[0];
    }

    router.push({
      pathname: '/actionPage',
      params: {
        actionId: originalId, 
        parentTitle: name || currentList?.title || '當前清單'
      }
    });
  };

  const handleLongPressAction = (item) => {
    if (isEditing) return; 
    setSelectedAction(item);
    setCurrentSeconds(timeStringToSeconds(item.time));
    setIsModalVisible(true);
  };

  const handleSaveTime = () => {
    if (!selectedAction) return;
    const targetListId = currentList?.id || id;
    if (!targetListId) return;

    const newTimeStr = secondsToTimeString(currentSeconds);
    setActionsList(prev => prev.map(act =>
      act.id === selectedAction.id ? { ...act, time: newTimeStr } : act
    ));

    if (updateActionTimeInList) {
      updateActionTimeInList(targetListId, selectedAction.id, newTimeStr);
    }
    setIsModalVisible(false);
  };

  const handleDeleteAction = (actionId, actionName, index) => {
    Alert.alert('刪除動作', `確定要從清單移除 ${actionName} 嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          const targetListId = currentList?.id || id;
          const updatedActions = actionsList.filter((_, i) => i !== index);
          setActionsList(updatedActions);

          if (deleteActionFromList && targetListId) {
            deleteActionFromList(targetListId, actionId);
          }

          const updateActionOrder = useListStore.getState().updateActionOrder;
          if (updateActionOrder && targetListId) {
            updateActionOrder(targetListId, updatedActions);
          }
        }
      }
    ]);
  };

  const handleMoveAction = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === actionsList.length - 1) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newList = [...actionsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setActionsList(newList);

    const targetListId = currentList?.id || id;
    const updateActionOrder = useListStore.getState().updateActionOrder;
    if (updateActionOrder && targetListId) {
      updateActionOrder(targetListId, newList);
    }
  };

  const backList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/list');
    }
  };

  const handleStartWorkout = async () => {
    if (actionsList.length === 0) return;
    try {
      const ScreenOrientation = require('expo-screen-orientation');
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      console.log('⚠️ 轉橫屏失敗', e);
    }
    setTimeout(() => {
      router.push({
        pathname: '/workoutPlayer',
        params: {
          listTitle: name || currentList?.title || '清單',
          actionsData: JSON.stringify(actionsList),
        },
      });
    }, 150);
  };

  const handleOpenAddModal = () => {
    if (isEditing) return;
    const existingNames = actionsList.map(a => a.name.trim());
    const availableFavorites = favorites.filter(fav => !existingNames.includes(fav.name.trim()));

    if (availableFavorites.length === 0) {
      Alert.alert('提示', '目前所有喜愛動作都已經在這份清單中囉！');
      return;
    }
    setTempSelectedActions([]); 
    setIsAddModalVisible(true);
  };

  const handleToggleSelectFav = (item) => {
    setTempSelectedActions(prev => {
      const isExist = prev.find(a => a.id === item.id);
      if (isExist) {
        return prev.filter(a => a.id !== item.id); 
      } else {
        return [...prev, item]; 
      }
    });
  };

  const handleConfirmAddActions = () => {
    if (tempSelectedActions.length === 0) {
      setIsAddModalVisible(false);
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const targetListId = currentList?.id || id;
    const uniqueNewActions = tempSelectedActions.map((act, idx) => ({
      ...act,
      id: `${act.id}_custom_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`
    }));

    setActionsList(prev => [...prev, ...uniqueNewActions]);

    if (targetListId) {
      const storeState = useListStore.getState();
      const listsInStore = storeState.myLists || [];
      const isListExistInStore = listsInStore.some(l => l.id.toString() === targetListId.toString());

      if (isListExistInStore) {
        if (addActionsToList) {
          addActionsToList(targetListId, uniqueNewActions);
        }
      } else {
        useListStore.setState({
          myLists: [
            ...listsInStore,
            { id: targetListId, title: name || '新清單', actions: uniqueNewActions }
          ]
        });
      }
    }
    setIsAddModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.darkNavy }]} edges={['top']}>
      <StatusBar style="light" />

      {/* Header 區塊：完全複製自 LalaDetail */}
      <View style={[styles.headerWrapper, { backgroundColor: colors.darkNavy }]}>
        <View style={styles.header}>
          <Pressable 
            onPressIn={() => animateScale(backArrowScale, 0.92)}
            onPressOut={() => animateScale(backArrowScale, 1, true)}
            onPress={backList}
          >
            <Animated.View style={[styles.backButton, { transform: [{ scale: backArrowScale }] }]}>
              <TurnBackIcon width={20} height={20} stroke="#fff" color="#fff" />
            </Animated.View>
          </Pressable>

          <Text style={styles.headText}>{name || currentList?.title || '清單名字'}</Text>
          
          <Pressable 
            onPressIn={() => animateScale(editBtnScale, 0.92)}
            onPressOut={() => animateScale(editBtnScale, 1, true)}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Animated.View style={[styles.rightHeaderButton, { transform: [{ scale: editBtnScale }] }]}>
              {isEditing ? (
                <CheckIcon width={20} height={20} stroke="#fff" color="#fff" />
              ) : (
                <EditIcon width={20} height={20} stroke="#fff" color="#fff" />
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            actionsList.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
        >
          {actionsList.length > 0 ? (
            actionsList.map((item, index) => (
              /* 【完全複製 LalaDetail】大卡片與外層動畫佈局 */
              <AnimatedPressable
                key={item.id || index}
                style={styles.actionListItem}
                onPress={() => handleActionPress(item)}
                onLongPress={() => handleLongPressAction(item)}
                disabled={isEditing}
                scaleTo={0.97}
              >
                {/* 編輯模式：左側秀出圓潤的 M3 上下排序鍵 */}
                {isEditing && (
                  <View style={styles.arrowControlsColumn}>
                    <Pressable
                      onPress={() => handleMoveAction(index, 'up')}
                      disabled={index === 0}
                      style={[styles.arrowButton, index === 0 && styles.disabledArrow]}
                    >
                      <Text style={styles.arrowButtonText}>▲</Text>
                    </Pressable>
                    
                    <Pressable
                      onPress={() => handleMoveAction(index, 'down')}
                      disabled={index === actionsList.length - 1}
                      style={[styles.arrowButton, index === actionsList.length - 1 && styles.disabledArrow]}
                    >
                      <Text style={styles.arrowButtonText}>▼</Text>
                    </Pressable>
                  </View>
                )}

                {/* 卡片中間與右側佈局 */}
                <View style={styles.infoArea}>
                  <View style={styles.textGroup}>
                    <Text style={styles.actionTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.actionDesc} numberOfLines={2}>{item.detail}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time || defaultWorkoutTime}</Text>
                </View>

                <View style={styles.rightContentSection}>
                  <View style={styles.imageContainer}>
                    {item.img ? (
                      <Image source={item.img} style={styles.actionImage} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 12, color: '#999' }}>無圖</Text>
                    )}
                  </View>

                  {/* 編輯模式：右側垃圾桶 */}
                  {isEditing && (
                    <Pressable onPress={() => handleDeleteAction(item.id, item.name, index)} style={styles.innerTrashWrapper}>
                      <TrashIcon width={22} height={22} stroke="#C91B1B" color="#C91B1B" />
                    </Pressable>
                  )}
                </View>
              </AnimatedPressable>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>目前沒有運動項目在此清單</Text>
            </View>
          )}

          {/* 「+ 喜愛動作」微調為匹配排版 */}
          <Pressable style={styles.addActionButton} onPress={handleOpenAddModal}>
            <Text style={styles.addActionText}>+ 喜愛動作</Text>
          </Pressable>

          <View style={{ height: actionsList.length > 0 ? 140 : 20 }} />
        </ScrollView>

        {/* 底部大「開始」按鈕：完全與 LalaDetail 鏡像拷貝 */}
        <View style={styles.bottomContainer}>
          <Pressable 
            onPressIn={() => animateScale(startBtnScale, 0.95)}
            onPressOut={() => animateScale(startBtnScale, 1, true)}
            onPress={handleStartWorkout}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <Animated.View style={[styles.startBtn, { backgroundColor: colors.floatBtn, shadowColor: colors.floatBtn, transform: [{ scale: startBtnScale }] }]}>
              <Text style={styles.startBtnText}>開始</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* 時間微調 Modal */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalImageContainer}>
              {selectedAction?.img ? (
                <Image source={selectedAction.img} style={styles.modalImage} resizeMode="cover" />
              ) : (
                <Text style={{ color: '#999' }}>無圖</Text>
              )}
            </View>

            <View style={styles.counterRow}>
              <Pressable onPress={() => setCurrentSeconds(prev => Math.max(5, prev - 5))}>
                <MinusTimeIcon width={36} height={36} />
              </Pressable>
              <Text style={styles.modalTimeText}>{secondsToTimeString(currentSeconds)}</Text>
              <Pressable onPress={() => setCurrentSeconds(prev => prev + 5)}>
                <PlusTimeIcon width={36} height={36} />
              </Pressable>
            </View>

            <Pressable style={styles.resetBtn} onPress={() => setCurrentSeconds(30)}>
              <Text style={styles.resetBtnText}>恢復預設</Text>
            </Pressable>

            <Pressable style={styles.modalSaveBtn} onPress={handleSaveTime}>
              <Text style={styles.modalSaveBtnText}>SAVE</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 選擇喜愛動作 Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalFullContainer}>
          <Text style={styles.modalTitle}>選擇喜愛動作</Text>
          <FlatList
            data={favorites.filter(fav => !actionsList.some(act => act.name.trim() === fav.name.trim()))}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => {
              const isSelected = tempSelectedActions.find(a => a.id === item.id);
              return (
                <Pressable style={[styles.actionItem, isSelected && styles.selectedItem]} onPress={() => handleToggleSelectFav(item)}>
                  <Text style={styles.actionName}>{item.name}</Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>
              );
            }}
          />
          <Pressable style={[styles.confirmButton, { backgroundColor: colors.floatBtn }]} onPress={handleConfirmAddActions}>
            <Text style={styles.buttonText}>確認選取</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  
  // ==========================================
  // 【一體化對齊】完全移植自 LalaDetail 的 Header 規格
  // ==========================================
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
  
  // ==========================================
  // 【一體化對齊】完全複製 LalaDetail 的動作列表卡片比例
  // ==========================================
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
    alignItems: 'center',
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardInnerPressable: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  
  // 安全箭頭微幾何按鈕列
  arrowControlsColumn: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: 12, gap: 4 },
  arrowButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center' },
  arrowButtonText: { fontSize: 11, color: '#444', fontWeight: 'bold' },
  disabledArrow: { opacity: 0.2 },

  infoArea: { flex: 1, justifyContent: 'space-between' },
  textGroup: { marginBottom: 15, paddingRight: 10 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  actionDesc: { fontSize: 14, color: '#777', marginTop: 4 },
  timeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  
  rightContentSection: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: { width: 110, height: 110, backgroundColor: 'transparent', marginLeft: 15, overflow: 'hidden', borderRadius: 8 }, 
  actionImage: { width: '100%', height: '100%' },
  innerTrashWrapper: { width: 40, height: 110, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  emptyContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60 },
  emptyView: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '500' },
  
  addActionButton: { backgroundColor: '#E0E0E0', height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 24, alignSelf: 'center', paddingHorizontal: 30 },
  addActionText: { fontSize: 15, fontWeight: '700', color: '#333' },
  
  // ==========================================
  // 【一體化對齊】完全複製 LalaDetail 的置底開始鍵大底座與按鈕
  // ==========================================
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: width * 0.82, backgroundColor: '#FFF', borderRadius: 28, paddingVertical: 35, paddingHorizontal: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  modalImageContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  modalImage: { width: '100%', height: '100%' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 4 },
  modalTimeText: { fontSize: 32, fontWeight: 'bold', color: '#000', minWidth: 90, textAlign: 'center' },
  resetBtn: { paddingVertical: 6, marginBottom: 30 },
  resetBtnText: { fontSize: 14, color: '#999', fontWeight: '500' },
  modalSaveBtn: { width: '85%', height: 52, backgroundColor: '#D9D9D9', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  modalSaveBtnText: { fontSize: 18, fontWeight: 'bold', color: '#000', letterSpacing: 1 },
  buttonText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  modalFullContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  listPadding: { paddingBottom: 100 },
  actionItem: { padding: 20, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  selectedItem: { backgroundColor: '#E8F5E9' },
  actionName: { fontSize: 18 },
  checkMark: { color: '#2E7D32', fontWeight: 'bold', fontSize: 18 },
  confirmButton: { height: 60, backgroundColor: BUTTON_COLOR, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 30 }
});