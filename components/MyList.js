import React, { useState } from 'react';
import { FlatList, Pressable, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 引入路由
import ListScroll from './ListScroll';
import PlusIcon from '../assets/images/Plus.svg';
import useListStore from '../store/useListStore';

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

  // 取得喜愛清單與我的清單
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];

  const removeList = useListStore((state) => state.removeList);
  
  const handlongPress = (id, title) => {
    Alert.alert(
      '刪除清單',
      `確定要刪除 ${title} 清單嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => removeList(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>

      {/* 內容區塊 */}
      <View style={{ flex: 1, backgroundColor: '#C1B69C' }}>
        <View style={styles.listCon}>
          {/* 今日清單 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>今日</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/emptyList',
                    params: {
                      name: '今日清單',
                    }
                  });
                }}
                style={styles.card}
              >
                <Image source={require('../assets/images/ListPic/Today.png')} style={{ width: 190, height: 100, borderRadius: 10 }} />
              </Pressable>
            </View>
          </View>

          {/* 喜愛清單 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>喜愛</Text>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable
                style={styles.card}
                onPress={() => {
                  router.push({
                    pathname: '/exerciseDetail',
                    params: { name_zh: '喜愛清單', mode: 'favorites' }
                  });
                }}
              >
                <Image source={require('../assets/images/ListPic/Favorite.png')} style={{ width: 190, height: 100, borderRadius: 10 }} />
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
            />
          </View>

          {/* 我的清單 */}
          <View style={styles.listitem}>
            <Text style={styles.listText}>我的</Text>
            {myLists.length === 0 ? (
              <View>
                <Text style={styles.alertText}>點擊下方 + 建立你的清單</Text>
              </View>
            ) : (
              <FlatList
                data={myLists}
                renderItem={({ item }) => (
                  <ListScroll
                    part={{
                      id: item.id,
                      name: item.title,
                      pathname: '/emptyList',
                      params: {
                        id: item.id,
                        name: item.title
                      }
                    }}
                    onLongPress={() => handlongPress(item.id, item.title)}
                  />
                )}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
              />
            )}
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
    backgroundColor: '#FFF4EA',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  alertText: {
    fontSize: 14, paddingLeft: 20
  }
});