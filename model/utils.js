/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');

exports.sortById = function(objects, ids) {
    var idIndexMap = {};
    _(ids || []).each(function(id, index) {
        idIndexMap[id] = index;
    });
    return _(objects).sortBy(function(object) {
        return idIndexMap[object.id];
    });
};

/*
 * toHash(array, key/getKey, [getValue])
 */
exports.toHash = function(array, key, value) {
    var getKey = _.isFunction(key) ? key : function(each) {
        return each[key];
    };
    var getValue = value || _.identity;

    var results = {};
    _(array).each(function(each) {
        results[getKey(each)] = getValue(each);
    });
    return results;
};