# IoT Sensor Dashboard - Vanilla JavaScript

A sleek, real-time IoT sensor dashboard built with vanilla JavaScript, HTML, and CSS that integrates with Firebase to display sensor data from Raspberry Pi devices.

## Features

- **Real-time Data Display**: Live sensor readings for temperature, humidity, gas levels, smoke, and presence detection
- **Interactive Charts**: Real-time line charts showing environmental trends and detection levels
- **Alert System**: Visual and audio alerts for critical sensor values
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Firebase Integration**: Seamless real-time data synchronization
- **System Monitoring**: Raspberry Pi status and connection quality indicators
- **Detailed Readings**: Comprehensive sensor data table with historical min/max values

## Sensor Data Types

1. **Temperature** (°C) - Continuous monitoring with normal range 18-28°C
2. **Humidity** (%RH) - Relative humidity with optimal range 40-60%
3. **Gas Level** (ppm) - Air quality monitoring with warning at 40ppm, critical at 60ppm
4. **Smoke Detection** (Boolean) - Digital smoke sensor with immediate alerts
5. **Presence Detection** (Boolean) - PIR motion sensor for occupancy detection

## Files Structure

```
├── index.html              # Main dashboard HTML
├── styles.css              # Complete styling and responsive design
├── firebase-config.js      # Firebase configuration and mock data service
├── dashboard.js            # Dashboard logic and UI updates
├── raspberry-pi-client.js  # Raspberry Pi sensor client script
└── README.md              # This file
```

## Quick Setup

### 1. Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Update `firebase-config.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

4. Set `MOCK_MODE = false` in `firebase-config.js` for production

### 2. Dashboard Setup

1. Open `index.html` in a web browser
2. The dashboard will connect to Firebase automatically
3. In mock mode, it will show simulated sensor data

### 3. Raspberry Pi Setup

1. Install Node.js on your Raspberry Pi
2. Install Firebase: `npm install firebase`
3. Copy `raspberry-pi-client.js` to your Raspberry Pi
4. Update the Firebase configuration in the script
5. Replace mock sensor functions with actual sensor reading code
6. Run: `node raspberry-pi-client.js`

## Raspberry Pi Sensor Integration

### Supported Sensors

- **Temperature**: DS18B20 (1-Wire)
- **Humidity**: DHT22 (Digital)
- **Gas**: MQ-2 (Analog via ADC)
- **Smoke**: Digital smoke detector
- **Motion**: PIR sensor (Digital)

### Example Wiring

```
DS18B20 Temperature:    GPIO 4  (1-Wire)
DHT22 Humidity:         GPIO 17 (Digital)
MQ-2 Gas Sensor:        MCP3008 ADC Channel 0
Smoke Detector:         GPIO 18 (Digital)
PIR Motion Sensor:      GPIO 24 (Digital)
```

### Installing Required Libraries

```bash
# On Raspberry Pi
npm install firebase
npm install node-dht-sensor  # For DHT22
npm install mcp3008.js       # For analog sensors
npm install onoff            # For GPIO control
```

## Firebase Database Structure

```json
{
  "sensors": {
    "raspberry-pi-1": {
      "temperature": 23.5,
      "humidity": 55.2,
      "gasLevel": 15.8,
      "smokeDetected": false,
      "presenceDetected": true,
      "timestamp": 1642678800000,
      "deviceId": "raspberry-pi-1"
    }
  }
}
```

## Customization

### Alert Thresholds

Edit the threshold values in `dashboard.js`:

```javascript
// Temperature thresholds
if (value < 15 || value > 30) return { level: 'critical', text: 'Critical' };
if (value < 18 || value > 28) return { level: 'warning', text: 'Warning' };

// Humidity thresholds  
if (value < 30 || value > 70) return { level: 'critical', text: 'Critical' };
if (value < 40 || value > 60) return { level: 'warning', text: 'Warning' };

// Gas thresholds
if (value > 60) return { level: 'critical', text: 'Critical' };
if (value > 40) return { level: 'warning', text: 'Warning' };
```

### Colors and Styling

All colors and styling can be customized in `styles.css`. Key CSS custom properties:

```css
:root {
  --sensor-normal: #10b981;
  --sensor-warning: #f59e0b;  
  --sensor-critical: #ef4444;
}
```

### Data Update Frequency

Change the update interval in `raspberry-pi-client.js`:

```javascript
startMonitoring(2000); // 2 seconds (2000ms)
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Mobile Support

The dashboard is fully responsive and optimized for:
- iOS Safari
- Chrome Mobile
- Samsung Internet
- Firefox Mobile

## Troubleshooting

### Dashboard Not Updating
1. Check browser console for Firebase connection errors
2. Verify Firebase configuration is correct
3. Ensure Realtime Database rules allow read/write access

### Raspberry Pi Not Sending Data
1. Check internet connection on Pi
2. Verify Firebase configuration matches
3. Check sensor wiring and GPIO pin assignments
4. Review logs in `/home/pi/sensor_logs.txt`

### Chart Not Displaying
1. Ensure Chart.js is loading properly
2. Check browser console for JavaScript errors
3. Verify canvas elements are present in DOM

## Security Notes

- Use Firebase security rules to restrict database access
- Consider using Firebase Authentication for production
- Monitor Firebase usage quotas
- Regularly update Firebase SDK versions

## Performance

- Dashboard updates every 2 seconds
- Charts display last 20 data points for smooth performance
- Historical data limited to 144 points (24 hours)
- Automatic cleanup of old alert messages

## License

This project is open source and available under the MIT License.