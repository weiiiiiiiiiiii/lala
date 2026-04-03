import React from 'react';
import { FlatList, Pressable, View, Text, StyleSheet } from 'react-native';
// 使用正確的來源，避開 VS Code 的刪除線警告
import { SafeAreaView } from 'react-native-safe-area-context';
import ListScroll from './ListScroll';
import { useState } from "react";

const recommend = [
  {
    id: 1,
    name: '手部',
  },
  {
    id: 2,
    name: '腿部',
  },
  {
    id: 3,
    name: '腰部',
  },
  {
    id: 4,
    name: '背部',
  },
  {
    id: 5,
    name: '胸部',
  },
  {
    id: 6,
    name: '頸部',
  },

  {
    id: 7,
    name: '肩部',
  },
]


export default function MyList() {
  const [recommendItem, setRecommendItem] = useState(recommend);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>
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
      </View>
      {/* 喜愛 */}
      <View style={styles.listCon}>
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
      </View>

      {/* 推薦 */}
      <View >
        <View style={styles.listitem}>
          <Text style={styles.listText}>推薦</Text>
          <FlatList
            data={recommendItem}
            renderItem={({ item }) => <ListScroll part={item} />}
            horizontal={true}             // 開啟橫向排列
            showsHorizontalScrollIndicator={false} // 隱藏橫向捲動條
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* 我的 */}
      <View style={styles.listCon}>
        <View style={styles.listitem}>
          <Text style={styles.listText}>我的</Text>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#C1B69C'
  },
  header: {
    width: 'auto',
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listCon: {
    paddingVertical: 20
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