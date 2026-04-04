import React, { useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const categories = ["常用", "手臂", "肩頸", "胸部", "背部與腰部", "臀部", "下肢"];
const THEME_COLOR = '#A79E8D';
const CONTENT_BG = '#C2B39A';

export default function Home() {
  const scrollRef = useRef(null);
  const sectionLayouts = useRef({});

  const scrollToSection = (category) => {
    const y = sectionLayouts.current[category];
    if (y !== undefined) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  const ExerciseCard = () => (
    <View style={styles.card}>
      <Text style={{ color: '#A09484', fontSize: 12 }}>圖片預留位置</Text>
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
    // 透過 edges 讓背景色延伸到頂部狀態列
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={{backgroundColor:THEME_COLOR, height:95}}>
        {/* Header 部分 */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder} />
          <Text style={styles.appTitle}>Emo 伸</Text>
        </View>

        {/* Category Bar 部分 */}
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

      {/* 內容區塊：背景換回 C2B39A */}
      <View style={{ flex: 1, backgroundColor: CONTENT_BG }}>
        <ScrollView ref={scrollRef} style={styles.contentScroll}>
          <View style={{ paddingTop: 20 }}>
            {categories.map((item, index) => (
              <Section key={index} title={item} />
            ))}
          </View>
          {/* 底部墊高，避免被 TabBar 擋住最後一個區塊 */}
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
    paddingTop:5,
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
    paddingTop:15,
    backgroundColor: THEME_COLOR,
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
    height: 30,
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
    width: (width - 45) / 2,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // 輕微陰影讓卡片更精緻
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});