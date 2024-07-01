const socket = io();

socket.on('sensorData', (data) => {
  document.getElementById('temperature').textContent = data.temperature;
  document.getElementById('humidity').textContent = data.humidity;
});
