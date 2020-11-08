const unifi = require('node-unifi');
const xkpasswd = require('xkpasswd');
const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV !== 'production') {
    require('dotenv').config({ path: `.env.${NODE_ENV}` });
}

const config = {
  username: process.env.UNIFI_AUTH_USERNAME,
  password: process.env.UNIFI_AUTH_PASSWORD,
  host: process.env.UNIFI_HOST_IP,
  port: process.env.UNIFI_HOST_PORT || 8443,
  site: process.env.UNIFI_SITE_NAME || 'default',
  wlan: process.env.UNIFI_WLAN_SSID,
  clients: process.env.UNIFI_CLIENTS.split(',')
}

var controller = new unifi.Controller(config.host, config.port);

// LOGIN
controller.login(config.username, config.password, function(err) {
  controller.getWLanSettings(config.site, (err, res) => {
    if(err) {
      console.error(`ERROR: ${err}`);
      controller.logout();
      return;
    }

    const wlan = res[0].find(wlan => wlan.name === config.wlan);
    if (!wlan) {
      console.error(`ERROR: Unable to find wlan with name '${config.wlan}'. Exiting`);
      controller.logout();
      return;
    }
    const wlanId = wlan._id

    // set a new password for the specified network
    const new_password = xkpasswd({ pattern: 'wsw' });
    controller.setWLanSettings(config.site, wlanId, (err, res) => {
      if (err) {
        console.error(`ERROR: ${err}`);
        controller.logout();
        return;
      }

      console.log(`New password is ${new_password}`);

      // Disconnect devices
      let disconnectErrors = [];
      config.clients.forEach(client => {
        controller.reconnectClient(config.site, client, (err) => {
          if (err) {
            disconnectErrors.push(err);
            return;
          }
        });
      })

      controller.logout();
    }, new_password);
  });
});