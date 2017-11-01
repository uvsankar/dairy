const _ = require('lodash');

function xorStrings(payload, key){
    let result = "";
    _.each(payload, (char, idx)=>{
        result += String.fromCharCode(char.charCodeAt(0) ^ key[(idx% key.length)].charCodeAt(0) );
    })
    return result;
}
module.exports = {
    encrpt: function(payload, key, options={}){
        return  new Buffer(xorStrings(payload, key), 'utf8').toString('utf8');
    },
    decrypt: function(payload, key, options={}){
        payload = new Buffer(payload, 'utf8').toString('utf8');
        return xorStrings(payload, key);
    }
}

