import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import { Pressable, StyleSheet } from 'react-native';


export default function SignUp() {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Pressable
            >
                <TurnBackIcon width={24} height={24} />
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C1B69C', // 統一 LALA 的褐灰色底
        paddingHorizontal: 20,
        paddingVertical: 30
    },

})