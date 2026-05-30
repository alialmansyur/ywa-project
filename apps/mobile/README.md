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
- **QR Scanner**: Scan asset QR codes
- **Notifications**: Real-time notification system
- **User Profile**: View profile and app settings
- **Responsive UI**: Works on all phone sizes
- **Dark Mode Support**: System-wide theme support

### Coming Soon 🔜
- P2H Checklist with photo uploads
- Asset details and HM tracking
- Breakdown emergency reporting
- Offline sync capability
- Push notifications (FCM)
- Signature capture

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
- **Language**: TypeScript
- **Secure Storage**: Expo SecureStore
- **Camera**: Expo Camera + Barcode Scanner

## 📁 Project Structure

See `SETUP.md` for detailed project structure and file organization.

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

See `SETUP.md` for detailed build instructions.

## 🧪 Testing

Manual testing checklist available in `SETUP.md`.

For code quality:
```bash
npm run lint
```

## 📚 Documentation

- **SETUP.md** - Detailed setup and configuration
- **AGENTS.md** - Expo version reference
- **types/index.ts** - TypeScript interfaces
- **components/** - Component documentation in files

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
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api/v1
EXPO_PUBLIC_APP_ENV=development
```

See `.env.example` for complete list.

## 🤝 Contributing

When adding features:
1. Follow the existing component structure
2. Use TypeScript strict mode
3. Add JSDoc comments for public APIs
4. Test on both Android and iOS
5. Update documentation

## 📄 License

© 2026 PT. Terusan Abadi Graha. All rights reserved.

## 📧 Support

For technical support or feature requests, contact the development team.

---

**Current Version**: 1.0.0  
**Last Updated**: May 21, 2026  
**Status**: Ready for Development & Testing
