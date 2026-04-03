import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";


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

                style={{
                    width: 185,
                    height: 80,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    alignItems:'center',
                    justifyContent:'center'
                }}
            >
                <Text>{part.name}</Text>
            </Pressable>
        </View>
    )
}