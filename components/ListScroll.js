import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ListScroll2({ part, onLongPress }) {
    const router = useRouter();

    return (
        <View>
            <Pressable
                onPress={() => {
                    router.push({
                        // 讀取傳進來的 pathname (也就是 '/emptyList')
                        pathname: part.pathname || '/emptyList',
                        // 讀取傳進來的完整 params (包含 id 與 name)
                        params: part.params || { name: part.name }
                    });
                }}
                onLongPress={onLongPress}
                style={styles.card}
            >
                <Text>{part.name}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 190,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.1,
        elevation: 2,
    }
});