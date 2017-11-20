const BaseClass = require('./base-class'),
    Accessor = require('./dataAccess/journal-accessor-file'),
    co = require('co'),
    cipher = require('./cipher-suites/xor'),
    shortid = require('shortid32'),
    Enum = require('./enum'),
    _ = require('lodash'),
    Boom = require('boom'),
    scope = 'JournalManager';


class JournalManager extends BaseClass {
    constructor(config, dependencies) {
        super(config, dependencies);
        this.accessor = new Accessor(config, dependencies);
    }

    async createJournalEntry(journal, payload) {
        const me = this;
        try{
            let id = shortid.generate();
            payload.id = id;
            if(await me.isPossibleDuplicate(journal, payload))
                throw Boom.conflict(`An entry with title [ ${payload.title} ] already exists`);
            payload.data = cipher.encrpt(payload.data, me.config.key);
            payload.cipher = Enum.Cipher.XOR; // Only XOR encryption is supported for now.
            me.log(scope, 'createJournalEntry', `Creating journal entry on \"${payload.title}\" [${id}]`);       
            return await me.accessor.createJournalEntry(journal, id, payload);
        } catch (err) {
            me.error(scope, 'createJournal', err);
            throw err;
        }
    }

    async getJournalEntry(journal, id) {
        const me = this;
        try {
            me.log(scope, 'getJournalEntry', `Fetching journal entry [ ${id} ]`);
            let entry =  await me.accessor.getJournalEntry(journal, id);
            entry.data = cipher.decrypt(entry.data, me.config.key);
            return entry;
        } catch (err) {
            me.error(scope, 'getJournalEntry', err);
            throw err;
        }
    }
    
    async isPossibleDuplicate(journal, entry){
        const me = this;
        try {
            let entries = await me.accessor.getAllEntries(journal);
            let titles = _.map(entries, 'title');
            return _.includes(titles, entry.title);
        } catch (err) {
            me.error(scope, 'checkForPossibleDuplicate', err, {journal});
            throw err;
        }
    }

    async reEncryptJournal(journal, oldKey, newKey) {
        const me = this;
        try {
            let entries = await me.accessor.getAllEntries(journal);
            entries = _.map(entries, (i)=>{
                i.data = cipher.decrypt(i.data, oldKey);
                return i;
            })
            entries = _.map(entries, (i)=>{
                i.data = cipher.encrpt(i.data, newKey);
                return i;
            })
            for(let entry of entries){
                await me.accessor.createJournalEntry(journal, entry.id, entry, {override: true});
            }
            me.log(scope, 'reEncryptJournal', 'All entries reEncrypted with new key', {journal});
        } catch (err) {
            me.error(scope, 'reEncryptJournal', err, {journal});
            throw err;
        }
    }
}

module.exports = JournalManager