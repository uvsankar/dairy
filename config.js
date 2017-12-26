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
    "swagger": {
        "info": {
            "title": "API Documentation",
            "version": "1.0.0"
        }
    },
    "cache": {
        "expiresIn": 10000
    },
    "jsonFile": {
        "spaces": 4
    },
    "cipherAlgo": "aes-256-ctr",
    "keyGen":{
        "salt": "salt",
        "iterations": 99999,
        "length": 256,
        "digest": "sha512"
    },
    "aes": {
        "ivSize": 16,
        "keySize": 32
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

module.exports = Config;