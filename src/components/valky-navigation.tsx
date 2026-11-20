import { Link, router, usePathname } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiConfigModal } from '@/components/api-config-modal';
import { ValkyColors } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';

interface NavTabItem {
  route: string;
  label: string;
  icon: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavTabItem[] = [
  { route: '/', label: 'Início', icon: '⌂' },
  { route: '/calculator', label: 'Disfarce', icon: '⊞' },
  { route: '/alerts', label: 'Alertas', icon: '◉', requiresAuth: true },
  { route: '/contacts', label: 'Contatos', icon: '♥', requiresAuth: true },
  { route: '/map', label: 'Mapa', icon: '⌖' },
  { route: '/blog', label: 'Apoio', icon: '▤' },
  { route: '/profile', label: 'Perfil', icon: '☺', requiresAuth: true },
  { route: '/about', label: 'Sobre', icon: 'ⓘ' },
];

/**
 * Cabeçalho global da aplicação Valky utilizando Link, router e usePathname do Expo Router.
 * Oculta-se automaticamente quando a usuária está na tela de Calculadora Disfarçada (/calculator)
 * para manter o disfarce 100% realista diante de terceiros.
 */
export function ValkyTopBar() {
  const pathname = usePathname();
  const { isAuthenticated, usuario } = useAuth();
  const [apiModalOpen, setApiModalOpen] = useState(false);

  if (pathname === '/calculator') {
    return null;
  }

  return (
    <View style={styles.topBar}>
      <Link href={'/' as never} asChild>
        <Pressable style={styles.brandRow}>
          <Text style={styles.brandLogo}>valky.</Text>
          <View style={styles.citizenBadge}>
            <Text style={styles.citizenBadgeText}>CITIZENTECH</Text>
          </View>
        </Pressable>
      </Link>

      <View style={styles.topRightRow}>
        <Pressable
          style={styles.apiPill}
          onPress={() => setApiModalOpen(true)}
        >
          <View style={styles.apiDot} />
          <Text style={styles.apiPillText}>API</Text>
        </Pressable>

        <Link href={'/calculator' as never} asChild>
          <Pressable style={styles.disguiseQuickBtn}>
            <Text style={styles.disguiseQuickText}>⊞ Disfarce</Text>
          </Pressable>
        </Link>

        {isAuthenticated && usuario ? (
          <Link href={'/profile' as never} asChild>
            <Pressable style={styles.userChip}>
              <Text style={styles.userChipText} numberOfLines={1}>
                {usuario.nome.split(' ')[0]}
              </Text>
            </Pressable>
          </Link>
        ) : (
          <Link href={'/login' as never} asChild>
            <Pressable style={styles.loginChip}>
              <Text style={styles.loginChipText}>Entrar</Text>
            </Pressable>
          </Link>
        )}
      </View>

      <ApiConfigModal
        visible={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />
    </View>
  );
}

/**
 * Barra de navegação inferior entre as 9 telas do aplicativo (Requisito 1 — Expo Router).
 * Oculta-se na tela /calculator para preservar o disfarce da calculadora.
 */
export function ValkyBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  if (pathname === '/calculator') {
    return null;
  }

  const handleNavigate = (item: NavTabItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      router.push({
        pathname: '/login' as never,
        params: { redirect: item.route },
      });
      return;
    }
    router.push(item.route as never);
  };

  return (
    <View style={styles.bottomBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bottomScroll}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.route === '/'
              ? pathname === '/' || pathname === '/index'
              : pathname.startsWith(item.route);

          return (
            <Pressable
              key={item.route}
              onPress={() => handleNavigate(item)}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {item.icon}
              </Text>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: ValkyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ValkyColors.border,
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 48, android: 36, default: 14 }),
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    color: ValkyColors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  citizenBadge: {
    backgroundColor: ValkyColors.surfaceMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  citizenBadgeText: {
    color: ValkyColors.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ValkyColors.background,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
  },
  apiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ValkyColors.success,
  },
  apiPillText: {
    color: ValkyColors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  disguiseQuickBtn: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  disguiseQuickText: {
    color: ValkyColors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  userChip: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 95,
  },
  userChipText: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginChip: {
    backgroundColor: ValkyColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loginChipText: {
    color: ValkyColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomBar: {
    backgroundColor: ValkyColors.surface,
    borderTopWidth: 1,
    borderTopColor: ValkyColors.border,
    paddingBottom: Platform.select({ ios: 20, android: 8, default: 8 }),
    paddingTop: 6,
  },
  bottomScroll: {
    paddingHorizontal: 10,
    gap: 4,
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 56,
  },
  tabBtnActive: {
    backgroundColor: ValkyColors.surfaceMuted,
  },
  tabIcon: {
    fontSize: 17,
    color: ValkyColors.textMuted,
    marginBottom: 2,
  },
  tabIconActive: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 11,
    color: ValkyColors.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
  },
});
