## Plan działania

~~1. sprawdzić czy podmienianie pliku konfigurcyjnego go2rtc działa~~

```bash
#open
cp /home/pi/go2rtc/go2rtc-open.yaml /home/pi/go2rtc/go2rtc.yaml
docker restart go2rtc-go2rtc-1

#close
cp /home/pi/go2rtc/go2rtc-closed.yaml /home/pi/go2rtc/go2rtc.yaml
docker restart go2rtc-go2rtc-1
```

2. stworzenie prostego pluginu do homebridge (guzik do włączenia/wyłączenia kamery)
3. dodanie podmiany pliku konfigurcyjnego go2rtc przy włączeniu/wyłączeniu kamery

konfig in homebridge:
```yaml
  },
  "accessory": "FileSwitch",
  "name": "Camera Switch",
  "openConfigPath": "/homebridge/go2rtc/go2rtc-open.yaml",
  "closedConfigPath": "/homebridge/go2rtc/go2rtc-closed.yaml",
  "currentConfigPath": "/homebridge/go2rtc/go2rtc.yaml",
  "containerName": "go2rtc-go2rtc-1"
}
```

