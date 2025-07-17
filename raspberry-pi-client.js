// Raspberry Pi Client Script
// This script should be run on your Raspberry Pi to send sensor data to Firebase

// Firebase configuration - Copy this from your Firebase project
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Import Firebase (if using Node.js on Raspberry Pi)
// npm install firebase
const firebase = require('firebase/app');
require('firebase/database');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Simulated sensor reading functions
// Replace these with actual sensor reading code for your Raspberry Pi

function readTemperatureSensor() {
    // Example: Reading from DS18B20 temperature sensor
    // const fs = require('fs');
    // const devicePath = '/sys/bus/w1/devices/28-xxxxxxxxxxxx/w1_slave';
    // const data = fs.readFileSync(devicePath, 'utf8');
    // const temperature = parseFloat(data.split('t=')[1]) / 1000;
    // return temperature;
    
    // Mock data for demonstration
    return 20 + Math.random() * 10;
}

function readHumiditySensor() {
    // Example: Reading from DHT22 humidity sensor
    // You might use a library like 'node-dht-sensor'
    // const sensor = require('node-dht-sensor');
    // const humidity = sensor.read(22, 4).humidity; // DHT22 on GPIO pin 4
    // return humidity;
    
    // Mock data for demonstration
    return 40 + Math.random() * 40;
}

function readGasSensor() {
    // Example: Reading from MQ-2 gas sensor via ADC
    // const mcp3008 = require('mcp3008.js');
    // const adc = mcp3008.open(0, {speedHz: 20000}); // SPI channel 0
    // const reading = adc.read(0); // Channel 0
    // const gasLevel = (reading / 1024) * 100; // Convert to percentage
    // return gasLevel;
    
    // Mock data for demonstration
    return Math.random() * 100;
}

function readSmokeSensor() {
    // Example: Reading from smoke sensor (digital pin)
    // const Gpio = require('onoff').Gpio;
    // const smokePin = new Gpio(18, 'in'); // GPIO pin 18
    // return smokePin.readSync() === 1;
    
    // Mock data for demonstration
    return Math.random() > 0.95;
}

function readPresenceSensor() {
    // Example: Reading from PIR motion sensor
    // const Gpio = require('onoff').Gpio;
    // const pirPin = new Gpio(24, 'in', 'both'); // GPIO pin 24
    // return pirPin.readSync() === 1;
    
    // Mock data for demonstration
    return Math.random() > 0.6;
}

// Function to collect all sensor data
function collectSensorData() {
    return {
        temperature: readTemperatureSensor(),
        humidity: readHumiditySensor(),
        gasLevel: readGasSensor(),
        smokeDetected: readSmokeSensor(),
        presenceDetected: readPresenceSensor(),
        timestamp: Date.now(),
        deviceId: 'raspberry-pi-1'
    };
}

// Function to send data to Firebase
async function sendSensorData() {
    try {
        const sensorData = collectSensorData();
        
        // Send to Firebase Realtime Database
        await database.ref('sensors/raspberry-pi-1').set({
            ...sensorData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('Sensor data sent successfully:', sensorData);
        
        // Optional: Also log to local file
        logDataLocally(sensorData);
        
    } catch (error) {
        console.error('Error sending sensor data:', error);
        
        // Fallback: Save to local file if Firebase fails
        logDataLocally(collectSensorData());
    }
}

// Function to log data locally as backup
function logDataLocally(data) {
    const fs = require('fs');
    const logEntry = `${new Date().toISOString()}: ${JSON.stringify(data)}\n`;
    
    fs.appendFile('/home/pi/sensor_logs.txt', logEntry, (err) => {
        if (err) {
            console.error('Error writing to local log:', err);
        }
    });
}

// Function to start continuous monitoring
function startMonitoring(intervalMs = 2000) {
    console.log(`Starting sensor monitoring every ${intervalMs}ms...`);
    
    // Send initial reading
    sendSensorData();
    
    // Set up interval for continuous readings
    setInterval(() => {
        sendSensorData();
    }, intervalMs);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down sensor monitoring...');
    process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Log error locally
    const fs = require('fs');
    const errorLog = `${new Date().toISOString()}: ERROR - ${error.message}\n`;
    fs.appendFile('/home/pi/sensor_errors.txt', errorLog, () => {});
});

// Start monitoring if this script is run directly
if (require.main === module) {
    // Check internet connectivity before starting
    const checkConnection = () => {
        const https = require('https');
        const options = {
            hostname: 'www.google.com',
            port: 443,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            console.log('Internet connection confirmed');
            startMonitoring(2000); // Send data every 2 seconds
        });
        
        req.on('error', (error) => {
            console.error('No internet connection, waiting...');
            setTimeout(checkConnection, 10000); // Retry in 10 seconds
        });
        
        req.on('timeout', () => {
            console.error('Connection timeout, waiting...');
            req.destroy();
            setTimeout(checkConnection, 10000);
        });
        
        req.end();
    };
    
    console.log('Raspberry Pi Sensor Client Starting...');
    checkConnection();
}

// Export functions for use in other modules
module.exports = {
    collectSensorData,
    sendSensorData,
    startMonitoring
};