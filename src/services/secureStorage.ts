import * as SecureStore from 'expo-secure-store';
import { SECURE_STORAGE_KEYS } from '../utils/constants';

export const saveApiKey = async (key: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(SECURE_STORAGE_KEYS.CLAUDE_API_KEY, key);
  } catch (error) {
    console.error('Failed to save API key securely:', error);
    throw error;
  }
};

export const getApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SECURE_STORAGE_KEYS.CLAUDE_API_KEY);
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
};

export const deleteApiKey = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.CLAUDE_API_KEY);
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw error;
  }
};
