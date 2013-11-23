var _ = require('underscore');
var async = require('async');
var path = require('path');

var m = require('../../model/models').models;
var config = require('../../config').config;
var funcs = require('../functions');
var operation = require('./operation');
var QiriError = require('../../model/qiri-err');
var utils = require('../../model/utils');

exports.checkLogin = function(req, res, next) {
    if (req.path.indexOf('login') > -1 || req.signedCookies.userId) {
        return next();
    }
    
    res.render("manage/login");
};

exports.page = function(req, res, next) {
    var pageName = req.query.page || 'manage';
    funcs.venderPage(pageName, 'manage/page')(req, res, next);
};

exports.category = function(req, res, next) {
    var channel = req.query.channel;
    async.auto({
        page : function(callback) {
            m.Page.findOne({
                type : 'channel',
                name : channel
            }, callback);
        },
        groupCategories : ['page', function(callback, results){
            funcs.getGroupCategories(results.page, callback);
        }]
    }, function(err, results) {
        res.render("manage/category", {
            groupCategories : results.groupCategories,
            page : results.page
        });
    });
};

exports.upload = function(req, res, next) {
    res.render("manage/upload", {
        imageUrl : null
    });
};

exports.uploadFile = function(req, res, next) {
    var image = req.files.displayImage;
    async.auto({
        fileUrlPath : function(callback) {
            funcs.uploadFile(config.uploadPath, image, callback);
        }
    }, function(err, results) {
        res.render("manage/upload", {
            imageUrl : results.fileUrlPath
        });
    });
};

exports.products = function(req, res, next) {
    var channel = req.query.channel;
    async.auto({
        page : function(callback) {
            m.Page.findOne({
                type : 'channel',
                name : channel
            }, callback);
        },
        groupCategories : ['page', function(callback, results) {
            funcs.getGroupCategories(results.page, callback);
        }],
        products : function(callback) {
            m.Product.find({channel: channel}, 'name image', callback);
        }
    }, function(err, results) {
        var page = results.page;
        var products = results.products;
        res.render("manage/products", {
            page : page,
            products : products
        });
    });
};

exports.product = function(req, res, next) {
    var prodId = req.query.id;
    async.auto({
        product : function(callback) {
            m.Product.findById(prodId, callback);
        },
        page : ['product', function(callback, results) {
            if (!results.product) {
                return callback(new QiriError(404));
            }
            m.Page.findOne({
                type : 'channel',
                name : results.product.channel
            }, callback);
        }],
        groupCategories : ['page', function(callback, results) {
            funcs.getGroupCategories(results.page, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        var categoryHash = utils.toHash(results.product.categoryIds, _.identity);
        results['categoryIdHash'] = categoryHash;
        res.render("manage/product", results);
    });
};

exports.login = function(req, res, next) {
    var password = req.body.password;
    var getPwdMd5 = function(password) {
        var pwd = password + config.pwdSecret;
        return crypto.createHash('md5').update(pwd).digest('hex');
    };
    var setLoginCookie = function(res, userId) {
        res.cookie('userId', userId, {
            maxAge : 30 * 24 * 3600 * 1000,
            signed : true
        });
    };

    if (getPwdMd5(password) == config.encryptedPwd) {
        setLoginCookie(res, 1);
        res.redirect('/manage');
        return;
    } else {
        res.render("manage/login");
    }
};

exports.operation = function(req, res, next) {
    var action = req.body.action;
    if (!_.chain(operation).functions().contains(action).value()) {
        return next(new QiriError(404));
    }
    operation[action](req, res, next);
};

exports.postProductImage = function(req, res, next) {
    var prodId = req.body.prodId;
    var image = req.files.image;
    async.auto({
        fileUrlPath : function(callback) {
            var uploadPath = config.originProdPath;
            funcs.uploadFile(uploadPath, image, callback);
        },
        uploadProd : [ 'fileUrlPath', function(callback, results) {
            m.Product.findByIdAndUpdate(prodId, {
                $set : {
                    image : results.fileUrlPath
                }
            }, callback);
        } ]
    }, function(err, results) {
        res.redirect("/manage/product?id=" + prodId);
    });
};
