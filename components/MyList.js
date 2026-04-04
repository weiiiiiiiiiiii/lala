import React from 'react';
import { FlatList, Pressable, View, Text, StyleSheet } from 'react-native';
// 使用正確的來源，避開 VS Code 的刪除線警告
import { SafeAreaView } from 'react-native-safe-area-context';
import ListScroll from './ListScroll';
import { useState } from "react";

const recommend = [
  { id: 1, name: '手部' },
  { id: 2, name: '腿部' },
  { id: 3, name: '腰部' },
  { id: 4, name: '背部' },
  { id: 5, name: '胸部' },
  { id: 6, name: '頸部' },
  { id: 7, name: '肩部' },
]

export default function MyList() {
  const [recommendItem, setRecommendItem] = useState(recommend);

  return (
    /* 修正：將 SafeAreaView 背景設為 Header 顏色 (#A79E8D) 以統一 Status Bar */
    <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>
      
      {/* 修正：在下方內容區塊加回原本的背景色 (#C1B69C) */}
      <View style={{ flex: 1, backgroundColor: '#C1B69C' }}>
        {/* 今日 */}
        <View style={styles.listCon}>
          <View style={styles.listitem}>
            <Text style={styles.listText}>今日</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable
                style={{
                  width: 185,
                  height: 80,
                  backgroundColor: '#fff',
                  borderRadius: 10
                }}
              >
              </Pressable>
            </View>
          </View>

          {/* 喜愛 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>喜愛</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable
                style={{
                  width: 185,
                  height: 80,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                }}
              >
              </Pressable>
            </View>
          </View>

          {/* 推薦 */}
          <View >
            <View style={styles.listitem}>
              <Text style={styles.listText}>推薦</Text>
              <FlatList
                data={recommendItem}
                renderItem={({ item }) => <ListScroll part={item} />}
                horizontal={true}             
                showsHorizontalScrollIndicator={false} 
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>

          {/* 我的 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>我的</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  header: {
    width: 'auto',
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listCon: {
    paddingVertical: 20,
    gap:25
  },
  listitem: {
    gap: 10,
  },
  list: {
    gap: 20,
    paddingHorizontal: 20
  },
  headText: {
    fontSize: 32,
  },
  listText: {
    fontSize: 24,
    paddingLeft: 20
  }
});