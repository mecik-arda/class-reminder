export const STORAGE_KEYS = {
  THEME: '@theme_preference',
  LANGUAGE: '@language_preference',
  SCHEDULE: '@class_schedule',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
  NOTIFICATION_TIME: '@notification_time_minutes',
  HAS_SEEN_ONBOARDING: '@has_seen_onboarding',
  USE_GRID_VIEW: '@use_grid_view',
  CLASS_MODE_TYPE: '@class_mode_type', // 'none', 'notification', 'settings'
};

export const SECURE_STORAGE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
};

export const DEFAULT_PREFERENCES = {
  NOTIFICATION_TIME: 10,
  LANGUAGE: 'tr' as const,
  THEME: 'dark' as const,
  USE_GRID_VIEW: false,
  CLASS_MODE_TYPE: 'notification' as const,
};

// Days of week index mapping (0 = Monday, 6 = Sunday)
export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];
