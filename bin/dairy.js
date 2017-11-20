#! /usr/bin/env node

const inquirer = require('inquirer'),
    commander = require('commander'),
    passwordHash = require('password-hash'),
    package = require('../package.json'),
    server = require('../server'),
    program = require('commander'),
    jsonFile = require('jsonfile'),
    path = require('path'),
    JournalManager = require('../backend/journal-manager'),
    _ = require('lodash'),
    fs = require('fs');


let Config = require('../config');

let dependency = {
    logger: console
};

let journalManager = new JournalManager(Config, dependency);

async function checkPassword(storedPassword, retryCount = 0) {
    if (retryCount == 3) {
        return false;
    }
    let result = await inquirer.prompt({
        type: 'password',
        name: 'password',
        message: 'Dairy PIN: '
    })
    if (passwordHash.verify(result.password, storedPassword)) {
        return true;
    }
    else {
        console.log('Please retry')
        return await checkPassword(storedPassword, retryCount + 1);
    }
}

async function newPassword() {
    let password = await inquirer.prompt({ type: 'password', name: 'result', message: 'new PIN: ' });
    let confirmedPassword = await inquirer.prompt({ type: 'password', name: 'result', message: 'Confirm PIN: ' });
    if (password.result != confirmedPassword.result) {
        console.log('Try again')
        await newPassword()
    }
    return passwordHash.generate(password.result);
}

async function init() {
    console.log(Config)
    if (!fs.existsSync(Config.userSettingsPath)) {
        let { userName } = await inquirer.prompt({
            type: 'text',
            name: 'userName',
            message: 'userName: '
        })
        let passwordHash = await newPassword();
        let userSettings = {
            userName,
            passwordHash
        }
        jsonFile.writeFileSync(Config.userSettingsPath, userSettings, { spaces: 4 });

        Config = _.extendWith(Config, userSettings, (objValue, srcValue) => {
            return _.isEmpty(srcValue) ? objValue : srcValue;
        })
        Config.key = Config.passwordHash;
        return true;
    }
    return false;
}

async function initAndValidate(){
    if(!await init()){
        if(!await checkPassword(Config.passwordHash))
            process.exit(0);
    }
}

program
    .version(package.version)
    .description("A Personal dairy app with encryption")

program
    .command('change-password')
    .description('Change password.')
    .action(async function (cmd) {
        await initAndValidate();
        
        let userSettings = jsonFile.readFileSync(Config.userSettingsPath);
        let oldPasswordHash = Config.passwordHash;
        console.log('Please enter new passowrd')

        let newPasswordHash = await newPassword();
        Config.passwordHash = userSettings.passwordHash = newPasswordHash;
        jsonFile.writeFileSync(Config.userSettingsPath, userSettings, Config.jsonFile);
        await journalManager.reEncryptJournal(Config.dairyName, oldPasswordHash, newPasswordHash);
    });

program
    .command('start')
    .description('start the app')
    .action(async function (cmd) {
        await initAndValidate();
        server(Config);
    })

program.parse(process.argv);

if(program.args.length === 0){
    initAndValidate().then(()=>{
        server(Config);
    }).catch((err)=>{
        console.error('Something went wrong! Contact repo maintainer.');
        console.error(err);
    })
}