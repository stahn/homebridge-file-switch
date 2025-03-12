# Homebridge File Switch Plugin

A Homebridge plugin for switching configuration files. It allows you to toggle between two different configuration files and automatically trigger actions (like container restart) when the switch is toggled.

## Use Case Example

This plugin was originally created to manage go2rtc camera streams configuration. It switches between two different go2rtc.yaml configurations:
- When turned ON: switches to a configuration that enables all camera streams
- When turned OFF: switches to a configuration that disables all camera streams
- Automatically restarts the go2rtc container when configuration changes

While this example focuses on go2rtc, the plugin can be used to switch between any two configuration files and trigger custom actions.

## System Preparation (go2rtc example)

1. Ensure the go2rtc configuration directory has proper permissions:
```bash
chmod 755 /home/pi/go2rtc
```

2. Create a monitoring script to detect configuration changes:
```bash
sudo nano /home/pi/go2rtc/monitor-config.sh
```

Add the following content:
```bash
#!/bin/bash

LAST_MODIFIED=0

while true; do
    CURRENT_MODIFIED=$(stat -c %Y /home/pi/go2rtc/go2rtc.yaml)
    if [ $CURRENT_MODIFIED -gt $LAST_MODIFIED ]; then
        echo "Config file changed, restarting container..."
        docker restart go2rtc-go2rtc-1
        LAST_MODIFIED=$CURRENT_MODIFIED
    fi
    sleep 2
done
```

3. Set appropriate permissions for the script:
```bash
sudo chown pi:pi /home/pi/go2rtc/monitor-config.sh
chmod 755 /home/pi/go2rtc/monitor-config.sh

# Test if the script works
/home/pi/go2rtc/monitor-config.sh
# Press Ctrl+C to stop the test
```

4. Create a systemd service to monitor changes:
```bash
sudo nano /etc/systemd/system/go2rtc-monitor.service
```

Add the following content:
```ini
[Unit]
Description=Monitor go2rtc config changes
After=docker.service

[Service]
ExecStart=/home/pi/go2rtc/monitor-config.sh
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

5. Enable and start the monitoring service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable go2rtc-monitor
sudo systemctl start go2rtc-monitor

# Check service status
sudo systemctl status go2rtc-monitor

# If there are errors, check logs
journalctl -u go2rtc-monitor -f
```

## Plugin Installation

### For Docker-based Homebridge:

1. Connect to your Raspberry Pi via SSH:
```bash
ssh pi@your_raspberry_ip
```

2. Create necessary directories:
```bash
sudo mkdir -p /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
sudo chown -R pi:pi /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

3. Copy plugin files:
```bash
# From your local machine:
scp -r /path/to/homebridge-file-switch/* pi@your_raspberry_ip:/home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch/
```

4. Install dependencies:
```bash
cd /home/pi/homebridge
docker compose exec homebridge npm install --prefix /homebridge/node_modules/homebridge-file-switch
```

5. Fix permissions:
```bash
sudo chown -R root:root /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

6. Configure the plugin in Homebridge:
```bash
sudo nano /home/pi/homebridge/volumes/homebridge/config.json
```

Add to the "accessories" section:
```json
{
  "accessory": "FileSwitch",
  "name": "Camera Streams",
  "openConfigPath": "/go2rtc/go2rtc-open.yaml",
  "closedConfigPath": "/go2rtc/go2rtc-closed.yaml",
  "currentConfigPath": "/go2rtc/go2rtc.yaml"
}
```

7. Restart Homebridge:
```bash
cd /home/pi/homebridge
docker compose restart homebridge
```

## Verification

After installation, you should see a new switch accessory in your Apple Home app with the name you configured. Toggling the switch will:
1. Copy the appropriate configuration file
2. Trigger the monitoring service to detect the change
3. Restart the affected container

## Troubleshooting

1. Check if the plugin directory exists and has all files:
```bash
ls -la /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

2. Verify file ownership matches other plugins:
```bash
ls -la /home/pi/homebridge/volumes/homebridge/node_modules/
```

3. Check Homebridge logs:
```bash
cd /home/pi/homebridge
docker compose logs homebridge
```

4. Check monitor service status:
```bash
sudo systemctl status go2rtc-monitor
```

5. Check monitor service logs:
```bash
journalctl -u go2rtc-monitor -f
```

6. Verify directory permissions:
```bash
ls -la /home/pi/go2rtc
```
```