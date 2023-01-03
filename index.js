import { connect } from 'mqtt';
import { graphics } from 'systeminformation';

const host = '192.168.0.62';
const port = '1883';
const clientId = 'Node-Torrent7';

const connectUrl = `mqtt://${host}:${port}`;

const client = connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 10000,
});

client.on('connect', async  () => {
    console.log('Connected!');

    const topic = 'bedroom/torrent7';
    const options = {qos: 0, retain: false};
    
    const getGPUStats = async () => {
        try {
            const {controllers, displays} = await graphics();

            const controller = controllers[0];
            const display = displays[0];

            const date = new Date().toISOString();

            const {
                clockCore: freq,
                clockMemory: memClock,
                memoryTotal: mem,
                memoryUsed: memUsed,
                temperatureGpu: temp,
                powerDraw: voltage
            } = controller;

            const {
                currentRefreshRate: fps
            } = display;
    
            return ({
                date,
                freq,
                fps,
                mem,
                memClock,
                memUsed,
                temp,
                voltage
            });
        } catch (e) {
            console.log(e)
        }
    };
    

    while (client.connected) {
        const gpuStats = await getGPUStats();

        client.publish(topic, JSON.stringify(gpuStats), options, (err) => {
            if (err) {
                console.log('An error occurred during publish');
            } else {
                console.log('Published successfully to ' + topic);
            }
        });

        // Delay of 5 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
});

// Handle errors
client.on('error', function (error) {
    console.log('Error occurred: ' + error);
});

// Notify reconnection
client.on('reconnect', function () {
    console.log('Reconnection starting...');
});

// Notify offline status
client.on('offline', function () {
    console.log('Currently offline. Please check internet!');
});
