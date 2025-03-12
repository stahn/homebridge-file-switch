const { API } = require('homebridge');
const fs = require('fs');
const { exec } = require('child_process');

let hap;

module.exports = (api) => {
  hap = api.hap;
  api.registerAccessory('FileSwitch', FileSwitchAccessory);
};

class FileSwitchAccessory {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    // Get name from config or set default
    this.name = config.name || 'Camera Switch';

    // Get paths from config
    this.openConfigPath = config.openConfigPath;
    this.closedConfigPath = config.closedConfigPath;
    this.currentConfigPath = config.currentConfigPath;
    this.containerName = config.containerName;

    // Create switch service
    this.switchService = new hap.Service.Switch(this.name);

    // Add characteristic for on/off
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.state = false;
  }

  async getOn() {
    return this.state;
  }

  async setOn(value) {
    try {
      this.log.info('Current paths:');
      this.log.info(`Source path (${value ? 'open' : 'closed'}): ${value ? this.openConfigPath : this.closedConfigPath}`);
      this.log.info(`Target path: ${this.currentConfigPath}`);

      // Determine which config file to use
      const sourcePath = value ? this.openConfigPath : this.closedConfigPath;
      
      // Copy the appropriate config file
      fs.copyFileSync(sourcePath, this.currentConfigPath);
      this.log.info(`Successfully copied ${value ? 'open' : 'closed'} config to current config`);

      // Monitor script will detect file change and restart container
      this.state = value;
      this.log.info(`Switch state was set to: ${value}`);
    } catch (error) {
      this.log.error(`Error handling switch state change: ${error}`);
      this.log.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }

  getServices() {
    return [this.switchService];
  }
}