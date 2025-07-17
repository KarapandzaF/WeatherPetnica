// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
    // Replace these values with your actual Firebase project configuration
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
let database;
let isConnected = false;

// Mock mode for demonstration (set to false when using real Firebase)
const MOCK_MODE = true;

if (MOCK_MODE) {
    // Mock Firebase service for demonstration
    console.log("Running in mock mode - simulating Firebase connection");
    
    // Simulate connection after a delay
    setTimeout(() => {
        isConnected = true;
        updateConnectionStatus();
        startMockDataStream();
    }, 1000);
} else {
    // Real Firebase initialization
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        
        // Check connection status
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            isConnected = snap.val() === true;
            updateConnectionStatus();
        });
        
        // Listen for real-time sensor data
        const sensorRef = database.ref('sensors/raspberry-pi-1');
        sensorRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateSensorDisplay(data);
                updateCharts(data);
                checkAlerts(data);
            }
        });
        
    } catch (error) {
        console.error("Firebase initialization error:", error);
        isConnected = false;
        updateConnectionStatus();
    }
}

function updateConnectionStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const connectionText = document.getElementById('connectionText');
    const firebaseStatus = document.getElementById('firebaseStatus');
    
    if (isConnected) {
        statusIndicator.className = 'status-indicator connected';
        connectionText.textContent = 'Connected';
        if (firebaseStatus) {
            firebaseStatus.className = 'status-indicator connected';
        }
    } else {
        statusIndicator.className = 'status-indicator disconnected';
        connectionText.textContent = 'Disconnected';
        if (firebaseStatus) {
            firebaseStatus.className = 'status-indicator disconnected';
        }
    }
}

// Mock data generation for demonstration
let mockDataInterval;
const historicalData = [];

function generateMockSensorData() {
    return {
        temperature: 20 + Math.random() * 10, // 20-30°C
        humidity: 40 + Math.random() * 40,    // 40-80%
        gasLevel: Math.random() * 100,        // 0-100 ppm
        smokeDetected: Math.random() > 0.95,  // 5% chance
        presenceDetected: Math.random() > 0.6, // 40% chance
        timestamp: Date.now(),
        deviceId: 'raspberry-pi-1'
    };
}

function startMockDataStream() {
    // Generate initial historical data
    const now = Date.now();
    for (let i = 144; i >= 0; i--) {
        historicalData.push({
            ...generateMockSensorData(),
            timestamp: now - (i * 10 * 60 * 1000) // Every 10 minutes for 24 hours
        });
    }
    
    // Start real-time updates
    mockDataInterval = setInterval(() => {
        const newData = generateMockSensorData();
        historicalData.push(newData);
        
        // Keep only last 144 points (24 hours)
        if (historicalData.length > 144) {
            historicalData.shift();
        }
        
        updateSensorDisplay(newData);
        updateCharts(newData);
        checkAlerts(newData);
    }, 2000); // Update every 2 seconds
}

// Function to send data to Firebase (for Raspberry Pi)
function sendSensorDataToFirebase(sensorData) {
    if (!MOCK_MODE && database) {
        const sensorRef = database.ref('sensors/raspberry-pi-1');
        sensorRef.set({
            ...sensorData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log("Sensor data sent successfully");
        }).catch((error) => {
            console.error("Error sending sensor data:", error);
        });
    }
}

// Export functions for use in other scripts
window.firebaseService = {
    isConnected: () => isConnected,
    sendData: sendSensorDataToFirebase,
    getHistoricalData: () => historicalData
};