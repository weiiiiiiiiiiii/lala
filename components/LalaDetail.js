import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 匯入你的自訂 SVG
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';
// 匯入剛才建立的資料檔案
import { ALL_STRETCHES } from './stretchData';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function LalaDetail({ title, onBack }) {
  // 使用 useState 管理動作列表狀態
  const [actionList, setActionList] = useState([]);

  // 當組件掛載或 title 改變時，根據 title 抓取正確的動作清單
  useEffect(() => {
    const list = ALL_STRETCHES[title] || [];
    // 初始化時加上 isFavorite 欄位
    const listWithState = list.map(item => ({ ...item, isFavorite: false }));
    setActionList(listWithState);
  }, [title]);

  // 處理點擊愛心的函式
  const handleToggleFavorite = (id, currentFavoriteState) => {
    setActionList(prevList =>
      prevList.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );

    // 預留功能空間
    if (!currentFavoriteState) {
      // console.log(`動作 ID ${id} 已加入喜愛清單`);
    } else {
      // console.log(`動作 ID ${id} 已移除喜愛清單`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {actionList.map((item) => (
            <View key={item.id} style={styles.actionListItem}>
              <View style={styles.infoArea}>
                <Pressable
                  style={styles.heartBtn}
                  onPress={() => handleToggleFavorite(item.id, item.isFavorite)}
                >
                  {item.isFavorite ? (
                    <LoveIconActive width={24} height={24} />
                  ) : (
                    <LoveIcon width={24} height={24} />
                  )}
                </Pressable>

                <View style={styles.textGroup}>
                  <Text style={styles.actionTitle}>{item.name}</Text>
                  <Text style={styles.actionDesc}>{item.detail}</Text>
                </View>

                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <View style={styles.imageContainer}>
                {/* 渲染動作照片 */}
                <Image 
                  source={item.img} 
                  style={styles.actionImage} 
                  resizeMode="cover" 
                />
              </View>
            </View>
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              { opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Text style={styles.startBtnText}>開始</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLOR,
  },
  headerWrapper: {
    backgroundColor: THEME_COLOR,
    height: 95,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  actionListItem: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'space-between',
  },
  infoArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heartBtn: {
    marginBottom: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: {
    marginBottom: 15,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  actionDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    overflow: 'hidden', // 確保圖片圓角或邊界正確
  },
  actionImage: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  startBtn: {
    width: width * 0.85,
    height: 80,
    backgroundColor: '#B2F6B1',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startBtnText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
});