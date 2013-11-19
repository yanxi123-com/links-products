var _ = require('underscore');
var async = require('async');
var mongoUtils = require('../model/mongo-utils.js');
var Area = mongoUtils.getSchema('Area');
var Page = mongoUtils.getSchema('Page');
var Link = mongoUtils.getSchema('Link');
var Category = mongoUtils.getSchema('Category');
var QiriError = require('../model/qiri-err');

exports.addLink = function(req, res, next) {
    var newLink = req.body.newLink;

    async.auto({
        newLink : function(callback) {
            Link.create(newLink, callback);
        },
        updateArea : [ 'newLink', function(callback, results) {
            Area.findByIdAndUpdate(newLink.areaId, {
                $push : {
                    linkIds : results.newLink.id
                }
            }, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.sortLink = function(req, res, next) {
    var areaId = req.body.areaId;
    var linkIds = req.body.linkIds;

    async.auto({
        updateArea : function(callback) {
            Area.findByIdAndUpdate(areaId, {
                $set : {
                    linkIds : linkIds
                }
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.deleteLink = function(req, res, next) {
    var linkId = req.body.linkId;

    async.auto({
        deleteLink : function(callback) {
            Link.findByIdAndRemove(linkId, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeLink = function(req, res, next) {
    var link = req.body.link;

    async.auto({
        updateLink : function(callback) {
            Link.findByIdAndUpdate(link.id, {
                text : link.text,
                url : link.url,
                image : link.image
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeArea = function(req, res, next) {
    var area = req.body.area;
    async.auto({
        updateArea : function(callback) {
            Area.findByIdAndUpdate(area.id, {
                title : area.title,
                type : area.type
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.addArea = function(req, res, next) {
    var newArea = req.body.newArea;

    async.auto({
        newArea : function(callback) {
            Area.create(newArea, callback);
        },
        updatePage : [ 'newArea', function(callback, results) {
            Page.findByIdAndUpdate(newArea.pageId, {
                $push : {
                    areaIds : results.newArea.id
                }
            }, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.deleteArea = function(req, res, next) {
    var areaId = req.body.areaId;

    async.auto({
        deleteArea : function(callback) {
            Area.findByIdAndRemove(areaId, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.sortArea = function(req, res, next) {
    var pageId = req.body.pageId;
    var areaIds = req.body.areaIds;

    async.auto({
        updatePage : function(callback) {
            Page.findByIdAndUpdate(pageId, {
                $set : {
                    areaIds : areaIds
                }
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changePage = function(req, res, next) {
    var page = req.body.page;

    async.auto({
        updatePage : function(callback) {
            Page.findByIdAndUpdate(page.id, {
                $set : {
                    title : page.title,
                    name : page.name,
                }
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.addCategory = function(req, res, next) {
    var category = req.body.category;

    async.auto({
        category : function(callback) {
            Category.create(category, callback);
        },
        updatePage : [ 'category', function(callback, results) {
            var category = results.category;
            Page.update({
                type : 'channel',
                name : category.channel,
                'categoryGroups.categoryType' : category.type
            }, {
                $push : {
                    'categoryGroups.$.categoryIds' : category.id
                }
            }, callback);
        } ]
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.deleteCategory = function(req, res, next) {
    var categoryId = req.body.categoryId;

    async.auto({
        category : function(callback) {
            Category.findById(categoryId, callback);
        },
        deleteCategory : [ 'category', function(callback, results) {
            Category.findByIdAndRemove(categoryId, callback);
        } ],
        updatePage : [ 'deleteCategory', function(callback, results) {
            var category = results.category;
            Page.update({
                type : 'channel',
                name : category.channel,
                'categoryGroups.categoryType' : category.type
            }, {
                $pull : {
                    'categoryGroups.$.categoryIds' : categoryId
                }
            }, callback);
        } ],
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeCategory = function(req, res, next) {
    var category = req.body.category;

    async.auto({
        updateCategory : function(callback) {
            Category.findByIdAndUpdate(category.id, {
                $set : {
                    title : category.title,
                    name : category.name,
                }
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.addCategoryGroup = function(req, res, next) {
    var categoryGroup = req.body.categoryGroup;

    async.auto({
        updatePage : function(callback) {
            Page.findByIdAndUpdate(categoryGroup.pageId, {
                $push : {
                    categoryGroups : {
                        title : categoryGroup.title,
                        categoryType : categoryGroup.type,
                    }
                }
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};
