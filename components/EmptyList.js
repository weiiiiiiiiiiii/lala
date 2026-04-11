import { Pressable, ScrollView, Text, View } from "react-native";
import useListStore from "../store/useListStore"
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import TurnBackIcon from '../assets/images/TurnBack.svg';
import EditIcon from '../assets/images/pencil_icon.svg';
import OKIcon from '../assets/images/OK_icon.svg';
import { useState } from "react";


export default function EmptyList({ onBack }) {
    const lists = useListStore((state) => state.lists);
    const { id, name } = useLocalSearchParams();
    // 1. 根據傳過來的 id，從 Store 找到當前這份清單的詳細資料
    const currentList = lists.find(list => list.id.toString() === id?.toString());

    const [isEdit, setIsEdit] = useState(false);
    const handleEdit = () => {
        if (isEdit) {
            // 如果現在是編輯中，點擊後要做的事（例如儲存）
            console.log("儲存修改內容");
        }
        // 切換編輯狀態
        setIsEdit(!isEdit);
    }

    const router = useRouter();
    const backList = () => {
        if (router.canGoBack()) {
            router.back(); // 這會觸發從左往右的滑回動畫
        } else {
            router.replace('/list'); // 保險機制：如果沒得退，就換回主頁
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={backList} style={styles.Button}>
                    <TurnBackIcon width={24} height={24} />
                </Pressable>
                <Text style={styles.headText}>{name}</Text>
                <Pressable onPress={handleEdit} style={styles.Button}>
                    {isEdit ? (
                        <OKIcon width={24} height={24} />
                    ) : (
                        <EditIcon width={24} height={24} />
                    )}
                </Pressable>
            </View>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {(!currentList || currentList.action.length === 0) ? (
                    <View style={styles.emptyCenter}>
                        <Text style={styles.alertText}>目前沒有運動項目在此清單</Text>
                        <Pressable
                            style={styles.addBtn}
                            onPress={() => {
                                // 這裡可以跳轉到你的動作選擇頁面
                                console.log("跳轉到選擇動作頁面");
                            }}
                        >
                            <Text style={styles.addBtnText}>+ 喜愛動作</Text>
                        </Pressable>
                    </View>
                ) : (
                    <ScrollView>
                        {/* 如果有內容，顯示動作列表 */}
                        {currentList.action.map((act, index) => (
                            <View key={index} style={styles.actionItem}>
                                <Text>{act}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 95,
        backgroundColor: '#A79E8D',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    headText: { fontSize: 28, fontWeight: 'bold' },
    emptyCenter: {
        paddingTop: 30,
        alignItems: 'center',
    },
    alertText: {
        fontSize: 18,
        padding: 20
    },
    addBtn: {
        backgroundColor: '#d9d9d9',
        borderRadius: 50,
        width: 190,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addBtnText: {
        fontSize: 14
    },
    Button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});