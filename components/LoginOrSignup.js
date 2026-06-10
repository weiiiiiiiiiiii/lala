import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { round } from 'firebase/firestore/pipelines';
import { router, useRouter } from 'expo-router';
import { use, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginOrSignup({ onBack }) {
    const router = useRouter();

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!mail || !password) {
            Alert.alert('提示', '請輸入電子郵件與密碼');
            return
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, mail.trim(), password);
            console.log('登入成功');
            router.back();
        } catch (error) {
            console.error(error);
            // 簡單錯誤訊息中文化
            let errorMsg = '登入失敗，請檢查帳密';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                errorMsg = '帳號或密碼錯誤，若尚未註冊請先註冊';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = '電子郵件格式不正確';
            }
            Alert.alert('登入錯誤', errorMsg);
        } finally {
            setLoading(false);

        }
    }


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Pressable
                onPress={()=>router.back()}
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
                                    autoCapitalize='none'
                                    keyboardType="email-address"
                                    value={mail}
                                    onChangeText={setMail}
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
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>
                        <Pressable
                            style={[styles.btn, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
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
                            onPress={() => router.push('/signup')}
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
        paddingTop: 10,
        flexDirection: 'row',
        paddingHorizontal: 10
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
    underText: {
        fontSize: 14,
        fontWeight: 300,
        color: '#3B60CF'
    }
})