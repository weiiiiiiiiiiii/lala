import React, { useState, useRef } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// 引入萬能控色版返回鍵
import TurnBackIcon from '../assets/images/TurnBack.svg';

// ==========================================
// 統一更換為設計圖專屬深夜藍灰與粉桃配色變數
// ==========================================
const BG_COLOR = '#626C72';         // 滿版主要背景顏色
const CARD_BG = '#838D95';          // 中間大框框背景顏色
const INPUT_BG = '#424E58';         // 輸入欄背景顏色
const BTN_COLOR = '#9E554D';        // 登入按鈕顏色
const UNDER_TEXT_COLOR = '#93AEFF'; // 忘記密碼與註冊引導的同步亮藍色

export default function LoginOrSignup({ onBack }) {
    const router = useRouter();

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 【方案 A】控制按鈕回饋之專屬動態核心
    // ==========================================
    const backArrowScale = useRef(new Animated.Value(1)).current;
    const loginBtnScale = useRef(new Animated.Value(1)).current;
    const forgotTextScale = useRef(new Animated.Value(1)).current;
    const signupTextScale = useRef(new Animated.Value(1)).current;

    const animateScale = (animValue, toValue, isSpring = false) => {
        if (isSpring) {
            Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
        } else {
            Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
        }
    };

    // 登入核心驗證邏輯 (100% 完整保留)
    const handleLogin = async () => {
        if (!mail || !password) {
            Alert.alert('提示', '請輸入電子郵件與密碼');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, mail.trim(), password);
            console.log('登入成功');
            router.back();
        } catch (error) {
            console.error(error);
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
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* 返回按鈕套用方案 A 微互動 */}
            <Pressable
                onPressIn={() => animateScale(backArrowScale, 0.85)}
                onPressOut={() => animateScale(backArrowScale, 1, true)}
                onPress={() => router.back()}
                style={styles.backBtnWrapper}
            >
                <Animated.View style={{ transform: [{ scale: backArrowScale }] }}>
                    <TurnBackIcon width={24} height={24} stroke="#fff" color="#fff" />
                </Animated.View>
            </Pressable>

            <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', marginBottom: 150 }}>
                    
                    {/* 中間大卡片框框 */}
                    <View style={styles.loginCon}>

                        {/* 電子郵件輸入區塊 */}
                        <View style={styles.itemCon}>
                            <Text style={styles.nameText}>電子郵件</Text>
                            <View style={styles.inputCon}>
                                <TextInput
                                    style={styles.innerText}
                                    placeholder="請輸入電子郵件"
                                    placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                    autoCapitalize='none'
                                    keyboardType="email-address"
                                    value={mail}
                                    onChangeText={setMail}
                                />
                            </View>
                        </View>

                        {/* 密碼輸入區塊 */}
                        <View style={styles.itemCon}>
                            <Text style={styles.nameText}>密碼</Text>
                            <View style={styles.inputCon}>
                                <TextInput
                                    style={styles.innerText}
                                    placeholder="請輸入密碼"
                                    placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {/* 登入大按鈕套用方案 A 微互動 */}
                        <Pressable
                            onPressIn={() => animateScale(loginBtnScale, 0.96)}
                            onPressOut={() => animateScale(loginBtnScale, 1, true)}
                            style={[styles.btnWrapper, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Animated.View style={[styles.btn, { transform: [{ scale: loginBtnScale }] }]}>
                                <Text style={styles.btnText}>登入</Text>
                            </Animated.View>
                        </Pressable>
                    </View>

                    {/* 下方引導按鈕區塊（完全同步 93AEFF 晴空藍色調） */}
                    <View style={styles.underBtn}>
                        <Pressable
                            onPressIn={() => animateScale(forgotTextScale, 0.9)}
                            onPressOut={() => animateScale(forgotTextScale, 1, true)}
                        >
                            <Animated.Text style={[styles.underText, { transform: [{ scale: forgotTextScale }] }]}>
                                忘記密碼
                            </Animated.Text>
                        </Pressable>

                        <Pressable
                            onPressIn={() => animateScale(signupTextScale, 0.9)}
                            onPressOut={() => animateScale(signupTextScale, 1, true)}
                            onPress={() => router.push('/signup')}
                        >
                            <Animated.Text style={[styles.underText, { transform: [{ scale: signupTextScale }] }]}>
                                尚未有帳號? 註冊
                            </Animated.Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR, // 💡 換上高級大背景色 626C72
        paddingHorizontal: 24,
    },
    backBtnWrapper: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 20,
    },
    // 中間框框大優化 (背景 838D95)
    loginCon: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 45,
        gap: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    // 輸入欄背景大優化 (背景 424E58)
    inputCon: {
        backgroundColor: INPUT_BG,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 54,
        justifyContent: 'center'
    },
    itemCon: {
        gap: 8
    },
    btnWrapper: {
        width: '100%',
        marginTop: 32,
    },
    // 登入按鈕圓角幾何美化 (背景 9E554D)
    btn: {
        backgroundColor: BTN_COLOR,
        height: 52,
        marginHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 26,
    },
    underBtn: {
        justifyContent: 'space-between',
        paddingTop: 16,
        flexDirection: 'row',
        paddingHorizontal: 12
    },
    nameText: {
        paddingLeft: 4,
        color: '#fff', // 更換為白色，與深色底框形成高對比
        fontSize: 16,
        fontWeight: '600'
    },
    // 輸入打字顏色優化
    innerText: {
        color: '#fff', // 打字更換為高對比純白，字體絕不被吞掉
        fontSize: 15,
        fontWeight: '400',
    },
    btnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 2
    },
    // 同步換上高飽和度的 93AEFF 晴空藍色系
    underText: {
        fontSize: 14,
        fontWeight: '600',
        color: UNDER_TEXT_COLOR,
        letterSpacing: 0.5
    }
});