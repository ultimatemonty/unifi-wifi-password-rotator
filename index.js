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
  wlanId: process.env.UNIFI_WLAN_ID
}

var controller = new unifi.Controller(config.host, config.port);

// LOGIN
controller.login(config.username, config.password, function(err) {
  if(err) {
    console.log('ERROR: ' + err);
    controller.logout();
    return;
  }

  const new_password = xkpasswd({ pattern: 'wsw' });
  controller.setWLanSettings(config.site, config.wlanId, (err, res) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }

    console.log(`New password is ${new_password}`);
  }, new_password);
  controller.logout();
});