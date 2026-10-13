# VinhKy Dashboard Mobile

React Native + Expo + TypeScript companion app for the existing VinhKy Python API. The mobile app is isolated from the web frontend and does not create a backend or database.

## Configure the API

Set `EXPO_PUBLIC_API_URL` in `frontend-app/.env` to the backend origin. The app adds `/api` automatically, so use an origin such as `https://your-backend.example.com`, not a per-screen endpoint.

For a backend running on the Windows PC, find its Wi-Fi IPv4 address with `ipconfig` and use `http://<PC-LAN-IP>:8000`, for example `http://192.168.1.20:8000`. Run FastAPI bound to `0.0.0.0:8000`, allow port 8000 through Windows Firewall, and keep the phone and PC on the same Wi-Fi. Do not use `localhost` or `127.0.0.1` on the iPhone.

The current backend has no authentication API, so this app does not fabricate a login flow or store tokens. Its informational login route explains this and returns to the dashboard.

## Run on Windows

```powershell
cd frontend-app
npm install
npx expo start --go
```

Install Expo Go on the iPhone, connect the iPhone and PC to the same Wi-Fi, then scan the QR code shown by Expo. Since this project also includes the EAS development-client package, `--go` explicitly selects Expo Go. If you run the plain `npx expo start` command instead, press `S` in the terminal until Expo Go is selected, then scan its QR code.

If LAN discovery is blocked, run:

```powershell
npx expo start --go --tunnel
```

## Check and build

```powershell
npm run typecheck
npx expo-doctor
npx expo export --platform all
```

Cloud iOS builds use EAS; local Xcode and a Mac are not needed for development or for EAS Build. An Apple Developer account and signing setup may be required for distributable iOS builds.

```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
```

Set `EXPO_PUBLIC_API_URL` in the EAS build environment as well when creating a cloud build. `EXPO_PUBLIC_*` variables are bundled into the app and must not contain secrets.

## Existing API endpoints used

- `GET /api/expenses` for daily expense totals.
- `GET /api/expense_items` and `POST /api/expense_items` for category-level expenses.
- `GET /api/revenues`, `POST /api/revenues`, and `PATCH /api/revenues/{id}` for revenue records.
- `GET /api/health/db` for backend/database connectivity status.
