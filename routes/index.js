
/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */
 
var _ = require('underscore'),
    config = require('../config');

exports.index = function(req, res, next) {
    res.render('index');
};
