import React, { useState } from 'react'; 
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D'; 


const initialActionList = [
  { id: '1', name: '靠牆轉身拉伸', time: '00:30', detail: '單手撐牆，身體向反方向轉', isFavorite: false },
  { id: '2', name: '背手下壓', time: '00:30', detail: '雙手在背後互扣，手心向下延伸', isFavorite: false },
  { id: '3', name: '手臂外旋拉伸', time: '00:30', detail: '預留動作描述空間...', isFavorite: false },
];

export default function LalaDetail({ title, onBack }) {
  // 使用 useState 管理動作列表狀態，以便控制愛心
  const [actionList, setActionList] = useState(initialActionList);

  //處理點擊愛心的函式
  const handleToggleFavorite = (id, currentFavoriteState) => {
    setActionList(prevList => 
      prevList.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );

    // 預留功能空間：這裡是之後呼叫後端 API 或更新本地喜愛清單資料的地方
    if (!currentFavoriteState) {
      // 這裡是原本沒有喜愛，點擊後「加入喜愛」的邏輯
      // console.log(`動作 ID ${id} 已加入喜愛清單`);
      // Alert.alert('提示', '已加入喜愛動作'); // 可以在這裡加上系統提示，目前先註解掉
    } else {
      // 這裡是原本已喜愛，點擊後「取消喜愛」的邏輯
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {actionList.map((item) => (
            <View key={item.id} style={styles.actionListItem}>
              <View style={styles.infoArea}>
                <Pressable 
                  style={styles.heartBtn} 
                  onPress={() => handleToggleFavorite(item.id, item.isFavorite)}
                >
                  {/* 根據 isFavorite 狀態顯示不同 SVG */}
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

              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>圖片預留位置</Text>
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
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
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
  imagePlaceholder: {
    width: 110,
    height: 110,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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