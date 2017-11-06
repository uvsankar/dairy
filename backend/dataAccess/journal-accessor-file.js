const BaseClass = require('../base-class'),
    fs = require('fs'),
    path = require('path'),
    Boom = require('boom'),
    _ = require('lodash'),
    scope = 'JournalAccessorFile';

/* 
  All accessor functions should be async. Doesnt matter whether it performs synchronous / asynchronous tasks
  This is to maintain consistency
*/

class JournalAccessorFile extends BaseClass{
    constructor(config, dependency){
        super(config, dependency);
        this.parentFolder = config.location
        if(!fs.existsSync(config.location)){
            this.log(scope, 'constructor', `creating folder ${config.location}`)
            fs.mkdirSync(config.location)
        }
    }

    async createJournalEntry(journal, id, data){
        const me = this;
        try{
            let journalPath = path.join(me.parentFolder, journal);
            let entryPath = path.join(journalPath, id);
            if(!fs.existsSync(journalPath))
                fs.mkdirSync(journalPath)
            else if(fs.existsSync(entryPath))
                 throw Boom.conflict(`Entry ${id} already exists`);
            fs.writeFileSync(entryPath, JSON.stringify(data));
            return data;
        } catch (err) {
            me.error(scope, 'createJournalEntry', err, {journal, id});
            throw err
        }
    }

    async getJournalEntry(journal, id) {
        const me = this;
        try {
            let entryPath = path.join(me.parentFolder, journal, id);
            if(!fs.existsSync(entryPath))
                throw Boom.notFound(`Entry ${id} not found.`);
            return JSON.parse(fs.readFileSync(entryPath, 'utf8'))
        } catch (err) {
            me.error(scope, 'getJournalEntry', err);
            throw err;
        }
    }

    async getAllEntries(journal) {
        const me = this;
        try {
            let journalPath = path.join(me.parentFolder, journal);
            if(!fs.existsSync(journalPath))
                throw Boom.notFound(`Journal "${journal}" not found.`)
            let ids = fs.readdirSync(journalPath);
            let entries = [];
            for(let id of ids){
                entries.push(await me.getJournalEntry(journal, id));
            }
            return entries;
        } catch (err) {
            me.error(scope, 'getAllEntries', err, {journal});
            throw err;
        }
    }
}

module.exports = JournalAccessorFile