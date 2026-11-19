
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'valky_jwt';
const USER_ID_KEY = 'valky_user_id';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveUserId(userId: number) {
  await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
}

export async function getUserId() {
  const userId = await SecureStore.getItemAsync(USER_ID_KEY);
  return userId ? Number(userId) : null;
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
