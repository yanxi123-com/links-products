/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore'), config = require('../config');

exports.index = function(req, res, next) {
    var nodeId = req.params.id || "0";
    if (!nodeId.match(/^[0-6]$/)) {
        return next();
    }
    res.render('index', {
        nodeId : nodeId
    });
};
