const router = require('express').Router();
//let mq = require('./middleware/provision.mqtt');

router.get('/status',(req, res) => {
    res.send({
        "mac_address": "00:00:5e:00:53:af",
        "client_id": 1125125,
        "active": true,
        "sensor_type": "Lights",
        "sensorTypeId": 3,
        "serial_number": "SN15168527621",
        "static_ip": "192.168.252.15",
        "dns1": "8.25.12.25",
        "dns2": "85.65.125.5",
        "gateway": "192.168.252.1",
        "subnet": "255.255.255.0",
        "sleep_time": 1200,
        "host_ip": "172.168.2.4",
        "sim_serial": 259428415841571000,
        "ota_password": "5fu7dt58$%2q*&^%s",
        "sim_msidm": "01234567890",
        "ap_name": "LightBoard",
        "ap_ip": "192.168.1.1",
        "ap_password": "12345678",
        "node_profile": 112,
        "mqttuserId": 1,
        "board_name": "NodeMCUv2",
        "board_model": "ESP8622",
        "flags": "0x253425FA"
    });
});

module.exports = router;
