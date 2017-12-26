const crypto = require('crypto'),
  config = require('../config'),
  _ = require('lodash')

module.exports = _.extend({
  getKey: function(password) {
    let keyGenConfig = config.keyGen
    return crypto.pbkdf2Sync(password, keyGenConfig.salt, keyGenConfig.iterations, keyGenConfig.length, keyGenConfig.digest)
  },

  getPasswordHash: function(password){
    let key = this.getKey(password)
    hash = crypto.createHash('sha256')
    return hash.update(key).digest('base64')
  },

  encrypt: function(payload, iv, key = config.key, algorithm = config.cipherAlgo){
    key = key.slice(0, config.aes.keySize)
    let cipher = crypto.createCipheriv(algorithm, key, iv)
    return cipher.update(payload, 'utf8', 'base64') + cipher.final('base64')
  },

  decrypt: function(payload, iv, key = config.key, algorithm = config.cipherAlgo){
    key = key.slice(0, config.aes.keySize)
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    return decipher.update(payload, 'base64', 'utf8') + decipher.final('utf8')
  },
  
  verifyPassword: function(passoword, passwordHash){
    return this.getPasswordHash(passoword) == passwordHash
  }
}, crypto)