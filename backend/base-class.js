
class BaseClass {
    constructor(config, dependencies){
        this.config = config,
        this.logger = dependencies.logger
    }


    log(scope, method, message, args = {}){
        this.logger.log(message);
    }

    error(scope, method, message, args = {}){
        this.logger.error(message);
    }
}

module.exports = BaseClass