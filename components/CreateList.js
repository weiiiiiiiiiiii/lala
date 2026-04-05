import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CreateList({ onBack }) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={styles.header}>
                    <Text style={styles.headText}>建立你的清單</Text>
                </View>
                <View style={styles.listCon}>
                    <View style={styles.list}>
                        <Text style={styles.listText}>清單名字</Text>
                        <View style={styles.inputCon}>
                            <Text style={styles.inputText}>輸入名字...</Text>
                        </View>
                    </View>
                    <View style={styles.list}>
                        <Text style={styles.listText}>選擇喜愛動作加入</Text>
                        <View style={styles.inputCon}>
                            <Text style={styles.inputText}>已選擇...項動作</Text>
                        </View>
                    </View>
                </View>
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: 'auto',
                    gap: 25
                }}>
                    <Pressable
                        style={{
                            width: 170,
                            height: 80,
                            backgroundColor: '#E68C8C',
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={onBack}>
                        <Text style={styles.listText}>取消</Text>
                    </Pressable>
                    <Pressable
                        style={{
                            width: 170,
                            height: 80,
                            backgroundColor: '#97FDAA',
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={onBack}>
                        <Text style={styles.listText}>建立</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
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
    headText: {
        fontSize: 28,
        fontWeight:'bold'
    },
    listCon:{
        // paddingHorizontal:50,
        alignItems:'center',
        paddingTop:50,
        gap:50
    },
    listText:{
        fontSize:24,
        fontWeight:'bold'
    },
    inputCon:{
        width:350,
        height:45,
        borderRadius:50,
        backgroundColor:'#D9D9D9',
        justifyContent:'center',
        paddingHorizontal:20
    },
    list:{
        gap:15,
    },
    inputText:{
        fontSize:12,
        color:'#000',
        opacity:0.25,
    }
})