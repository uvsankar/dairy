const BaseClass = require('./base-class'),
    JournalManager = require('./journal-manager'),
    _  = require('lodash');

class RouteHandler extends BaseClass {
    constructor(config, dependencies){
        super(config, dependencies);
        this.journalManager = new JournalManager(config, dependencies)
    }

    registerRoutes(server){
        const me = this;
        server.route({
            method: 'POST',
            path: '/journal/{journal}',
            config: {
                tags: ['api']
            },
            handler: function(request, reply) {
                me.journalManager.createJournalEntry(request.params.journal, request.payload).then((result)=>{
                    reply(result);
                }, (err)=>{
                    reply(err)
                })   
            }
        })

        server.route({
            method: 'GET',
            path: '/journal/{journal}/{id}',
            config: {
                tags: ['api']
            },
            handler: function(request, reply) {
                me.journalManager.getJournalEntry(request.params.journal, request.params.id, request.payload).then((result)=>{
                    let accept = request.headers.accept;
                    if(accept.search("application/json")!= -1)
                        reply(result);
                    else
                        reply.view('entry',{
                            entry: result,
                            config: me.config
                        })
                }, (err)=>{
                    reply(err)
                })   
            }
        })

        server.route({
            method: 'GET',
            path: '/journal/{journal}',
            config: {
                tags: ['api']
            },
            handler: function(request, reply) {
                me.journalManager.getIndex(request.params.journal).then((result)=>{
                    reply.view('list', {
                        entries: result,
                        config: me.config
                    })
                }, (err)=>{
                    reply(err)
                })
            }
        })
    }
}

module.exports = RouteHandler