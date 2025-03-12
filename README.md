# Homebridge File Switch Plugin

A Homebridge plugin for switching configuration files

## Przygotowanie systemu

1. Upewnij się, że katalog z konfiguracją go2rtc ma odpowiednie uprawnienia:
```bash
chmod 755 /home/pi/go2rtc
```

2. Utwórz skrypt monitorujący zmiany w konfiguracji:
```bash
sudo nano /home/pi/go2rtc/monitor-config.sh
```

Dodaj następującą zawartość:
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

4. Nadaj odpowiednie uprawnienia dla skryptu:
```bash
sudo chown pi:pi /home/pi/go2rtc/monitor-config.sh
chmod 755 /home/pi/go2rtc/monitor-config.sh

# Sprawdź czy skrypt działa
/home/pi/go2rtc/monitor-config.sh
# Naciśnij Ctrl+C aby zatrzymać test
```

4. Utwórz serwis systemd do monitorowania zmian:
```bash
sudo nano /etc/systemd/system/go2rtc-monitor.service
```

Dodaj następującą zawartość:
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

6. Uruchom i włącz serwis monitorujący:
```bash
sudo systemctl daemon-reload
sudo systemctl enable go2rtc-monitor
sudo systemctl start go2rtc-monitor

# Sprawdź status serwisu
sudo systemctl status go2rtc-monitor

# Jeśli są błędy, sprawdź logi
journalctl -u go2rtc-monitor -f
```

## Installation Instructions / Instrukcja instalacji

### For Docker-based Homebridge installation:

1. Connect to your Raspberry Pi via SSH:
```bash
ssh pi@192.168.1.187
```

2. Create necessary directories on Raspberry Pi:
```bash
# Create directory for the plugin
sudo mkdir -p /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
sudo chown -R pi:pi /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

3. Copy plugin files to Raspberry Pi:
```bash
# From your local machine (run this on your Mac):
scp -r /Users/stanislawm/my_code/smarthome/homebridge-file-switch/* pi@192.168.1.187:/home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch/
```

4. Install plugin dependencies (using Docker container):
```bash
# Navigate to homebridge directory
cd /home/pi/homebridge

# Run npm install inside the container
docker compose exec homebridge npm install --prefix /homebridge/node_modules/homebridge-file-switch
```

5. Fix permissions after installation:
```bash
sudo chown -R root:root /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

6. Add the plugin configuration to your Homebridge config:
```bash
sudo nano /home/pi/homebridge/volumes/homebridge/config.json
```

Add this to the "accessories" section:
```json
{
  "accessory": "FileSwitch",
  "name": "My File Switch"
}
```

7. Restart Homebridge container:
```bash
cd /home/pi/homebridge
docker compose restart homebridge
```

## Verification / Weryfikacja

- English: After installation, you should see a new switch accessory in your Apple Home app named "My File Switch" (or the name you configured).
- Polski: Po instalacji powinieneś zobaczyć nowy przełącznik w aplikacji Apple Home o nazwie "My File Switch" (lub nazwie, którą skonfigurowałeś).

## Troubleshooting

If the plugin is not visible in Homebridge:
1. Check if the plugin directory exists and has all files:
```bash
ls -la /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```

2. Verify file ownership matches other plugins:
```bash
ls -la /home/pi/homebridge/volumes/homebridge/node_modules/
```

3. Check Homebridge logs for any errors:
```bash
cd /home/pi/homebridge
docker-compose logs homebridge
```

4. If needed, fix permissions to match other plugins:
```bash
sudo chown -R root:root /home/pi/homebridge/volumes/homebridge/node_modules/homebridge-file-switch
```
4. Check monitor service status:
```bash
sudo systemctl status go2rtc-monitor
```

5. Check monitor service logs:
```bash
journalctl -u go2rtc-monitor -f
```

6. Verify go2rtc directory permissions:
```bash
ls -la /home/pi/go2rtc
```
```