/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var config = require('../config');
var fs = require('node-fs');
var path = require('path');
var m = require('../model/models').models;
var QiriError = require('../model/qiri-err');
var crypto = require('crypto');
var utils = require('../model/utils');

var getPageInfo = function(pageName, callback) {
    async.auto({
        page : function(cb) {
            m.Page.findOne({
                name : pageName
            }, cb);
        },
        areas : [ 'page', function(cb, results) {
            if (!results.page) {
                return cb(new QiriError(404));
            }
            m.Area.find({
                pageId : results.page.id
            }, "title linkIds type", cb);
        }],
        areaLinks : [ 'areas', function(callback, results) {
            var areaIds = _(results.areas).map(function(area) {
                return area.id;
            });
            var tasks = _(results.areas).map(function(area) {
                return function(cb) {
                    m.Link.find({
                        areaId : area.id
                    }, cb);
                };
            });
            async.parallel(_(areaIds).object(tasks), callback);
        } ]
    }, function(err, results) {
        if (err) {
            return callback(err);
        }
        var areas = _(results.areas).map(function(area) {
            return {
                id : area.id,
                title : area.title,
                type : area.type,
                linkIds : area.linkIds,
                links : utils.sortById(results.areaLinks[area.id], area.linkIds)
            };
        });
        areas = utils.sortById(areas, results.page.areaIds);
        var linkNum = _(areas).reduce(function(meno, area) {
            return meno + area.links.length;
        }, 0);
        callback(null, {
            page : results.page,
            areas : areas,
            linkNum : linkNum
        });
    });
};

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
            var categoryIds = utils.toHash(page.categoryGroups, 'name')[group].categoryIds;
            var sortedCategories = utils.sortById(categories, categoryIds);
            sortedGroups[group] = sortedCategories;
        });
        callback(null, sortedGroups);
    });
};

var venderPage = function(pageName, view) {
    return function(req, res, next) {
        async.auto({
            pageInfo : function(callback) {
                getPageInfo(pageName, callback);
            }
        }, function(err, results) {
            if (err) {
                return next(err);
            }
            res.render(view, results.pageInfo);
        });
    };
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

module.exports = generateApi('getGroupCategories', 'venderPage', 'uploadFile');