import { Stack } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from '../hooks/useTheme';
import * as Font from 'expo-font';
import { JosefinSans_400Regular, JosefinSans_700Bold } from '@expo-google-fonts/josefin-sans';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
});

export default function RootLayout() {
    const [loaded] = Font.useFonts({
        JosefinSans_400Regular,
        JosefinSans_700Bold,
    });

    if (!loaded) return null;

    return (
        <ConvexProvider client={convex}>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                </Stack>
            </ThemeProvider>
        </ConvexProvider>
    );
}