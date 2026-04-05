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
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowOffset: {
                        width: 0,
                        height: 4
                    },
                    shadowColor: '#000',
                    shadowRadius: 5,
                    shadowOpacity: 0.1,
                }}
            >
                <Text>{part.name}</Text>
            </Pressable>
        </View>
    )
}