import React, { useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Dimensions, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 引入路由導航

const { width } = Dimensions.get('window');

const categories = ["常用", "手臂", "肩頸", "胸部", "背部與腰部", "臀部", "下肢", "其他"];
const THEME_COLOR = '#A79E8D';
const CONTENT_BG = '#C2B39A';

// --- 圖片對應表 ---
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
  // 情境圖片
  Morning: require('../assets/images/Common/Morning.png'),
  Sleep: require('../assets/images/Common/Sleep.png'),
  AfterRun: require('../assets/images/Common/AfterRun.png'),
};

// --- 資料結構 ---
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

export default function Home() {
  const router = useRouter(); // 初始化路由
  const scrollRef = useRef(null);
  const sectionLayouts = useRef({});

  const scrollToSection = (category) => {
    const y = sectionLayouts.current[category];
    if (y !== undefined) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  // --- 修正後的 ExerciseCard：加入跳轉邏輯 ---
  const ExerciseCard = ({ zh, en, image }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/exerciseDetail', // 對應 app/exerciseDetail.js
        params: { name_zh: zh }      // 傳遞標題參數
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
    </TouchableOpacity>
  );

  const Section = ({ title }) => (
    <View
      onLayout={(event) => {
        sectionLayouts.current[title] = event.nativeEvent.layout.y;
      }}
      style={styles.sectionContainer}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cardGrid}>
        {stretchData[title] && stretchData[title].map((item) => (
          <ExerciseCard 
            key={item.id} 
            zh={item.name_zh} 
            en={item.name_en} 
            image={bodyPartImages[item.imageKey]} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header 與 分類列 */}
      <View style={{ backgroundColor: THEME_COLOR, height: 95 }}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder} />
          <Text style={styles.appTitle}>Emo 伸</Text>
        </View>

        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => scrollToSection(item)}
              >
                <Text style={styles.categoryText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 內容區塊 */}
      <View style={{ flex: 1, backgroundColor: CONTENT_BG }}>
        <ScrollView ref={scrollRef} style={styles.contentScroll}>
          <View style={{ paddingTop: 20 }}>
            {categories.map((item, index) => (
              <Section key={index} title={item} />
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLOR,
  },
  header: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: THEME_COLOR,
  },
  logoPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryWrapper: {
    paddingTop: 15,
    backgroundColor: THEME_COLOR,
  },
  categoryBar: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    backgroundColor: '#EAE0D5',
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    height: 25,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row', 
    marginBottom: 15,
    width: 190,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingLeft: 10, 
    paddingRight: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  partNameZh: {
    fontSize: 12, 
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  partNameEn: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  cardImageContainer: {
    width: 75, 
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});