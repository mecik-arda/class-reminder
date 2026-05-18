# Class Reminder — AI-Powered Class Schedule & Reminder Assistant

An elegant, premium, and feature-rich cross-platform mobile application built with **React Native**, **TypeScript**, and **Expo 54** that ensures students never miss a class. By combining **Anthropic Claude 3.7 Sonnet AI vision** with local scheduling logic, the app allows users to simply snap a picture of their printed or digital timetable, instantly parses it into structured data, and automatically schedules weekly recurring notifications ahead of each class.

Designed with a state-of-the-art glassmorphism look, vibrant purple glow aesthetics, fluid animations, and dual-language capabilities, **Class Reminder** represents a premium academic utility app.

---

## Key Features

### 1. AI-Powered Timetable Vision Scanner
*   **Zero Manual Entry**: Snap a picture or upload an image of a weekly class schedule (printed paper, school website screenshot, or pdf export).
*   **Anthropic Claude API Integration**: Powered by the advanced `claude-sonnet-4-20250514` model. The AI scans the schedule and extracts course names, lecturers, classrooms, days of the week, and starting/ending times.
*   **Deterministic Schema Extraction**: The prompt restricts the LLM to output a clean, strict JSON array schema directly mapped to TypeScript interfaces, bypassing conversational noise.

### 2. Intelligent Recurring Notifications
*   **Local Scheduling Engine**: Uses `expo-notifications` to calculate next-class occurrences and program weekly recurring notifications directly into iOS/Android native calendar services.
*   **Custom Offset Reminders**: Users can configure exactly how many minutes before class (e.g., 5, 10, 15, 30 minutes) they want to receive the alerts.
*   **Offline First**: No webhooks or background servers required; all reminders are scheduled locally on the device.

### 3. Hardware-Backed Secure Key Storage
*   **Bring Your Own Key (BYOK)**: Users enter their own Anthropic Claude API key during onboarding.
*   **Military-Grade Encryption**: The API key is securely encrypted and stored on-device using iOS Keychain or Android Keystore via `expo-secure-store`.

### 4. Fluid Premium Glassmorphism Design
*   **Aesthetics First**: A gorgeous dark/light theme engine centered around interactive glows, neon purple accents, smooth gradients, and glass cards.
*   **Micro-Animations**: Enhanced user interfaces with `react-native-reanimated` transitions and `expo-blur` cards.
*   **System Preference Sync**: Automatically detects and adapts to the system theme mode, while allowing direct overrides in Settings.

### 5. Native Bilingual Support
*   **Turkish & English**: Fully localized from the ground up using `i18next` and `react-i18next` context.
*   **Auto-Detection**: Dynamically queries device locale with `expo-localization` to set the default language during onboarding.

---

## Architecture & Folder Directory

The project is designed using the modular, modern **Expo Router v3 (file-based navigation)** structure, separate state contexts, and atomic business-logic services.

```bash
class-reminder/
├── app/                      # Expo Router Navigation & Screen Declarations
│   ├── (tabs)/               # Main Tab Navigator
│   │   ├── _layout.tsx       # Bottom Tab Configuration & Styling
│   │   ├── home.tsx          # Timetable Calendar Feed & Schedule List
│   │   ├── settings.tsx      # Notification Prefs, Theme, Language, API Keys
│   │   └── index.tsx         # Tab entry coordinator
│   ├── onboarding/           # Seamless 5-Step First Run Flow
│   │   ├── _layout.tsx       # Onboarding navigation wrapper
│   │   ├── welcome.tsx       # App introduction
│   │   ├── language.tsx      # Language selector (EN / TR)
│   │   ├── theme.tsx         # Theme preset selector (Dark / Light / System)
│   │   ├── api-key.tsx       # Secure API key entry screen
│   │   └── schedule-setup.tsx# Quick choice: manual entry or AI scan onboarding
│   ├── class/
│   │   └── [id].tsx          # Dynamic route: view/edit/delete a class session
│   ├── add-class.tsx         # Manual class creator modal
│   ├── scan-result.tsx       # AI Scan preview, verify, and import interface
│   ├── modal.tsx             # Pop-up information portal
│   ├── _layout.tsx           # Global Root Navigation & Context Providers
│   └── index.tsx             # Decides whether to route to Onboarding or Tabs
├── src/                      # Core Shared Application Code
│   ├── components/           # Reusable Premium UI Blocks (Buttons, Cards, Modals)
│   ├── contexts/             # Global Application State Contexts
│   │   ├── ThemeContext.tsx     # Handles themes, preferences, and dynamic CSS styling
│   │   ├── LanguageContext.tsx  # Coordinates translation engines and local languages
│   │   └── ScheduleContext.tsx  # Handles CRUD on async storage classes & notification syncing
│   ├── i18n/                 # Localization translation mappings
│   │   ├── en.json              # English String Translations
│   │   ├── tr.json              # Turkish String Translations
│   │   └── index.ts             # i18n instance initialization
│   ├── services/             # Core Backend Utility Services
│   │   ├── claude.ts            # API service calls to Anthropic for AI scanning
│   │   ├── notifications.ts     # Local Expo Notification scheduler algorithm
│   │   └── secureStorage.ts     # Wrapper for secure reading/writing of keys
│   ├── themes/               # Color tokens and gradient settings
│   ├── types/                # Strict TypeScript global interfaces
│   └── utils/                # Constants and common pure helper functions
├── assets/                   # Vector assets, high-res splash screens, and app icon
├── app.json                  # Expo Project & Permissions Configuration
├── package.json              # App dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

---

## Key Data Schema & TypeScript Types

### `ClassSession`
Every class or lecture is defined by the following strongly-typed schema in [types/index.ts](file:///c:/Users/ardam/Desktop/class-reminder/src/types/index.ts):

```typescript
export interface ClassSession {
  id: string;          // Unique UUID string
  courseName: string;  // E.g., "Advanced Calculus"
  teacher?: string;    // E.g., "Dr. Ada Lovelace" (Optional)
  classroom?: string;  // E.g., "Room 301 / Lab B" (Optional)
  day: number;         // 0-6 (0 = Monday, 6 = Sunday)
  startTime: string;   // "HH:MM" format (24h)
  endTime: string;     // "HH:MM" format (24h)
  notes?: string;      // Optional student notes
}
```

---

## Deep Dive: Core Service Implementations

### 1. The Claude Vision Prompt & Response Handling
The `scanSchedule` function in `src/services/claude.ts` encodes images to `base64` and sends them via the Claude Messages API using the `claude-sonnet-4-20250514` model. The prompt utilizes highly detailed systems parameters to guarantee structured JSON output. 

```typescript
// Strict API Instructions
const prompt = `Extract class schedule information from this image. Return strictly in JSON format with exactly this structure:
{
  "classes": [
    {
      "courseName": "string",
      "teacher": "string (optional)",
      "classroom": "string (optional)",
      "day": number (0-6 where 0 is Monday, 6 is Sunday),
      "startTime": "string (HH:MM format)",
      "endTime": "string (HH:MM format)"
    }
  ]
}
Do not include any other text or explanation, only the JSON object.`;
```
Once Claude replies, the service parses the text, utilizes regex boundaries to safely find the JSON brackets in case of markdown formatting (`/\{[\s\S]*\}/`), and maps it directly to the UI preview state.

### 2. The Recurrence Calculator
Because iOS and Android notifications use different weekday mapping, and the app counts **Monday** as `0` and **Sunday** as `6`, the notification service in `src/services/notifications.ts` dynamically translates local app calendars to the system Schedulable triggers.

It determines the precise upcoming target calendar date with the configured minute-offset:
```typescript
const triggerDate = calculateNextOccurrence(session.day, session.startTime, minutesBefore);
```
And triggers an Expo Calendar Alarm:
```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: language === 'tr' ? 'Ders Hatırlatıcısı' : 'Class Reminder',
    body: bodyText,
    data: { classId: session.id },
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    weekday: session.day === 6 ? 1 : session.day + 2, // Map App 0-6 to iOS/Android Calendar 1-7 (Sun=1)
    hour: triggerDate.getHours(),
    minute: triggerDate.getMinutes(),
    repeats: true,
  },
});
```

---

## Setup & Installation Guide

To run this application locally on your machine or on an interactive mobile device, please follow these instructions:

### Prerequisites
*   Make sure you have **Node.js (v18 or above)** installed.
*   Install the **Expo Go** application on your physical Android or iOS device from the Play Store / App Store to test wirelessly.

### 1. Clone & Install Dependencies
Navigate into your local workspace directory and install all packages:
```bash
# Navigate to project
cd class-reminder

# Install npm dependencies
npm install
```

### 2. Start the Development Server
Execute the start script to bundle the application using Expo Metro Bundler:
```bash
npm run start
```
*   This will launch the **Expo Developer Tools** in your terminal and print a **QR Code**.

### 3. Connect to a Mobile Device
*   **Android**: Open the *Expo Go* app, select "Scan QR Code", and scan the terminal QR.
*   **iOS**: Open your native *Camera* app, scan the terminal QR, and click the link to launch inside *Expo Go*.
*   *Make sure both your computer and phone are connected to the exact same Wi-Fi network.*

---

## Permissions Config
The application requests the following native device permissions configured securely in `app.json`:
*   **Camera Permission**: `NSCameraUsageDescription` / `android.permission.CAMERA` (For taking photos of schedules)
*   **Photo Library Access**: `expo-image-picker` permissions (For picking existing schedule screenshots)
*   **Push Notifications**: `expo-notifications` permissions (For triggering background calendar reminder alarms)
*   **Exact Alarm Scheduler**: `android.permission.SCHEDULE_EXACT_ALARM` (For micro-second precision wake triggers)

---

## Theme & Typography Token Settings
The system contains pre-configured theme colors (both light/dark variations) in [types/index.ts](file:///c:/Users/ardam/Desktop/class-reminder/src/types/index.ts):
*   **Dark Mode**: Sleek charcoal backgrounds (`#121214`), dark violet containers, high contrast white text, and strong neon purple `#8B5CF6` ambient glow vectors.
*   **Light Mode**: Soft lavender-grey backgrounds (`#F5F5FA`), crisp white cards with elegant shadows, dark charcoal text, and soft violet button highlights.

## License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/ardam/Desktop/class-reminder/LICENSE) file for details.
