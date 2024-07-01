# Arduino Real-Time Temperature and Humidity Monitor

This project demonstrates how to read temperature and humidity data from a DHT11 sensor connected to an Arduino and display the data in real-time on a web page using Node.js, Express, and WebSockets.

## Hardware Requirements

- Arduino board (e.g., Arduino Uno)
- DHT11 sensor
- Connecting wires

## Software Requirements

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- Arduino IDE

## Setup Instructions

### Arduino Setup

1. Connect the DHT11 sensor to the Arduino:
   - VCC to 5V
   - GND to GND
   - DATA to digital pin 4

2. Upload the following code to the Arduino using the Arduino IDE:

    ```cpp
    #include <DHT11.h>

    DHT11 dht11(4);

    void setup() {
        Serial.begin(9600);
    }

    void loop() {
        delay(2000);

        float h = dht11.readHumidity();
        float t = dht11.readTemperature();

        if (isnan(h) || isnan(t)) {
            Serial.println("Failed to read from DHT sensor!");
            return;
        }

        // Send data in JSON format
        Serial.print("{\"temperature\":");
        Serial.print(t);
        Serial.print(", \"humidity\":");
        Serial.print(h);
        Serial.println("}");
    }
    ```

### Node.js Setup

1. Clone this repository or create a new directory and navigate to it:

    ```bash
    mkdir arduino-real-time
    cd arduino-real-time
    ```

2. Initialize a new Node.js project and install dependencies:

    ```bash
    npm init -y
    npm install express serialport @serialport/parser-readline socket.io
    ```

3. Create a file named `server.js` with the following content:

    ```javascript
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
    ```

4. Create a `public` directory and add the following files:

    #### `public/index.html`

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Arduino Data</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Temperature and Humidity Sensor</h1>
        </header>
        <main>
          <div id="data">
            <h2>Current Conditions</h2>
            <div class="temperature">
              <p>Temperature: <span id="temperature">--</span> °C</p>
            </div>
            <div class="humidity">
              <p>Humidity: <span id="humidity">--</span> %</p>
            </div>
          </div>
        </main>
      </div>
      <script src="/socket.io/socket.io.js"></script>
      <script src="script.js"></script>
    </body>
    </html>
    ```

    #### `public/styles.css`

    ```css
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f0f5;
      margin: 0;
    }

    .container {
      text-align: center;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    header {
      margin-bottom: 20px;
    }

    #data h2 {
      margin-bottom: 20px;
    }

    .temperature, .humidity {
      margin: 10px 0;
    }

    #temperature, #humidity {
      font-weight: bold;
    }
    ```

    #### `public/script.js`

    ```javascript
    const socket = io();

    socket.on('sensorData', (data) => {
      document.getElementById('temperature').textContent = data.temperature;
      document.getElementById('humidity').textContent = data.humidity;
    });
    ```

### Running the Project

1. **Upload the Arduino code** to your Arduino board.
2. **Start the Node.js server**:

    ```bash
    node server.js
    ```

3. **Open your browser** and navigate to `http://localhost:3000/`. You should see the temperature and humidity data updating in real time.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
