'use strict';

const Hapi = require('hapi'),
    APIHandler = require('./backend/route-handler'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    server = new Hapi.Server();

let dependency = {
    logger: console
}

let Config = require('./config');

if(!path.isAbsolute(Config.location))
    Config.location = path.join(os.homedir(), Config.location);

server.connection(Config.server);

new APIHandler(Config, dependency).registerRoutes(server);

if(!fs.existsSync(Config.location))
    fs.mkdirSync(Config.location)
    
server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': Config.swagger
    }], (err) => {
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: 'UI'
                }
            }
        })
        server.start((err) => {
            if (err) {
                throw err;
            }
            console.log(`Server running at: ${server.info.uri}`);
        });
    })
