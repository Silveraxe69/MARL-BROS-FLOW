# Flow Bus System - Passenger App

A React Native web application for passengers to track buses in real-time, plan journeys, and get ETA predictions.

## Features

✅ **Login with OTP** - Simple phone-based authentication (simulated for demo)
✅ **Route Search** - Find buses between any two stops  
✅ **Live Bus Tracking** - Real-time map view of all buses
✅ **Next Bus Prediction** - See ETA for upcoming buses at any stop
✅ **Crowd Status** - View real-time crowd levels (Low/Medium/Full)
✅ **Women Bus Preference** - Filter to prioritize pink buses for women

## Tech Stack

- **Framework**: React Native + Expo (Web-enabled)
- **Language**: JavaScript
- **UI**: React Native Paper
- **Maps**: react-native-maps (with web fallback)
- **State**: React Context API
- **Navigation**: React Navigation
- **Backend**: Axios + Socket.io-client (ready for API integration)

## Installation

### Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2: Install Expo Dependencies

\`\`\`bash
npx expo install
\`\`\`

### Step 3: Run on Web

\`\`\`bash
npx expo start --web
\`\`\`

The app will open in your default browser at `http://localhost:19006`

## Usage

### Login
- Enter your name and phone number (10 digits)
- Click "Send OTP"
- Enter any 4-digit OTP (e.g., 1234)
- Click "Login"

### Search for Buses
1. On the home screen, select "From Stop"
2. Select "To Stop"
3. Click "Search Buses"
4. View available routes and buses

### View Live Map
- Click the "Live Map" FAB button on the home screen
- See all buses and stops on an interactive map (native only, web shows fallback)

### Settings
- Toggle "Prefer Pink Buses" to see women-only buses first
- Logout when done

## Data Files

All data is stored locally in `/src/data/`:
- `buses.json` - Bus information
- `routes.json` - Route definitions
- `busStops.json` - All bus stops with coordinates
- `busStopSequence.json` - Stop sequences for each route
- `liveBusLocation.json` - Current bus positions
- `busEta.json` - ETA predictions
- `crowdStatus.json` - Real-time crowd levels

## API Integration (Ready)

The app is ready to connect to a backend API:
- Update `API_BASE_URL` in `src/services/api.js`
- Update `SOCKET_URL` in `src/services/socket.js`
- Uncomment API calls in screens to use live data

## Folder Structure

\`\`\`
passenger-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # API and Socket services
│   ├── context/         # Auth context
│   ├── data/            # JSON datasets
│   └── utils/           # Utility functions
├── App.js              # Main app entry
├── package.json        # Dependencies
└── app.json           # Expo configuration
\`\`\`

## Troubleshooting

### Port Already in Use
\`\`\`bash
# Kill processes on port 19006
npx kill-port 19006
\`\`\`

### Clear Cache
\`\`\`bash
npx expo start --web --clear
\`\`\`

## License

MIT © Flow Bus System 2026
