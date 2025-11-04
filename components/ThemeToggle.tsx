import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    const [scaleAnim] = React.useState(new Animated.Value(1));

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        toggleTheme();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
                activeOpacity={0.6}
            >
                <Ionicons
                    name={isDark ? 'sunny' : 'moon'}
                    size={28}
                    color="#FFFFFF"
                />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
    },
});