import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 引入自訂 SVG 圖示
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';

// 引入全域 Store 與 靜態資料
import useListStore from '../store/useListStore';
import { ALL_STRETCHES } from './stretchData';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function LalaDetail({ title, onBack }) {
  const router = useRouter();
  
  // 從 Store 取得全域愛心狀態與功能
  const toggleFavoriteStore = useListStore((state) => state.toggleFavorite);
  const favorites = useListStore((state) => state.favorites) || [];
  
  // 本地清單狀態
  const [actionList, setActionList] = useState([]);

  // 監聽標題與愛心清單變動，更新顯示內容
  useEffect(() => {
    if (title === '喜愛清單') {
      // 模式 A：顯示所有已收藏動作
      const listWithState = favorites.map(item => ({ ...item, isFavorite: true }));
      setActionList(listWithState);
    } else {
      // 模式 B：顯示特定部位動作，並比對是否已收藏
      const list = ALL_STRETCHES[title] || [];
      const listWithState = list.map(item => ({
        ...item,
        isFavorite: favorites.some(fav => fav.id === item.id)
      }));
      setActionList(listWithState);
    }
  }, [title, favorites]);

  // 處理愛心點擊與提示框
  const handleToggleFavorite = (item) => {
    const result = toggleFavoriteStore(item);
    if (result === 'added') {
      Alert.alert('提示', '已加入喜愛清單');
    } else {
      Alert.alert('提示', '已從喜愛清單移除');
    }
  };

  // 檢查特定動作是否為喜愛狀態（用於渲染圖示）
  const isItemFavorite = (id) => favorites.some(fav => fav.id === id);

  // 跳轉至詳細動作頁面 (app/actionPage.js)
  const handleOpenActionDetail = (item) => {
    router.push({
      pathname: '/actionPage',
      params: { 
        actionId: item.id, 
        parentTitle: title 
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {actionList.map((item) => (
            <Pressable
              key={item.id}
              style={styles.actionListItem}
              onPress={() => handleOpenActionDetail(item)}
            >
              <View style={styles.infoArea}>
                <Pressable
                  style={styles.heartBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item);
                  }}
                >
                  {isItemFavorite(item.id) ? (
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
                <Image 
                  source={item.img} 
                  style={styles.actionImage} 
                  resizeMode="cover" 
                />
              </View>
            </Pressable>
          ))}
          {/* 只有在非喜愛清單時才預留按鈕空間 */}
          <View style={{ height: title === '喜愛清單' ? 20 : 120 }} />
        </ScrollView>

        {/* 底部「開始」按鈕：喜愛清單頁面會隱藏 */}
        {title !== '喜愛清單' && (
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
        )}
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
    marginLeft: 15,
    overflow: 'hidden',
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