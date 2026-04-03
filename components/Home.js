import React, { useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  TouchableOpacity, Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const categories = ["常用", "手臂", "肩頸", "胸部", "背部與腰部", "臀部", "下肢"];

export default function Home() {
  const scrollRef = useRef(null);
  // 用於儲存各區塊的 Y 座標
  const sectionLayouts = useRef({});

  // 滾動到指定位置的函式
  const scrollToSection = (category) => {
    const y = sectionLayouts.current[category];
    if (y !== undefined) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  // 區塊組件 (方便你之後插入圖片)
  const ExerciseCard = () => (
    <View style={styles.card}>
      {/* 這裡之後可以放 <Image /> */}
      <Text style={{ color: '#ccc' }}>圖片預留位置</Text>
    </View>
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
        <ExerciseCard />
        <ExerciseCard />
        <ExerciseCard />
        <ExerciseCard />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header: Logo & App名稱 */}
      <View style={styles.header}>
        <View style={styles.logoPlaceholder} /> 
        <Text style={styles.appTitle}>LALA 健身</Text>
      </View>

      {/* Category Bar: 可水平滑動 */}
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

      {/* Main Content: 垂直滾動內容 */}
      <ScrollView ref={scrollRef} style={styles.contentScroll}>
        {categories.map((item, index) => (
          <Section key={index} title={item} />
        ))}
        {/* 底部留白避免被 TabBar 遮住 */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2B39A', // 照設計圖的褐灰色
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logoPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff', // 之後放 Logo
    marginRight: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryWrapper: {
    height: 50,
    marginBottom: 10,
  },
  categoryBar: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    backgroundColor: '#EAE0D5',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    height: 35,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 50) / 2, // 計算兩格卡片的寬度
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // 陰影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});