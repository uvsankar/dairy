
class BaseClass {
    constructor(config, dependencies){
        this.config = config,
        this.logger = dependencies.logger
    }


    log(scope, method, message, args = {}){
        this.logger.log(message);
    }

    error(scope, method, error, args = {}){
        this.logger.error(error);
    }
}

module.exports = BaseClass