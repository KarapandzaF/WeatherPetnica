// Dashboard JavaScript - Handles UI updates and interactions

// Chart instances
let environmentChart;
let detectionChart;

// Current sensor data
let currentSensorData = null;

// Alert system
let activeAlerts = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    populateReadingsTable();
    updateAlertsDisplay();
});

// Initialize Chart.js charts
function initializeCharts() {
    // Environment chart (Temperature & Humidity)
    const envCtx = document.getElementById('environmentChart').getContext('2d');
    environmentChart = new Chart(envCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
            elements: {
                point: {
                    radius: 0,
                },
            },
        },
    });

    // Detection chart (Gas Level)
    const detCtx = document.getElementById('detectionChart').getContext('2d');
    detectionChart = new Chart(detCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Gas Level (ppm)',
                    data: [],
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
            elements: {
                point: {
                    radius: 0,
                },
            },
        },
    });
}

// Update sensor display with new data
function updateSensorDisplay(data) {
    currentSensorData = data;
    
    // Temperature
    updateSensorCard('temp', data.temperature, '°C', 'temperature');
    
    // Humidity
    updateSensorCard('humidity', data.humidity, '%', 'humidity');
    
    // Gas Level
    updateSensorCard('gas', data.gasLevel, 'ppm', 'gas');
    
    // Smoke Detection
    const smokeValue = data.smokeDetected ? 'DETECTED' : 'CLEAR';
    updateDetectionCard('smoke', smokeValue, data.smokeDetected);
    
    // Presence Detection
    const presenceValue = data.presenceDetected ? 'DETECTED' : 'CLEAR';
    updateDetectionCard('presence', presenceValue, data.presenceDetected);
    
    // Update readings table
    updateReadingsTableData(data);
}

// Update individual sensor card
function updateSensorCard(sensorType, value, unit, statusType) {
    const valueElement = document.getElementById(`${sensorType}Value`);
    const statusElement = document.getElementById(`${sensorType}Status`);
    const statusTextElement = document.getElementById(`${sensorType}StatusText`);
    
    if (valueElement) {
        valueElement.textContent = typeof value === 'number' ? value.toFixed(1) : value;
        valueElement.classList.add('data-update');
        setTimeout(() => valueElement.classList.remove('data-update'), 300);
    }
    
    const status = getStatusInfo(value, statusType);
    
    if (statusElement) {
        statusElement.className = `status-dot ${status.level}`;
    }
    
    if (statusTextElement) {
        statusTextElement.textContent = status.text;
        statusTextElement.className = `sensor-status-text ${status.level}`;
    }
}

// Update detection cards (smoke, presence)
function updateDetectionCard(sensorType, value, isDetected) {
    const valueElement = document.getElementById(`${sensorType}Value`);
    const statusElement = document.getElementById(`${sensorType}Status`);
    const statusTextElement = document.getElementById(`${sensorType}StatusText`);
    
    if (valueElement) {
        valueElement.textContent = value;
        valueElement.classList.add('data-update');
        setTimeout(() => valueElement.classList.remove('data-update'), 300);
    }
    
    const status = isDetected ? 'critical' : 'normal';
    const statusText = isDetected ? 'Detected' : 'Normal';
    
    if (statusElement) {
        statusElement.className = `status-dot ${status}`;
    }
    
    if (statusTextElement) {
        statusTextElement.textContent = statusText;
        statusTextElement.className = `sensor-status-text ${status}`;
    }
}

// Get status information for sensor values
function getStatusInfo(value, type) {
    switch (type) {
        case 'temperature':
            if (value < 15 || value > 30) return { level: 'critical', text: 'Critical' };
            if (value < 18 || value > 28) return { level: 'warning', text: 'Warning' };
            return { level: 'normal', text: 'Normal' };
        
        case 'humidity':
            if (value < 30 || value > 70) return { level: 'critical', text: 'Critical' };
            if (value < 40 || value > 60) return { level: 'warning', text: 'Warning' };
            return { level: 'normal', text: 'Normal' };
        
        case 'gas':
            if (value > 60) return { level: 'critical', text: 'Critical' };
            if (value > 40) return { level: 'warning', text: 'Warning' };
            return { level: 'normal', text: 'Normal' };
        
        default:
            return { level: 'normal', text: 'Normal' };
    }
}

// Update charts with new data
function updateCharts(newData) {
    const historicalData = window.firebaseService.getHistoricalData();
    const last20Points = historicalData.slice(-20);
    
    // Update labels (timestamps)
    const labels = last20Points.map(d => new Date(d.timestamp).toLocaleTimeString());
    
    // Update environment chart
    environmentChart.data.labels = labels;
    environmentChart.data.datasets[0].data = last20Points.map(d => d.temperature);
    environmentChart.data.datasets[1].data = last20Points.map(d => d.humidity);
    environmentChart.update('none');
    
    // Update detection chart
    detectionChart.data.labels = labels;
    detectionChart.data.datasets[0].data = last20Points.map(d => d.gasLevel);
    detectionChart.update('none');
}

// Check for alerts based on sensor data
function checkAlerts(data) {
    let newAlerts = [];
    
    // Check temperature
    if (data.temperature > 30 || data.temperature < 15) {
        newAlerts.push({
            type: 'temperature',
            severity: 'critical',
            message: 'Temperature outside safe range',
            timestamp: Date.now()
        });
    }
    
    // Check humidity
    if (data.humidity > 70 || data.humidity < 30) {
        newAlerts.push({
            type: 'humidity',
            severity: 'warning',
            message: 'Humidity level abnormal',
            timestamp: Date.now()
        });
    }
    
    // Check gas level
    if (data.gasLevel > 60) {
        newAlerts.push({
            type: 'gas',
            severity: 'critical',
            message: 'Gas level critically high',
            timestamp: Date.now()
        });
    }
    
    // Check smoke
    if (data.smokeDetected) {
        newAlerts.push({
            type: 'smoke',
            severity: 'critical',
            message: 'Smoke detected in sensor zone',
            timestamp: Date.now()
        });
    }
    
    // Check presence (informational)
    if (data.presenceDetected && currentSensorData && !currentSensorData.presenceDetected) {
        newAlerts.push({
            type: 'presence',
            severity: 'info',
            message: 'Motion detected',
            timestamp: Date.now()
        });
    }
    
    // Add new alerts
    if (newAlerts.length > 0) {
        activeAlerts = [...newAlerts, ...activeAlerts].slice(0, 10); // Keep last 10 alerts
        
        // Show critical alert banner
        const criticalAlert = newAlerts.find(alert => alert.severity === 'critical');
        if (criticalAlert) {
            showAlertBanner(criticalAlert.message);
        }
        
        updateAlertsDisplay();
        updateAlertBadge();
    }
}

// Show alert banner
function showAlertBanner(message) {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    
    if (alertBanner && alertMessage) {
        alertMessage.textContent = message;
        alertBanner.style.display = 'block';
    }
}

// Update alert badge count
function updateAlertBadge() {
    const alertBadge = document.getElementById('alertBadge');
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
    
    if (alertBadge) {
        if (criticalAlerts > 0) {
            alertBadge.textContent = criticalAlerts;
            alertBadge.style.display = 'flex';
        } else {
            alertBadge.style.display = 'none';
        }
    }
}

// Populate readings table structure
function populateReadingsTable() {
    const tableBody = document.getElementById('readingsTableBody');
    
    const sensors = [
        { name: 'Temperature', icon: 'fas fa-thermometer-half', iconColor: 'color: #2563eb;', unit: '°C', type: 'temperature' },
        { name: 'Humidity', icon: 'fas fa-tint', iconColor: 'color: #0891b2;', unit: '%', type: 'humidity' },
        { name: 'Gas Level', icon: 'fas fa-wind', iconColor: 'color: #d97706;', unit: 'ppm', type: 'gas' },
        { name: 'Smoke Detection', icon: 'fas fa-exclamation-triangle', iconColor: 'color: #dc2626;', unit: '', type: 'smoke' },
        { name: 'Presence Detection', icon: 'fas fa-user-check', iconColor: 'color: #16a34a;', unit: '', type: 'presence' }
    ];
    
    tableBody.innerHTML = sensors.map((sensor, index) => `
        <tr id="tableRow${sensor.type}">
            <td>
                <div class="sensor-name">
                    <i class="${sensor.icon}" style="${sensor.iconColor}"></i>
                    <span>${sensor.name}</span>
                </div>
            </td>
            <td id="tableValue${sensor.type}">--</td>
            <td id="tableRange${sensor.type}">--</td>
            <td id="tableStatus${sensor.type}">
                <span class="badge normal">Loading</span>
            </td>
            <td id="tableTime${sensor.type}">--</td>
        </tr>
    `).join('');
}

// Update readings table with current data
function updateReadingsTableData(data) {
    if (!data) return;
    
    const historicalData = window.firebaseService.getHistoricalData();
    const formatTime = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds} sec ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hours ago`;
    };
    
    const getMinMax = (key) => {
        if (historicalData.length === 0) return { min: 0, max: 0 };
        const values = historicalData.map(d => d[key]).filter(v => typeof v === 'number');
        return { min: Math.min(...values), max: Math.max(...values) };
    };
    
    // Temperature
    const tempRange = getMinMax('temperature');
    document.getElementById('tableValuetemperature').textContent = `${data.temperature.toFixed(1)}°C`;
    document.getElementById('tableRangetemperature').textContent = `${tempRange.min.toFixed(1)} / ${tempRange.max.toFixed(1)}°C`;
    document.getElementById('tableTimetemperature').textContent = formatTime(data.timestamp);
    
    const tempStatus = getStatusInfo(data.temperature, 'temperature');
    document.getElementById('tableStatustemperature').innerHTML = `<span class="badge ${tempStatus.level}">${tempStatus.text}</span>`;
    
    // Humidity
    const humidityRange = getMinMax('humidity');
    document.getElementById('tableValuehumidity').textContent = `${data.humidity.toFixed(1)}%`;
    document.getElementById('tableRangehumidity').textContent = `${humidityRange.min.toFixed(1)} / ${humidityRange.max.toFixed(1)}%`;
    document.getElementById('tableTimehumidity').textContent = formatTime(data.timestamp);
    
    const humidityStatus = getStatusInfo(data.humidity, 'humidity');
    document.getElementById('tableStatushumidity').innerHTML = `<span class="badge ${humidityStatus.level}">${humidityStatus.text}</span>`;
    
    // Gas
    const gasRange = getMinMax('gasLevel');
    document.getElementById('tableValuegas').textContent = `${data.gasLevel.toFixed(1)} ppm`;
    document.getElementById('tableRangegas').textContent = `${gasRange.min.toFixed(1)} / ${gasRange.max.toFixed(1)} ppm`;
    document.getElementById('tableTimegas').textContent = formatTime(data.timestamp);
    
    const gasStatus = getStatusInfo(data.gasLevel, 'gas');
    document.getElementById('tableStatusgas').innerHTML = `<span class="badge ${gasStatus.level}">${gasStatus.text}</span>`;
    
    // Smoke
    document.getElementById('tableValuesmoke').textContent = data.smokeDetected ? 'DETECTED' : 'CLEAR';
    document.getElementById('tableRangesmoke').textContent = '--';
    document.getElementById('tableTimesmoke').textContent = formatTime(data.timestamp);
    document.getElementById('tableStatussmoke').innerHTML = `<span class="badge ${data.smokeDetected ? 'critical' : 'normal'}">${data.smokeDetected ? 'Detected' : 'Normal'}</span>`;
    
    // Presence
    document.getElementById('tableValuepresence').textContent = data.presenceDetected ? 'DETECTED' : 'CLEAR';
    document.getElementById('tableRangepresence').textContent = '--';
    document.getElementById('tableTimepresence').textContent = formatTime(data.timestamp);
    document.getElementById('tableStatuspresence').innerHTML = `<span class="badge ${data.presenceDetected ? 'warning' : 'normal'}">${data.presenceDetected ? 'Detected' : 'Normal'}</span>`;
}

// Update alerts display
function updateAlertsDisplay() {
    const alertsContent = document.getElementById('alertsContent');
    
    if (activeAlerts.length === 0) {
        alertsContent.innerHTML = `
            <div class="alert-item success">
                <i class="fas fa-check-circle"></i>
                <div class="alert-item-content">
                    <p class="alert-item-message">No active alerts</p>
                    <p class="alert-item-time">All systems normal</p>
                </div>
            </div>
        `;
        return;
    }
    
    alertsContent.innerHTML = activeAlerts.slice(0, 3).map(alert => {
        const alertClass = alert.severity === 'critical' ? 'warning' : 
                          alert.severity === 'warning' ? 'warning' : 'info';
        const icon = alert.severity === 'critical' ? 'fas fa-exclamation-triangle' :
                    alert.severity === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        
        const timeAgo = Math.floor((Date.now() - alert.timestamp) / 60000);
        const timeText = timeAgo < 1 ? 'Just now' : `${timeAgo} min ago`;
        
        return `
            <div class="alert-item ${alertClass}">
                <i class="${icon}"></i>
                <div class="alert-item-content">
                    <p class="alert-item-message">${alert.message}</p>
                    <p class="alert-item-time">${timeText}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Alert close button
    const alertClose = document.getElementById('alertClose');
    if (alertClose) {
        alertClose.addEventListener('click', () => {
            document.getElementById('alertBanner').style.display = 'none';
        });
    }
    
    // Chart time range buttons (placeholder functionality)
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from siblings
            e.target.parentNode.querySelectorAll('.chart-btn').forEach(sibling => {
                sibling.classList.remove('active');
            });
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Here you would implement different time ranges
            console.log('Time range changed to:', e.target.textContent);
        });
    });
}