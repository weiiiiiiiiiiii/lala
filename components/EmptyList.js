import { ScrollView, Text, View } from "react-native";
import useListStore from "../store/useListStore"
import { StyleSheet } from "react-native";


export default function EmptyList() {
    const lists = useListStore((state) => state.lists);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>我的清單</Text>

            {/* 2. 判斷如果沒資料顯示提示，有資料則顯示列表 */}
            {lists.length === 0 ? (
                <Text style={styles.emptyText}>目前沒有清單，去建立一個吧！</Text>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {lists.map((item) => (
                        <View key={item.id} style={styles.listItem}>
                            <Text style={styles.itemText}>{item.title}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
    listContainer: {
        flex: 1,
    },
    listItem: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    itemText: {
        fontSize: 18,
        color: '#333',
    },
});