import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ValkyBottomNav, ValkyTopBar } from '@/components/valky-navigation';
import { ValkyColors } from '@/constants/valky-theme';
import { AuthProvider } from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={styles.root}>
          <AnimatedSplashOverlay />
          <ValkyTopBar />
          <View style={styles.content}>
            <Slot />
          </View>
          <ValkyBottomNav />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ValkyColors.background,
  },
  content: {
    flex: 1,
  },
});
