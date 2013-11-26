/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var fs = require('node-fs');
var path = require('path');

var config = require('../config').config;
var m = require('../model/models').models;
var QiriError = require('../model/qiri-err');
var utils = require('../model/utils');
var funcs = require('./functions');
var imageMagick = require('gm').subClass({
    imageMagick : true
});

exports.manage = require('./manage/index');

exports.channel = function(req, res, next) {
    var channelName = req.params[0] || 'home';
    funcs.venderPage(channelName, 'channel')(req, res, next);
};

exports.brand = function(req, res, next) {
    var brand = req.params[1];
    funcs.venderPage(brand, 'brand')(req, res, next);
};

exports.product = function(req, res, next) {
    var prodId = req.params.prodId;
    async.auto({
        product : function(callback) {
            m.Product.findById(prodId, function(err, product) {
                console.log(product);
                callback(err || !product, product);
            });
        },
        page : ['product', function(callback, results) {
            m.Page.findOne({
                type : 'channel',
                name : results.product.channel
            }, callback);
        }],
        categories : [ 'product', function(callback, results) {
            m.Category.find({
                _id : {
                    $in : results.product.categoryIds
                }
            }, callback);
        } ],
        categoryGroup : [ 'page', 'categories', function(callback, results) {
            callback(null, _(results.categories).groupBy(function(cate) {
                return cate.group;
            }));
        } ],
    }, function(err, results) {
        if (!results.product) {
            return next(new QiriError(404));
        }
        if (err) {
            return next(err);
        }
        res.render('product', results);
    });
};

exports.showProductImage = function(req, res, next) {
    var imgPath = req.params[0];
    var width = req.query.width;
    var height = req.query.height;

    var originPath = config.originProdPath;
    var resizePath = config.resizeProdPath;

    var originFilePath = path.join(originPath, imgPath);
    var resizeFilePath = path.join(resizePath, width + '-' + height, imgPath);
    
    if (require('os').type().match(/windows/i)) {
        res.sendfile(originFilePath);
        return;
    }
    
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
            return next(err);
        }
        res.sendfile(resizeFilePath);
    });
};
