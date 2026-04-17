import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_STRETCHES } from './stretchData';
import useListStore from '../store/useListStore'; 

// 引入 SVG
import TurnBackIcon from '../assets/images/TurnBack.svg';
import PlusIcon from '../assets/images/Plus.svg';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function ActionDetail({ actionId, parentTitle, onBack }) {
  // 從 Store 取得喜愛清單
  const favorites = useListStore((state) => state.favorites) || [];

  // 資料尋找邏輯：處理從「一般部位」或「喜愛清單」進來的狀況
  let actionData;
  if (parentTitle === '喜愛清單') {
    actionData = favorites.find(item => item.id === actionId);
  } else {
    actionData = ALL_STRETCHES[parentTitle]?.find(item => item.id === actionId);
  }

  // 若找不到資料的防錯顯示
  if (!actionData) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <TurnBackIcon width={24} height={24} />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. 固定 Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{actionData.name}</Text>
          <Pressable onPress={() => {}} style={styles.iconButton}>
            <PlusIcon width={24} height={24} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* 2. 固定圖片區域：高度 400 */}
        <View style={styles.imageSection}>
          <Image 
            source={actionData.img} 
            style={styles.mainImage} 
            resizeMode="contain" 
          />
        </View>

        {/* 3. 獨立捲動內容區塊 */}
        <View style={styles.contentWrapper}>
          <ScrollView 
            style={styles.contentScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInside}
          >
            {/* 動作步驟 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>動作步驟</Text>
              </View>
              <View style={styles.textBubble}>
                <Text style={styles.contentText}>{actionData.steps || "暫無詳細說明"}</Text>
              </View>
            </View>

            {/* 注意事項 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>注意事項</Text>
              </View>
              <View style={styles.textBubble}>
                <Text style={styles.contentText}>{actionData.notice || "請保持呼吸，若感疼痛請停止。"}</Text>
              </View>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- 重新補齊樣式表 ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: THEME_COLOR 
  },
  headerWrapper: { 
    backgroundColor: THEME_COLOR, 
    height: 95, 
    justifyContent: 'center',
    zIndex: 10,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15 
  },
  iconButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageSection: { 
    width: '100%', 
    height: 400, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30,
    zIndex: 1,
  },
  mainImage: { 
    width: '100%', 
    height: '100%' 
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    elevation: 10,
    zIndex: 5,
    overflow: 'hidden', 
  },
  contentScroll: {
    flex: 1,
  },
  scrollInside: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
  },
  section: { 
    marginBottom: 35 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  indicator: { 
    width: 4, 
    height: 20, 
    backgroundColor: THEME_COLOR, 
    marginRight: 10, 
    borderRadius: 2 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  textBubble: { 
    backgroundColor: '#F7F7F7', 
    padding: 20, 
    borderRadius: 18 
  },
  contentText: { 
    fontSize: 16, 
    color: '#555', 
    lineHeight: 28,
  },
});