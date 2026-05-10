import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoaderScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo Section - ให้พื้นที่ด้านบนพอสมควร */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/image.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Text Section - จัดกลุ่มข้อความใหม่ */}
                <View style={styles.textContainer}>
                    <Text style={styles.mainTitle}>You'll Never Walk Alone</Text>
                    <View style={styles.divider} />
                    <Text style={styles.subtitle}>Find your people and grow together</Text>
                    <Text style={styles.motto}>Concilio et Labore</Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Buttons Section */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFEAF2', // พื้นหลังโทนชมพูอ่อนที่นุ่มนวล
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
        paddingBottom: 40,
    },
    logoContainer: {
        shadowColor: '#F58882',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    logo: {
        width: 220,
        height: 220,
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#374151',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    divider: {
        height: 3,
        width: 40,
        backgroundColor: '#F58882',
        marginVertical: 16,
        borderRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 12,
    },
    motto: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F58882',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    bottomContainer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#F58882',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#F58882',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginText: {
        color: '#9CA3AF',
        fontSize: 15,
    },
    loginLink: {
        color: '#F58882',
        fontWeight: '700',
    },
});