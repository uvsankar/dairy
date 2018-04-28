
const BaseClass = require('./base-class'),
    Accessor = require('./dataAccess/journal-accessor-file'),
    co = require('co'),
    cipher = require('./crypto'),
    shortid = require('shortid32'),
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
        try {
            let id = shortid.generate();
            payload.id = id;
            if (await me.isPossibleDuplicate(journal, payload))
                throw Boom.conflict(`An entry with title [ ${payload.title} ] already exists`);
            let iv = cipher.randomBytes(me.config.aes.ivSize)
            payload.data = cipher.encrypt(payload.data, iv);
            payload.iv = iv.toString('base64');
            payload.cipher = me.config.cipherAlgo;
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
            let entry = await me.accessor.getJournalEntry(journal, id);
            entry.data = cipher.decrypt(entry.data, new Buffer(entry.iv, 'base64'));
            return entry;
        } catch (err) {
            me.error(scope, 'getJournalEntry', err);
            throw err;
        }
    }

    async isPossibleDuplicate(journal, entry) {
        const me = this;
        try {
            let entries = await me.accessor.getAllEntries(journal);
            let titles = _.map(entries, 'title');
            return _.includes(titles, entry.title);
        } catch (err) {
            me.error(scope, 'checkForPossibleDuplicate', err, { journal });
            throw err;
        }
    }

    async reEncryptJournals(oldKey, newKey) {
        const me = this;
        try {
            let journalList = await me.getJournalList();
            for (let journal of journalList) {
                let entries = await me.accessor.getAllEntries(journal);
                entries = _.map(entries, (i) => {
                    //Incase a good soul is using(trying) this app. I'm obliged to provide my assistance
                    if (i.cipher == 'xor') {
                        console.log('please contact repo maintainer. sorry for the inconvenience')
                        throw new Error('Deprecated')
                    }
                    i.data = cipher.decrypt(i.data, new Buffer(i.iv, 'base64'), oldKey, i.cipher);
                    return i;
                })
                entries = _.map(entries, (i) => {
                    i.iv = cipher.randomBytes(me.config.aes.ivSize).toString('base64')
                    i.data = cipher.encrypt(i.data, new Buffer(i.iv, 'base64'), newKey);
                    i.cipher = me.config.cipherAlgo;
                    return i;
                })
                for (let entry of entries) {
                    await me.accessor.createJournalEntry(journal, entry.id, entry, { override: true });
                }
            }
            me.log(scope, 'reEncryptJournals', 'All journals reEncrypted with new key');
        } catch (err) {
            me.error(scope, 'reEncryptJournals', err, { journal });
            throw err;
        }
    }

    //Pagination ??
    async getIndex(journal) {
        const me = this;
        try {
            let entries = await me.accessor.getAllEntries(journal);
            entries = _.map(entries, (i) => _.pick(i, ['id', 'title', 'createdDate']))
            entries = _.orderBy(entries, 'createdDate', 'desc')
            return entries;
        } catch (err) {
            me.error(scope, 'getAllEntries', err, { journal});
            throw err;
        }
    }

    async getJournalList() {
        const me = this;
        try {
            return await me.accessor.getJournalList();
        } catch (err) {
            me.error(scope, 'getJournalList', err);
            throw err;
        }
    }
}

module.exports = JournalManager