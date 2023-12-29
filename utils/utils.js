const _ = require("underscore");

const utils = {};

utils.has = (params, requiredKeys) => _.every(requiredKeys, _.partial(_.has, params));

utils.isFloat = n => Number(n) === n && n % 1 !== 0;

utils.boolToInt = bool => bool == true ? 1 : 0;

utils.sanatizePartyPositionChange = function (number) {
    return (isNaN(number) || this.isFloat(number) || number > 5 || number < 0);
};

/**
 * 
 * @param {Base} Klass 
 * @param {Main} main 
 * @returns {Base}
 */
utils.instantiateGameCoreKlass = function (Klass, main) {
    return new Klass(main, main.socket, main.auth, main.db, main.server, main.dataMasterEvents);
};

module.exports = utils;

const Base = require("../core/base");
const Main = require("../core");

