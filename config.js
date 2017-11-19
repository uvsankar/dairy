const _ = require('lodash'),
    path = require('path'),
    os = require('os');

let userSettings = {};


let DefaultConfig = {
    "server": {
        "host": "localhost",
        "port": "9090"
    },
    "location": path.join(os.homedir(), ".dairy"),
    "key": "!!_sOme_r@nd0m_key!!",
    "swagger": {
        "info": {
            "title": "API Documentation",
            "version": "1.0.0"
        }
    },
    "jsonFile": {
        "spaces": 4
    },
    "dairyName": "Personal",
    "userName": "Admin"
}

let Config = _.extend(DefaultConfig, {
    userSettingsPath: path.join(DefaultConfig.location, 'user-settings.json')
})

try{
    userSettings =  require(Config.userSettingsPath);
 } catch (err) {
 }
 
Config = _.extendWith(Config, userSettings, (objValue, srcValue)=>{
    return _.isEmpty(srcValue) ? objValue : srcValue;
})

Config.key = _.get(userSettings, 'passwordHash', Config.key);

module.exports = Config;