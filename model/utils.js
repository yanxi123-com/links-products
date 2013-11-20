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

exports.array2Object = function(array, key) {
    var results = {};
    _(array).each(function(each){
        results[each[key]] = each;
    });
    return results;
};