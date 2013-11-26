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
