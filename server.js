const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const serialPort = new SerialPort({ path: 'COM8', baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

serialPort.on('open', () => {
  console.log('Serial Port Opened');
});

serialPort.on('error', (err) => {
  console.error('Error: ', err.message);
});

parser.on('data', (data) => {
  console.log('Data:', data);
  try {
    const jsonData = JSON.parse(data);
    io.emit('sensorData', jsonData);
  } catch (e) {
    console.error('Error parsing JSON:', e);
  }
});

app.use(express.static('public'));

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
