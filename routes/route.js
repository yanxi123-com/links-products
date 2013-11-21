/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var async = require('async');
var config = require('../config');
var fs = require('node-fs');
var path = require('path');
var mongoUtils = require('../model/mongo-utils.js');
var QiriError = require('../model/qiri-err');
var crypto = require('crypto');
var management = require('./management');
var utils = require('../model/utils');
var imageMagick = require('gm').subClass({
    imageMagick : true
});

var Area = mongoUtils.getSchema('Area');
var Category = mongoUtils.getSchema('Category');
var Link = mongoUtils.getSchema('Link');
var Page = mongoUtils.getSchema('Page');
var Product = mongoUtils.getSchema('Product');

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
            Category.find({
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
            var categoryIds = utils.array2Object(page.categoryGroups, 'name')[group].categoryIds;
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

exports.channel = function(req, res, next) {
    var channelName = req.params[0] || 'home';
    venderPage(channelName, 'channel')(req, res, next);
};

exports.checkLogin = function(req, res, next) {
    if (req.path.indexOf('login') > -1 || req.signedCookies.userId) {
        return next();
    }
    
    res.render("manage/login");
};

exports.manage = function(req, res, next) {
    var pageName = req.query.page || 'manage';
    venderPage(pageName, 'manage/page')(req, res, next);
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
        res.render("manage/login");
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
    var image = req.files.displayImage;
    async.auto({
        fileUrlPath : function(callback) {
            uploadFile(config.get('uploadPath'), image, callback);
        }
    }, function(err, results) {
        res.render("manage/upload", {
            imageUrl : results.fileUrlPath
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
        groupCategories : ['page', function(callback, results){
            getGroupCategories(results.page, callback);
        }]
    }, function(err, results) {
        res.render("manage/category", {
            groupCategories : results.groupCategories,
            page : results.page
        });
    });
};

exports.manageProducts = function(req, res, next) {
    var channel = req.query.channel;
    async.auto({
        page : function(callback) {
            Page.findOne({
                type : 'channel',
                name : channel
            }, callback);
        },
        groupCategories : ['page', function(callback, results){
            getGroupCategories(results.page, callback);
        }],
        products : function(callback) {
            Product.find({channel: channel}, 'name image', callback);
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

exports.manageProduct = function(req, res, next) {
    var prodId = req.query.id;
    async.auto({
        product : function(callback) {
            Product.findById(prodId, callback);
        },
        page : ['product', function(callback, results) {
            Page.findOne({
                type : 'channel',
                name : results.product.channel
            }, callback);
        }],
        groupCategories : ['page', function(callback, results){
            getGroupCategories(results.page, callback);
        }]
    }, function(err, results) {
        res.render("manage/product", results);
    });
};

exports.postProductImage = function(req, res, next) {
    var prodId = req.body.prodId;
    var image = req.files.image;
    async.auto({
        fileUrlPath : function(callback) {
            var uploadPath = config.get('originProdPath');
            uploadFile(uploadPath, image, callback);
        },
        uploadProd : [ 'fileUrlPath', function(callback, results) {
            Product.findByIdAndUpdate(prodId, {
                $set : {
                    image : results.fileUrlPath
                }
            }, callback);
        } ]
    }, function(err, results) {
        res.redirect("/manage/product?id=" + prodId);
    });
};

exports.showProductImage = function(req, res, next) {
    var imgPath = req.params[0];
    var width = req.query.width;
    var height = req.query.height;

    var originPath = config.get('originProdPath');
    var resizePath = config.get('resizeProdPath');

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
            return next(err);
        }
        res.sendfile(resizeFilePath);
    });
};
