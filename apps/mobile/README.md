# TAPG Mobile Application

Professional React Native mobile app for TAPG maintenance management system. Designed for field operators and mechanics to manage work orders, perform daily checks (P2H), and scan assets via QR code.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 📱 App Features

### Implemented ✅
- **Authentication**: Secure login with token-based auth
- **Dashboard**: Overview of work orders and daily tasks
- **Work Orders**: View and filter work orders by status
- **Workshop Flow**: Registration, progress, and mechanic station flow
- **Assets & HM Tracking**: Unit assignment, asset detail, and HM recording
- **P2H**: Daily checklist submission and history
- **Breakdown Reports**: Create and manage breakdown reports
- **Findings**: Record and review asset findings
- **Guide & Schedule**: Operational guide and maintenance calendar
- **QR Scanner**: Scan asset QR codes
- **Notifications**: Real-time notification system
- **User Profile**: View profile and app settings
- **Responsive UI**: Works on all phone sizes

## 🎨 Design

- **Color Scheme**: Green + White professional theme
- **Components**: Reusable, well-documented components
- **Typography**: Clear, accessible typography scale
- **Spacing**: Consistent spacing system
- **Icons**: Material Design icons

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Language**: JavaScript
- **Secure Storage**: Expo SecureStore
- **Camera**: Expo Camera + Barcode Scanner

## 📁 Project Structure
Core standard:

- `app/` : route declarations only
- `screens/routes/` : screen implementations only
- `components/` : reusable UI components
- `services/` : API/service layer
- `stores/` : Zustand stores
- `hooks/` : reusable hooks
- `utils/` : helpers/utilities

Route groups:

- `app/(auth)` : authentication routes
- `app/(tabs)` : main application routes
- `app/(utility)` : utility routes such as notifications and scanner

Example:

```text
app/
  _layout.js
  index.js
  (auth)/
    _layout.js
    login.js
  (tabs)/
    _layout.js
    index.js
    unit-assets.js
    unit-assets/[id].js
    workshop/index.js
    workshop/detail.js
  (utility)/
    notifications.js
    scanner.js

screens/routes/
  auth/
    LoginScreen.js
  root/
    SplashScreen.js
  utility/
    NotificationsScreen.js
    ScannerScreen.js
  tabs/
    home/DashboardScreen.js
    assets/AssetsScreen.js
    assets/AssetDetailScreen.js
    mechanic/MechanicProcessScreen.js
    workshop/WorkshopRegistrationScreen.js
```

Notes:

- Route files in `app/` should stay thin and only re-export screen implementations.
- Avoid placing screen business/UI implementation directly in `app/`.
- Use `unit-assets` as the safe route segment for the asset list/detail flow.

## 🔐 Security

- ✅ Token-based authentication (JWT)
- ✅ Secure token storage (Expo SecureStore)
- ✅ Auto-logout on token expiry
- ✅ HTTPS API communication
- ✅ Permission handling (camera, location)

## 🌐 API Integration

The app connects to TAPG backend API (`/api/v1`):
- Base URL: Configured via `.env.local`
- Auth: Bearer token in Authorization header
- Format: JSON request/response
- Timeout: 30 seconds
- Retry: Automatic retry on failure

## 📦 Build & Distribution

### Development
```bash
npm start
```

### Production APK (Android)
```bash
npm run android
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android --profile production
```

## 🧪 Testing

For code quality:
```bash
npm run lint
```

## 📚 Documentation

- **AGENTS.md** - Expo version reference
- **components/** - Reusable UI components
- **screens/routes/** - Screen implementation source
- **app/** - Expo Router route entry points

## 🐛 Known Issues

None currently. Report issues via project issue tracker.

## 🚀 Deployment

### To Google Play Store
1. Build AAB: `eas build --platform android --profile production`
2. Upload to Google Play Console
3. Create release and submit for review

### To Apple App Store
1. Build for iOS: `eas build --platform ios --profile production`
2. Upload to App Store Connect using Transporter
3. Create TestFlight build and App Store release

## 📝 Environment Variables

```
EXPO_PUBLIC_API_BASE_URL=http://103.247.10.115:8000/api/v1
EXPO_PUBLIC_APP_ENV=development
```

See `.env.example` for complete list.

## 🤝 Contributing

When adding features:
1. Keep route files in `app/` as wrappers only.
2. Add new screen implementations under `screens/routes/` by route domain.
3. Reuse existing components, services, stores, and hooks before creating new ones.
4. Prefer safe route segment names and avoid ambiguous/reserved names.
5. Test the affected flow and run `npm run lint`.
6. Update documentation when route structure changes.

## 📄 License

© 2026 PT. Terusan Abadi Graha. All rights reserved.

## 📧 Support

For technical support or feature requests, contact the development team.

---

**Current Version**: 1.0.0  
**Last Updated**: June 3, 2026  
**Status**: Ready for Development & Testing
