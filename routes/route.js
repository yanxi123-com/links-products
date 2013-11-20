/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var config = require('../config');
var fs = require('node-fs');
var path = require('path');
var mongoUtils = require('../model/mongo-utils.js');
var Area = mongoUtils.getSchema('Area');
var Page = mongoUtils.getSchema('Page');
var Link = mongoUtils.getSchema('Link');
var Category = mongoUtils.getSchema('Category');
var QiriError = require('../model/qiri-err');
var crypto = require('crypto');
var management = require('./management');

var getSortedObjects = function(objects, ids) {
    var idIndexMap = {};
    _(ids || []).each(function(id, index) {
        idIndexMap[id] = index;
    });
    return _(objects).sortBy(function(object) {
        return idIndexMap[object.id];
    });
};

var getPageInfo = function(pageName, callback) {
    async.auto({
        page : function(cb) {
            Page.findOne({
                name : pageName
            }, cb);
        },
        areas : [ 'page', function(cb, results) {
            if (!results.page) {
                return cb(new QiriError(404));
            }
            Area.find({
                pageId : results.page.id
            }, "title linkIds type", cb);
        }],
        areaLinks : [ 'areas', function(callback, results) {
            var areaIds = _(results.areas).map(function(area) {
                return area.id;
            });
            var tasks = _(results.areas).map(function(area) {
                return function(cb) {
                    Link.find({
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
                links : getSortedObjects(results.areaLinks[area.id], area.linkIds)
            };
        });
        areas = getSortedObjects(areas, results.page.areaIds);
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

exports.channel = function(req, res, next) {
    var channelName = req.params[0] || 'home';
    venderPage(channelName, 'channel')(req, res, next);
};

exports.manage = function(req, res, next) {
    var userId = req.signedCookies.userId;
    if (userId) {
        var pageName = req.query.page || 'manage';
        venderPage(pageName, 'manage/page')(req, res, next);
    } else {
        res.render("manage/login");
    }
};

exports.login = function(req, res, next) {
    var password = req.body.password;
    var getPwdMd5 = function(password) {
        var pwd = password + config.get('pwdSecret');
        return crypto.createHash('md5').update(pwd).digest('hex');
    };
    var setLoginCookie = function(res, userId) {
        res.cookie('userId', userId, {
            maxAge : 30 * 24 * 3600 * 1000,
            signed : true
        });
    };


    if (getPwdMd5(password) == config.get('encryptedPwd')) {
        setLoginCookie(res, 1);
        res.redirect('/manage');
        return;
    } else {
        res.render("login");
    }
};

exports.operation = function(req, res, next) {
    var userId = req.signedCookies.userId;
    if (!userId) {
        return next(new QiriError(404));
    }

    var action = req.body.action;
    if (!_.chain(management).functions().contains(action).value()) {
        return next(new QiriError(404));
    }
    management[action](req, res, next);
};

exports.brand = function(req, res, next) {
    var brand = req.params[1];
    venderPage(brand, 'brand')(req, res, next);
};

exports.upload = function(req, res, next) {
    res.render("manage/upload", {
        imageUrl : null
    });
};

exports.uploadFile = function(req, res, next) {
    var displayImage = req.files.displayImage;
    if (displayImage.size == 0) {
        return exports.upload(req, res, next);
    }

    var now = new Date();
    var urlPath = "/" + now.getFullYear() + "/" + (now.getMonth() + 1);
    var dir = path.join(config.get('uploadPath'), urlPath);
    var fileName = (now % (1000 * 3600 * 24)) + path.extname(displayImage.name);
    async.auto({
        mkdirs : function(callback) {
            fs.mkdir(dir, 0777, true, callback);
        },
        fileData : [ 'mkdirs', function(callback) {
            fs.readFile(displayImage.path, callback);
        } ],
        writeFile : [ 'fileData', function(callback, results) {
            fs.writeFile(path.join(dir, fileName), results.fileData, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.render("manage/upload", {
            imageUrl : urlPath + "/" + fileName
        });
    });
};

exports.manageCategory = function(req, res, next) {
    var channel = req.query.channel;
    async.auto({
        page : function(callback) {
            Page.findOne({
                type : 'channel',
                name : channel
            }, callback);
        },
        categories : function(callback) {
            Category.find({channel : channel}, callback);
        }
    }, function(err, results) {
        var groupCategories = _(results.categories).groupBy(function(category) {
            return category.group;
        });
        console.log(groupCategories);
        res.render("manage/category", {
            groupCategories : groupCategories,
            page : results.page
        });
    });
};
