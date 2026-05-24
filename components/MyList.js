import React, { useState } from 'react';
import { FlatList, Pressable, View, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 引入路由
import ListScroll from './ListScroll';
import PlusIcon from '../assets/images/Plus.svg';
import useListStore from '../store/useListStore';
import TurnBackIcon from '../assets/images/TurnBack.svg';

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

  //清單展開收合
  const [isShow, showed] = useState(false);
  const showNum = isShow ? recommendItem : recommendItem.slice(0, 0);

  const [isMyShow, Myshowed] = useState(false);
  const MyshowNum = isMyShow ? myLists : myLists.slice(0, 0);

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
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>

      {/* 2. 內容區塊（只純粹包裹 ScrollView） */}
      <View style={{ flex: 1, backgroundColor: '#C1B69C' }}>
        <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
          <View style={styles.listCon}>

            {/* 今日與喜愛 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, gap: 15 }}>
              {/* 今日清單 */}
              <View style={styles.listitem}>
                <Text style={styles.listText}>今日</Text>
                <View>
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: '/emptyList',
                        params: { name: '今日清單' }
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
                <View>
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
            </View>

            {/* 推薦與我的 */}
            <View>
              {/* 推薦 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 }}>
                <Text style={styles.listText2}>推薦</Text>
                <Pressable onPress={() => showed(!isShow)}>
                  <View>
                    <TurnBackIcon
                      width={24}
                      height={24}
                      style={{ transform: [{ rotate: isShow ? '-90deg' : '90deg' }] }}
                    />
                  </View>
                </Pressable>
              </View>

              <View style={styles.listitem2}>
                {showNum.map((item) => (
                  <ListScroll key={item.id} part={item} />
                ))}
              </View>

              {/* 我的清單 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 }}>
                <Text style={styles.listText2}>我的</Text>
                <Pressable onPress={() => Myshowed(!isMyShow)}>
                  <View>
                    <TurnBackIcon
                      width={24}
                      height={24}
                      style={{ transform: [{ rotate: isMyShow ? '-90deg' : '90deg' }] }}
                    />
                  </View>
                </Pressable>
              </View>

              <View style={styles.listitem2}>
                {myLists.length === 0 ? (
                  <View>
                    <Text style={styles.alertText}>點擊下方 + 建立你的清單</Text>
                  </View>
                ) : (
                  MyshowNum.map((item) => (
                    <ListScroll
                      key={item.id}
                      part={{
                        id: item.id,
                        name: item.title,
                        pathname: '/emptyList',
                        params: { id: item.id, name: item.title }
                      }}
                      onLongPress={() => handlongPress(item.id, item.title)}
                    />
                  ))
                )}
              </View>
            </View>

          </View>
        </ScrollView>
      </View>

      {/* 3. 💡 關鍵調整：把加號按鈕移到最外層，直接當 SafeAreaView 的直屬小孩！ */}
      {/* 💡 暫時把按壓透明度拿掉，直接硬綁定樣式，看看黃色大圓鈕會不會現形！ */}
      <Pressable
        onPress={() => router.push('/create')}
        style={styles.btn}
      >
        <PlusIcon width={35} height={35} stroke={'#000'} strokeWidth={2.5} fill="none" />
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCon: { paddingVertical: 20 },
  listitem: { gap: 10, height: 'auto' },
  listitem2: { gap: 10, height: 'auto', justifyContent: 'center', alignItems: 'center' },
  list: { gap: 20, paddingHorizontal: 15 },
  headText: { fontSize: 28, fontWeight: 'bold' },
  listText: { fontSize: 18, fontWeight: 'bold' },
  listText2: { fontSize: 18, fontWeight: 'bold', paddingLeft: 15, paddingVertical: 15 },
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
  },
  scrollInner: {
    flexGrow: 1,
    gap: 15,
  }
});