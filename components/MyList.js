import React, { useState } from 'react';
import { FlatList, Pressable, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 引入路由
import ListScroll from './ListScroll';
import PlusIcon from '../assets/images/Plus.svg';

const recommend = [
  { id: 1, name: '手部' },
  { id: 2, name: '腿部' },
  { id: 3, name: '腰部' },
  { id: 4, name: '背部' },
  { id: 5, name: '胸部' },
  { id: 6, name: '頸部' },
  { id: 7, name: '肩部' },
];

export default function MyList() {
  const router = useRouter();
  const [recommendItem] = useState(recommend);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>

      {/* 內容區塊 */}
      <View style={{ flex: 1, backgroundColor: '#C1B69C' }}>
        <View style={styles.listCon}>
          {/* 今日 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>今日</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable style={styles.card} />
            </View>
          </View>

          {/* 喜愛 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>喜愛</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable style={styles.card} />
            </View>
          </View>

          {/* 推薦 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>推薦</Text>
            <FlatList
              data={recommendItem}
              renderItem={({ item }) => <ListScroll part={item} />}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
            />
          </View>

          {/* 我的 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>我的</Text>
          </View>
        </View>

        {/* 創建清單按鈕：跳轉至 /create */}
        <Pressable
          onPress={() => router.push('/create')}
          style={({ pressed }) => [
            styles.btn,
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <PlusIcon width={30} height={30} stroke={'#000'} fill="none" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCon: { paddingVertical: 20 },
  listitem: { gap: 10, height: 150 },
  list: { gap: 20, paddingHorizontal: 20 },
  headText: { fontSize: 28, fontWeight: 'bold' },
  listText: { fontSize: 18, paddingLeft: 20, fontWeight: 'bold' },
  btn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBFD97',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  card: {
    width: 190,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }
});