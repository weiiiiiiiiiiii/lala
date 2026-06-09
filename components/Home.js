import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  Pressable, Dimensions, Image, Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 

const { width, height } = Dimensions.get('window');

const categories = ["常用", "肩頸", "手臂", "胸部", "背部與腰部", "臀部", "下肢", "其他"];

const THEME_COLOR = '#2D3A48';       
const PAGE_BG = '#838D95';        
const CARD_CONTAINER_BG = '#424E58'; 

const bodyMainImages = {
  "常用": require('../assets/images/Body/Main.png'),
  "肩頸": require('../assets/images/Body/NeckShoulder.png'),
  "手臂": require('../assets/images/Body/Arms.png'),
  "胸部": require('../assets/images/Body/Chest.png'),
  "背部與腰部": require('../assets/images/Body/BackWaist.png'),
  "臀部": require('../assets/images/Body/Glutes.png'),
  "下肢": require('../assets/images/Body/LowerLimbs.png'),
  "其他": require('../assets/images/Body/Main.png'),
};

const bodyPartImages = {
  Neck: require('../assets/images/BodyPart/Neck.png'),
  Biceps: require('../assets/images/BodyPart/Biceps.png'),
  Calves: require('../assets/images/BodyPart/Calves.png'),
  Triceps: require('../assets/images/BodyPart/Triceps.png'),
  Forearms: require('../assets/images/BodyPart/Forearms.png'),
  Shoulders: require('../assets/images/BodyPart/Shoulders.png'),
  Pectorals: require('../assets/images/BodyPart/Pectorals.png'),
  Latissimus: require('../assets/images/BodyPart/Latissimus Dorsi.png'), 
  Lower: require('../assets/images/BodyPart/Lower Back.png'),
  Gluteus: require('../assets/images/BodyPart/Gluteus Maximus.png'),
  Piriformis: require('../assets/images/BodyPart/Piriformis.png'),
  Quads: require('../assets/images/BodyPart/Quads.png'),
  Hamstrings: require('../assets/images/BodyPart/Hamstrings.png'),
  Adductors: require('../assets/images/BodyPart/Adductors.png'),
  
  Morning: require('../assets/images/Common/Morning.png'),
  Sleep: require('../assets/images/Common/Sleep.png'),
  AfterRun: require('../assets/images/Common/AfterRun.png'),
};

const stretchData = {
  "常用": [
    { id: '1', name_zh: '頸部', name_en: '(Neck)', imageKey: 'Neck' },
    { id: '2', name_zh: '腿後腱/大腿後側', name_en: '(Hamstrings)', imageKey: 'Hamstrings' },
    { id: '3', name_zh: '早晨伸展', name_en: '', imageKey: 'Morning' },
    { id: '4', name_zh: '睡前伸展', name_en: '', imageKey: 'Sleep' },
  ],
  "手臂": [
    { id: '1-1', name_zh: '二頭肌', name_en: '(Biceps)', imageKey: 'Biceps' },
    { id: '1-2', name_zh: '三頭肌', name_en: '(Triceps)', imageKey: 'Triceps' },
    { id: '1-3', name_zh: '前臂', name_en: '(Forearms)', imageKey: 'Forearms' },
  ],
  "肩頸": [
    { id: '2-1', name_zh: '頸部', name_en: '(Neck)', imageKey: 'Neck' },
    { id: '2-2', name_zh: '三角肌/肩部', name_en: '(Shoulders)', imageKey: 'Shoulders' },
  ],
  "胸部": [
    { id: '3-1', name_zh: '胸大肌', name_en: '(Pectorals)', imageKey: 'Pectorals' },
  ],
  "背部與腰部": [
    { id: '4-1', name_zh: '闊背肌', name_en: '(Latissimus Dorsi)', imageKey: 'Latissimus' },
    { id: '4-2', name_zh: '下背/腰部', name_en: '(Lower Back)', imageKey: 'Lower' },
  ],
  "臀部": [
    { id: '5-1', name_zh: '臀大肌', name_en: '(Gluteus Maximus)', imageKey: 'Gluteus' },
    { id: '5-2', name_zh: '梨狀肌', name_en: '(Piriformis)', imageKey: 'Piriformis' },
  ],
  "下肢": [
    { id: '6-1', name_zh: '股四頭肌/大腿前側', name_en: '(Quads)', imageKey: 'Quads' },
    { id: '6-2', name_zh: '腿後腱/大腿後側', name_en: '(Hamstrings)', imageKey: 'Hamstrings' },
    { id: '6-3', name_zh: '內收肌/大腿內側', name_en: '(Adductors)', imageKey: 'Adductors' },
    { id: '6-4', name_zh: '小腿', name_en: '(Calves)', imageKey: 'Calves' },
  ],
  "其他": [
    { id: '7-1', name_zh: '跑步後拉伸', name_en: '', imageKey: 'AfterRun' },
    { id: '7-2', name_zh: '早晨伸展', name_en: '', imageKey: 'Morning' },
    { id: '7-3', name_zh: '睡前伸展', name_en: '', imageKey: 'Sleep' },
  ],
};

// ==========================================
// 【方案 A 核心】封裝通用的 Q 彈微互動 Pressable 元件
// ==========================================
const AnimatedPressable = ({ children, style, onPress, scaleTo = 0.95 }) => {
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
      friction: 5,  // 柔和Ｑ彈係數
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function Home() {
  const router = useRouter(); 
  const [activeCategory, setActiveCategory] = useState("常用");

  // 【方案 A 優化】動作卡片導入彈性互動，scaleTo 設為微量 0.97
  const ExerciseCard = ({ zh, en, image }) => (
    <AnimatedPressable 
      style={styles.card}
      scaleTo={0.97}
      onPress={() => router.push({
        pathname: '/exerciseDetail',
        params: { name_zh: zh }
      })}
    >
      <View style={styles.cardTextContainer}>
        <Text style={styles.partNameZh}>{zh}</Text>
        {en !== '' && <Text style={styles.partNameEn}>{en}</Text>}
      </View>
      <View style={styles.cardImageContainer}>
        {image && (
          <Image 
            source={image} 
            style={styles.cardImage} 
            resizeMode="contain" 
          />
        )}
      </View>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Emo 伸</Text>
        </View>
      </View>

      {/* 主交互區 */}
      <View style={styles.interactiveBodyContainer}>
        
        {/* 左側：按鈕區 */}
        <View style={styles.interactiveLeftNodes}>
          {categories.map((item, index) => {
            const isActive = activeCategory === item;
            const isRightSide = index % 2 !== 0; 
            const displayName = item === "背部與腰部" ? "背腰" : item;

            return (
              <View 
                key={index} 
                style={[
                  styles.nodeRow, 
                  isRightSide ? { justifyContent: 'flex-end', paddingRight: 5 } : { justifyContent: 'flex-start', paddingLeft: 10 }
                ]}
              >
                {/* 【方案 A 優化】8 個部位按鈕套用獨立微變換動態 */}
                <AnimatedPressable
                  style={[
                    styles.nodeCircle,
                    isActive && styles.nodeCircleActive
                  ]}
                  scaleTo={0.9} // 圓形按鈕縮放幅度略大，手感更扎實
                  onPress={() => setActiveCategory(item)}
                >
                  <Text style={[
                    styles.nodeText,
                    isActive && styles.nodeTextActive
                  ]}>
                    {displayName}
                  </Text>
                </AnimatedPressable>
              </View>
            );
          })}
        </View>

        {/* 右側：人體示意大圖 */}
        <View style={styles.interactiveRightBody} pointerEvents="none">
          <Image 
            source={bodyMainImages[activeCategory]} 
            style={styles.bodyMainImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* 下方卡片顯示區 */}
      <View style={styles.bottomCardContainerOuter}>
        <View style={styles.bottomCardWrapper}>
          <Text style={styles.sectionTitle}>{activeCategory}</Text>
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.cardGrid}>
              {stretchData[activeCategory] && stretchData[activeCategory].map((item) => (
                <ExerciseCard 
                  key={item.id} 
                  zh={item.name_zh} 
                  en={item.name_en} 
                  image={bodyPartImages[item.imageKey]} 
                />
              ))}
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLOR,
  },
  headerContainer: {
    backgroundColor: PAGE_BG,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: THEME_COLOR,
    borderBottomLeftRadius: 35,  
    borderBottomRightRadius: 35, 
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  interactiveBodyContainer: {
    height: height * 0.47, 
    backgroundColor: PAGE_BG,
    flexDirection: 'row',
    alignItems: 'center', 
  },
  interactiveLeftNodes: {
    width: '35%', 
    height: '100%', 
    paddingLeft: 30, 
    paddingVertical: 30, 
    justifyContent: 'center',
    zIndex: 99, 
  },
  nodeRow: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactiveRightBody: {
    width: '65%', 
    height: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 5,
    paddingTop: 10, 
  },
  bodyMainImage: {
    width: '150%', 
    height: '150%', 
  },
  nodeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25, // 修正：寬高 50 對應圓角 25 才是完美正圓形
    backgroundColor: '#4A5764',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  nodeCircleActive: {
    backgroundColor: '#8EA8BE', 
    borderWidth: 1.5,
    borderColor: '#424E58',
  },
  nodeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  nodeTextActive: {
    color: '#2D3A48',
  },
  bottomCardContainerOuter: {
    flex: 1,
    backgroundColor: PAGE_BG, 
  },
  bottomCardWrapper: {
    flex: 1, 
    backgroundColor: CARD_CONTAINER_BG,
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: 35, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  contentScroll: {
    flex: 1,
  },
  cardGrid: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row', 
    marginBottom: 12,
    width: (width - 16*2 - 12) / 2, 
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 8,
    paddingLeft: 12, 
    paddingRight: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  cardTextContainer: {
    flex: 1.2,
    justifyContent: 'center',
  },
  partNameZh: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A2530',
  },
  partNameEn: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  cardImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});