import React from 'react';
import { FlatList, Pressable, View, Text, StyleSheet } from 'react-native';
// 使用正確的來源，避開 VS Code 的刪除線警告
import { SafeAreaView } from 'react-native-safe-area-context';
import ListScroll from './ListScroll';
import { useState } from "react";
import PlusIcon from '../assets/images/Plus.svg'
import CreateList from './CreateList';

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
  const [Scene, setScene] = useState('my');
  if (Scene === 'create') {
    return (
      <CreateList onBack={() => setScene('my')} />
    )
  }

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
                  borderRadius: 10,
                  shadowOffset: {
                    width: 0,
                    height: 4
                  },
                  shadowColor: '#000',
                  shadowRadius: 5,
                  shadowOpacity: 0.1,
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
                  shadowOffset: {
                    width: 0,
                    height: 4
                  },
                  shadowColor: '#000',
                  shadowRadius: 5,
                  shadowOpacity: 0.1,
                }}
              >
              </Pressable>
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
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* 我的 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>我的</Text>
          </View>

        </View>

        {/* 創建清單按鈕 */}

        <Pressable
          onPress={() => { setScene('create'); }}
          style={({ pressed }) => ({
            position: 'absolute',
            right: 20,
            bottom: 30,
            width: 80,
            height: 80,
            borderRadius: 50,
            shadowOffset: {
              width: 0,
              height: 4
            },
            shadowColor: '#000',
            shadowRadius: 5,
            shadowOpacity: 0.3,
            backgroundColor: '#FBFD97',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1
          })}
        >
          <PlusIcon
            key={`create`}
            width={30}
            height={30}
            stroke={'#000'}
            fill="none"
          />
        </Pressable>

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
  },
  listitem: {
    gap: 10,
    height:150
  },
  list: {
    gap: 20,
    paddingHorizontal: 20,
    
  },
  headText: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  listText: {
    fontSize: 18,
    paddingLeft: 20,
    fontWeight: 'bold'
  },
  btn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 80,
    height: 80,
    borderRadius: 50,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    backgroundColor: '#FBFD97',
    alignItems: 'center',
    justifyContent: 'center',
  }
});