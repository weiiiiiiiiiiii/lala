import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CreateList({ onBack }) {
    return (
        <SafeAreaView>
            <View style={styles.header}>
                <Text style={styles.headText}>建立你的清單</Text>
            </View>
            <View style={{
                position: 'absolute',
                bottom: 0,
                flexDirection:'row',
                justifyContent:'center',
                alignItems:'center',
                width:'100%',
                height:'auto',
                gap:25
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
                    <Text style={{ fontSize: 24 }}>取消</Text>
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
                    <Text style={{ fontSize: 24 }}>建立</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        width: 'auto',
        height: 95,
        backgroundColor: '#A79E8D',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headText: {
        fontSize: 32,
    },
})