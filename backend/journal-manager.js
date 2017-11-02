const BaseClass = require('./base-class'),
    Accessor = require('./dataAccess/journal-accessor-file'),
    co = require('co'),
    cipher = require('./cipher-suites/xor'),
    scope = 'JournalManager';


class JournalManager extends BaseClass {
    constructor(config, dependencies) {
        super(config, dependencies);
        this.accessor = new Accessor(config, dependencies);
    }

    async createJournalEntry(journal, id, payload) {
        const me = this;
        try{
            payload.data = cipher.encrpt(payload.data, me.config.key);
            me.log(scope, 'createJournalEntry', `Creating journal entry on [ ${id} ]`);       
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
}

module.exports = JournalManager