/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var config = require('../config').config;
var fs = require('node-fs');
var path = require('path');
var QiriError = require('../model/qiri-err');
var crypto = require('crypto');
var utils = require('../model/utils');
var funcs = require('./functions');
var imageMagick = require('gm').subClass({
    imageMagick : true
});

exports.manage = require('./manage/manage');

exports.channel = function(req, res, next) {
    var channelName = req.params[0] || 'home';
    funcs.venderPage(channelName, 'channel')(req, res, next);
};

exports.brand = function(req, res, next) {
    var brand = req.params[1];
    funcs.venderPage(brand, 'brand')(req, res, next);
};

exports.showProductImage = function(req, res, next) {
    var imgPath = req.params[0];
    var width = req.query.width;
    var height = req.query.height;

    var originPath = config.originProdPath;
    var resizePath = config.resizeProdPath;

    var originFilePath = path.join(originPath, imgPath);
    var resizeFilePath = path.join(resizePath, width + '-' + height, imgPath);
    
    if (!width && !height) {
        res.sendfile(originFilePath);
        return;
    }

    if (fs.existsSync(resizeFilePath)) {
        res.sendfile(resizeFilePath);
        return;
    }
    
    var dir = path.dirname(resizeFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0777, true);
    }

    async.auto({
        resizeImage : function(callback) {
            imageMagick(originFilePath)
                .trim()
                .resize(width, height)
                .noProfile()
                .write(resizeFilePath, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(new QiriError("imageMagick not supported on windows."));
        }
        res.sendfile(resizeFilePath);
    });
};
