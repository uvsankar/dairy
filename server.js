'use strict';

const Hapi = require('hapi'),
    Config = require('./config'),
    APIHandler = require('./backend/route-handler'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger'),
    server = new Hapi.Server();

let dependency = {
    logger: console
}
server.connection(Config.server);

new APIHandler(Config, dependency).registerRoutes(server);

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': Config.swagger
    }], (err) => {
        server.start((err) => {
            if (err) {
                throw err;
            }
            console.log(`Server running at: ${server.info.uri}`);
        });
    })
