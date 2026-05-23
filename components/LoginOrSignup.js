import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { round } from 'firebase/firestore/pipelines';
import { router } from 'expo-router';

export default function LoginOrSignup({ onBack }) {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Pressable
                onPress={onBack}
            >
                <TurnBackIcon width={24} height={24} />
            </Pressable>

            <Pressable
                onPress={Keyboard.dismiss}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, marginTop: 100 }}>
                    <View style={styles.loginCon}>

                        <View style={styles.itemCon}>
                            <Text style={styles.nameText}>電子郵件</Text>
                            <View style={styles.inputCon}>
                                <TextInput
                                    style={styles.innerText}
                                    placeholder="請輸入電子郵件"
                                    placeholderTextColor="#6B6B6B"
                                />
                            </View>
                        </View>

                        <View style={styles.itemCon}>
                            <Text style={styles.nameText}>密碼</Text>
                            <View style={styles.inputCon}>
                                <TextInput
                                    style={styles.innerText}
                                    placeholder="請輸入密碼"
                                    placeholderTextColor="#6B6B6B"
                                />
                            </View>
                        </View>
                        <Pressable
                            style={styles.btn}
                        >
                            <Text style={styles.btnText}>登入</Text>
                        </Pressable>
                    </View>

                    {/* 下方按鈕 */}
                    <View style={styles.underBtn}>
                        <Pressable>
                            <Text style={styles.underText}>忘記密碼</Text>
                        </Pressable>
                        <Pressable
                            onPress={()=>router.push('/signup')}
                        >
                            <Text style={styles.underText}>尚未有帳號? 註冊</Text>
                        </Pressable>
                    </View>
                </View>


            </Pressable>


        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C1B69C', // 統一 LALA 的褐灰色底
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    loginCon: {
        backgroundColor: '#D8D1B9',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 50,
        gap: 20,
    },
    inputCon: {
        backgroundColor: '#B1A893',
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    itemCon: {
        gap: 10
    },
    btn: {
        backgroundColor: '#9E554D',
        paddingVertical: 10,
        marginHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 50
    },
    underBtn: {
        justifyContent: 'space-between',
        paddingTop:10,
        flexDirection:'row',
        paddingHorizontal:10
    },
    nameText: {
        paddingLeft: 10,
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: 500
    },
    innerText: {
        color: '#1A1A1A',
        fontSize: 14,
        fontWeight: 300,
        opacity: 0.5
    },
    btnText: {
        fontSize: 18,
        fontWeight: 500,
        color: '#fff'
    },
    underText:{
        fontSize:14,
        fontWeight:300,
        color:'#3B60CF'
    }
})