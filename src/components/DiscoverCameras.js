import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import dgram from 'react-native-udp';



const DiscoverCameras = () => {

    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const socket = dgram.createSocket('udp4');

        socket.bind(1901, (error) => {
            if (error) {
                console.error('Socket binding error:', error);
                return;
            }
            console.log('Socket bound to port 1901');

            const message = `
                M-SEARCH * HTTP/1.1\r\n
                HOST: 239.255.255.250:1900\r\n
                MAN: "ssdp:discover"\r\n
                MX: 1\r\n
                ST: urn:schemas-upnp-org:device:DigitalSecurityCamera:1\r\n
            `;

            socket.send(
                message,
                0,
                message.length,
                1900,
                '239.255.255.250',
                (err) => {
                    if (err) console.error('Error sending SSDP message:', err);
                    else console.log('SSDP search message sent');
                }
            );
        });

        socket.on('message', (msg, rinfo) => {
            console.log('Received message from:', rinfo.address);
            console.log('Message:', msg);

            // Extract relevant information from the response
            const deviceInfo = parseSSDPResponse(msg.toString());
            setDevices((prevDevices) => [...prevDevices, deviceInfo]);
        });

        return () => {
            socket.close();
        };
    }, []);

    const parseSSDPResponse = (message) => {
        // Parse the SSDP response to extract information like location, device type, etc.
        // This function will vary depending on the format of the response you expect
        const lines = message.split('\r\n');
        const device = {};
        lines.forEach(line => {
            if (line.startsWith('LOCATION:')) {
                device.location = line.replace('LOCATION: ', '');
            } else if (line.startsWith('ST:')) {
                device.serviceType = line.replace('ST: ', '');
            }
        });
        return device;
    };

    return (
        <View>
            <Text>IP Camera Discovery</Text>
            <Button title="Search for Devices" onPress={() => { }} />
            {devices.map((device, index) => (
                <View key={index}>
                    <Text>Device: {device.serviceType}</Text>
                    <Text>Location: {device.location}</Text>
                </View>
            ))}
        </View>
    );
};

export default DiscoverCameras;
