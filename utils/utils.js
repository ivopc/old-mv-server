const _ = require("underscore");

const utils = {};

utils.has = (params, requiredKeys) => _.every(requiredKeys, _.partial(_.has, params));

utils.isFloat = n => Number(n) === n && n % 1 !== 0;

utils.boolToInt = bool => bool == true ? 1 : 0;

utils.sanatizePartyPositionChange = function (number) {
    return (isNaN(number) || this.isFloat(number) || number > 5 || number < 0);
};

module.exports = utils;