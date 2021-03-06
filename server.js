'use strict';

const Hapi = require('hapi'),
    APIHandler = require('./backend/route-handler'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    server = new Hapi.Server();


function startServer(Config){
    let dependency = {
        logger: console
    }
        
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
            server.views({
                engines: {
                    html: require('handlebars')
                },
                relativeTo: __dirname,
                layout: 'layout/layout',
                path: 'UI',
                helpersPath: 'UI/helpers'
            });
            server.route({
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: path.join(__dirname, 'UI')
                    }
                },
                config: {
                    cache: {
                        expiresIn: 30*60*1000
                    }
                }
            })
            server.route({
                method: 'GET',
                path: '/',
                handler: {
                    view: {
                        template: 'index',
                        context: {
                            config: Config
                        }
                    }
                }
            })
            server.route({
                method: 'GET',
                path: '/journal/{journal}/new',
                handler: function(request, reply){
                    reply.view('index', {
                        config: _.extend({}, Config, {dairyName: request.params["journal"]})
                    })
                }
            })
            server.start((err) => {
                if (err) {
                    throw err;
                }
                console.log(`Server running at: ${server.info.uri}`);
            });
        })
}

let isCLI = !module.parent
if(isCLI){
    let Config = require('./config');
    Config.key = Config.passwordHash;
    startServer(Config)
}
else 
    module.exports = startServer
