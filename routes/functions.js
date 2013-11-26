/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var fs = require('node-fs');
var request = require('request');
var path = require('path');

var m = require('../model/models').models;

var QiriError = require('../model/qiri-err');
var crypto = require('crypto');
var utils = require('../model/utils');

var getGroupCategories = function(page, callback) {
    var channel = page.name;
    async.auto({
        categories : function(callback) {
            m.Category.find({
                channel : channel
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return callback(err);
        }
        var groups = _(results.categories).groupBy(function(category) {
            return category.group;
        });
        var sortedGroups = {};
        _(groups).each(function(categories, group) {
            var categoryIds = _.indexBy(page.categoryGroups, 'name')[group].categoryIds;
            var sortedCategories = utils.sortById(categories, categoryIds);
            sortedGroups[group] = sortedCategories;
        });
        callback(null, sortedGroups);
    });
};

var venderPage = function(pageName, view) {
    return function(req, res, next) {
        async.auto({
            page : function(cb) {
                m.Page.findOne({
                    name : pageName
                }, cb);
            }
        }, function(err, results) {
            if (err) {
                return next(err);
            }

            var page = results.page;
            if (!page) {
                return next();
            }
            var linkNum = _(page.linkGroups).reduce(function(meno, group) {
                return meno + group.links.length;
            }, 0);

            res.render(view, {
                page : page,
                linkNum : linkNum
            });
        });
    };
};

var download = function(uri, uploadPath, callback) {
    var now = new Date();
    var urlPath = "/" + now.getFullYear() + "/" + (now.getMonth() + 1);
    var dir = path.join(uploadPath, urlPath);
    var fileName = (now % (1000 * 3600 * 24)) + path.extname(uri);
    async.auto({
        mkdirs : function(callback) {
            fs.mkdir(dir, 0777, true, callback);
        },
        save : [ 'mkdirs', function(callback) {
            var picStream = fs.createWriteStream(path.join(dir, fileName));
            picStream.on('close', callback);
            request(uri).pipe(picStream); 
        } ]
    }, function(err, results) {
        if (err) {
            return callback(err);
        }
        var fileUrlPath = urlPath + "/" + fileName;
        callback(null, fileUrlPath);
    });
};

var uploadFile = function(uploadPath, file, callback) {
    if (file.size == 0) {
        return callback(new QiriError('No file to upload.'));
    }

    var now = new Date();
    var urlPath = "/" + now.getFullYear() + "/" + (now.getMonth() + 1);
    var dir = path.join(uploadPath, urlPath);
    var fileName = (now % (1000 * 3600 * 24)) + path.extname(file.name);
    async.auto({
        mkdirs : function(callback) {
            fs.mkdir(dir, 0777, true, callback);
        },
        fileData : [ 'mkdirs', function(callback) {
            fs.readFile(file.path, callback);
        } ],
        writeFile : [ 'fileData', function(callback, results) {
            fs.writeFile(path.join(dir, fileName), results.fileData, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return callback(err);
        }
        var fileUrlPath = urlPath + "/" + fileName;
        callback(null, fileUrlPath);
    });
};

var generateApi = function() {
    var exports = {};
    _(arguments).each(function(arg) {
        exports[arg] = eval(arg);
    });
    return exports;
};

module.exports = generateApi('getGroupCategories', 'venderPage', 'uploadFile', 'download');