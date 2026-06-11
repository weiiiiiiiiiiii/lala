import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ALL_STRETCHES } from './stretchData';
import useListStore from '../store/useListStore';
import { useTheme } from '../context/ThemeContext';

import TurnBackIcon from '../assets/images/TurnBack.svg';
import PlusIcon from '../assets/images/Plus.svg';

const { width } = Dimensions.get('window');

// ==========================================
// 統一更換為新版深夜藍灰配色變數
// ==========================================
const THEME_COLOR = '#2D3A48';      // Header 與 標題小槓主色
const PAGE_BG = '#838D95';         // 下方區塊主要背景色
const BUBBLE_BG = '#626C72';       // 說明欄內部背景色

export default function ActionDetail({ actionId, parentTitle, onBack }) {
  const { colors } = useTheme();
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];
  const addActionToSpecificList = useListStore((state) => state.addActionToSpecificList);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // ==========================================
  // 【方案 A】Header 按鈕專屬動態核心
  // ==========================================
  const backAnimScale = useRef(new Animated.Value(1)).current;
  const plusAnimScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  let actionData;
  if (parentTitle === '喜愛清單') {
    actionData = favorites.find(item => item.id === actionId);
  } else {
    actionData = ALL_STRETCHES[parentTitle]?.find(item => item.id === actionId);
  }

  if (!actionData) {
    for (const key in ALL_STRETCHES) {
      const found = ALL_STRETCHES[key].find(item => item.id === actionId);
      if (found) {
        actionData = found;
        break;
      }
    }
  }

  const handleAddActionPress = () => {
    if (!actionData) return;
    setIsMenuVisible(true);
  };

  const handleSelectTargetList = (targetList) => {
    setIsMenuVisible(false);
    if (!addActionToSpecificList) return;

    const isSuccess = addActionToSpecificList(targetList.id, actionData);

    if (isSuccess) {
      Alert.alert('成功', `已將「${actionData.name}」成功加入 ${targetList.title || '未命名清單'}！`);
    } else {
      Alert.alert('系統提示', `動作已在該清單`);
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
            
            const uniqueNewAction = {
              ...actionData,
              id: `${actionData.id}_bulk_${Date.now()}_0_${Math.floor(Math.random() * 100)}`
            };

            const addList = useListStore.getState().addList;
            if (addList) {
              addList(text.trim(), [uniqueNewAction]);
              Alert.alert('成功', `已建立「${text.trim()}」並成功匯入動作！`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const validLists = myLists.filter(list => !list.id.toString().startsWith('rec_'));

  if (!actionData) return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.darkNavy }]}>
      <View style={[styles.headerWrapper, { backgroundColor: colors.darkNavy }]}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <TurnBackIcon width={24} height={24} stroke="#fff" color="#fff" />
          </Pressable>
          <Text style={styles.headText}>找不到資料</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center' }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>動作 ID: {actionId} 找不到資料</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.darkNavy }]} edges={['top']}>
      <StatusBar style="light" />

      {/* 1. 固定 Header */}
      <View style={[styles.headerWrapper, { backgroundColor: colors.darkNavy }]}>
        <View style={styles.header}>
          {/* 【方案 A】返回鍵 Q彈化 */}
          <Pressable 
            onPressIn={() => animateScale(backAnimScale, 0.92)}
            onPressOut={() => animateScale(backAnimScale, 1, true)}
            onPress={onBack} 
          >
            <Animated.View style={[styles.iconButton, { transform: [{ scale: backAnimScale }] }]}>
              <TurnBackIcon width={20} height={20} stroke="#fff" color="#fff" />
            </Animated.View>
          </Pressable>

          <Text style={styles.headText}>{actionData.name}</Text>
          
          {/* 【方案 A】加號鍵 Q彈化 */}
          <Pressable 
            onPressIn={() => animateScale(plusAnimScale, 0.92)}
            onPressOut={() => animateScale(plusAnimScale, 1, true)}
            onPress={handleAddActionPress} 
          >
            <Animated.View style={[styles.iconButton, { transform: [{ scale: plusAnimScale }] }]}>
              <PlusIcon width={16} height={16} stroke="#fff" color="#fff" />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* 2. 固定圖片區域：保持精準純白背景 */}
        <View style={styles.imageSection}>
          {actionData.img ? (
            <Image 
              source={actionData.img} 
              style={styles.mainImage} 
              resizeMode="contain" 
            />
          ) : (
            <Text style={{ color: '#999' }}>暫無動作圖片</Text>
          )}
        </View>

        {/* 3. 獨立捲動內容區塊：背景完全與設計圖同步翻新 */}
        <View style={[styles.contentWrapper, { backgroundColor: colors.headerBg }]}>
          <ScrollView 
            style={styles.contentScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInside}
          >
            {/* 動作步驟 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.indicator, { backgroundColor: colors.darkNavy }]} />
                <Text style={styles.sectionTitle}>動作步驟</Text>
              </View>
              <View style={[styles.textBubble, { backgroundColor: colors.contentBg }]}>
                <Text style={styles.contentText}>{actionData.steps || "暫無詳細說明"}</Text>
              </View>
            </View>

            {/* 注意事項 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.indicator, { backgroundColor: colors.darkNavy }]} />
                <Text style={styles.sectionTitle}>注意事項</Text>
              </View>
              <View style={[styles.textBubble, { backgroundColor: colors.contentBg }]}>
                <Text style={styles.contentText}>{actionData.notice || "請保持呼吸，若感疼痛請停止。"}</Text>
              </View>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
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
              {validLists.length > 0 ? (
                validLists.map((list) => (
                  <View key={list.id}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => handleSelectTargetList(list)}
                    >
                      <Text style={styles.menuItemText}>
                        {list.title || '未命名清單'}
                      </Text>
                    </Pressable>
                    <View style={{ height: 16, backgroundColor: 'transparent' }} />
                  </View>
                ))
              ) : (
                <View style={styles.noListPlaceholder}>
                  <Text style={styles.noListText}>尚無可用清單</Text>
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
  headerWrapper: { backgroundColor: THEME_COLOR, height: 80, justifyContent: 'center', zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  
  // M3 規格圓形 IconButton
  iconButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.12)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headText: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }, 
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  imageSection: { width: '100%', height: 410, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1 },
  mainImage: { width: '100%', height: '100%' },
  
  // ==========================================
  // 【顏色翻新】大圓角浮層背景，完美與設計圖同步改為 838D95
  // ==========================================
  contentWrapper: {
    flex: 1, 
    backgroundColor: PAGE_BG, // 變更為 838D95
    marginTop: -10, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 8,
    zIndex: 5, 
    overflow: 'hidden', 
  },
  contentScroll: { flex: 1 },
  scrollInside: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 20 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  
  // 旁邊的垂直短槓顏色改為 2D3A48 主色
  indicator: { width: 4, height: 20, backgroundColor: THEME_COLOR, marginRight: 10, borderRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  
  // ==========================================
  // 【顏色翻新】說明欄內框背景改為 626C72
  // ==========================================
  textBubble: { 
    backgroundColor: BUBBLE_BG, // 變更為 626C72
    padding: 20, 
    borderRadius: 18 
  },
  // 將說明的內文文字顏色改為高清晰的純白色
  contentText: { fontSize: 15, color: '#fff', lineHeight: 26, fontWeight: '500' },

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
    zIndex: 9999,
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