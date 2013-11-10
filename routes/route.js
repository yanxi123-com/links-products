/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var config = require('../config');
var mongoUtils = require('../model/mongo-utils.js');
var Area = mongoUtils.getSchema('Area');
var Node = mongoUtils.getSchema('Node');
var Link = mongoUtils.getSchema('Link');
var QiriError = require('../model/qiri-err');
var crypto = require('crypto');

var getSortedObjects = function(objects, ids) {
    var idIndexMap = {};
    _(ids || []).each(function(id, index) {
        idIndexMap[id] = index;
    });
    return _(objects).sortBy(function(object) {
        return idIndexMap[object.id];
    });
};

var getPage = function(view) {
    return function(req, res, next) {
        var nodeId = req.params.id || "0";
        if (!nodeId.match(/^[0-6]$/)) {
            return next();
        }
        var nid = parseInt(nodeId);

        async.auto({
            node : function(callback) {
                Node.findOne({
                    nid : nid
                }, "areaIds title nid", function(err, node) {
                    if (!node) {
                        return next(new QiriError(404));
                    }
                    callback(null, node);
                });
            },
            areas : function(callback) {
                Area.find({
                    nid : nid
                }, "title linkIds", callback);
            },
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
                return next(err);
            }
            var areas = _(results.areas).map(
                    function(area) {
                        return {
                            id : area.id,
                            title : area.title,
                            linkIds : area.linkIds,
                            links : getSortedObjects(
                                    results.areaLinks[area.id], area.linkIds)
                        };
                    });
            areas = getSortedObjects(areas, results.node.areaIds);
            res.render(view, {
                node : results.node,
                areas : areas
            });
        });
    };
};

exports.index = function(req, res, next) {
    getPage('index')(req, res, next);
};

exports.manage = function(req, res, next) {
    var userId = req.signedCookies.userId;
    if (userId) {
        getPage('manage')(req, res, next);
    } else {
        res.render("login");
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

    // console.log("password=" + password);
    // console.log("pwdMd5=" + getPwdMd5(password));

    if (getPwdMd5(password) == config.get('encryptedPwd')) {
        setLoginCookie(res, 1);
        res.redirect('/manage');
        return;
    } else {
        res.render("login");
    }
};