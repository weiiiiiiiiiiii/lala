import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function ListScroll2({ part }) {
    const router = useRouter();

    return (
        <View >
            <Pressable
                onPress={() => {
                    router.push({
                        pathname: `/lala/${part.id}`,
                        params: {
                            name: part.name,

                        }
                    });
                }}

                style={styles.card}
            >
                <Text>{part.name}</Text>
            </Pressable>
        </View>
    )
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
})