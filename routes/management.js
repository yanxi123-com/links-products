var _ = require('underscore');
var async = require('async');
var mongoUtils = require('../model/mongo-utils.js');
var ObjectId = require('mongoose').Types.ObjectId;
var Area = mongoUtils.getSchema('Area');
var Page = mongoUtils.getSchema('Page');
var Link = mongoUtils.getSchema('Link');
var Category = mongoUtils.getSchema('Category');
var QiriError = require('../model/qiri-err');
var utils = require('../model/utils');

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
                'categoryGroups.name' : category.group
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
                'categoryGroups.name' : category.group
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
                        name : categoryGroup.name,
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

exports.deleteCategoryGroup = function(req, res, next) {
    var group = req.body.group;

    async.auto({
        updatePage : function(callback) {
            Page.findByIdAndUpdate(group.pageId, {
                $pull : {
                    categoryGroups: {_id: new ObjectId(group.id)}
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

exports.sortCategoryGroup = function(req, res, next) {
    var pageId = req.body.pageId;
    var groupIds = req.body.groupIds;

    async.auto({
        categoryGroups : function(callback) {
            Page.findById(pageId, function(err, page) {
                callback(err, page.categoryGroups);
            });
        },
        updatePage : ['categoryGroups', function(callback, results) {
            var sortedGroups = utils.sortById(results.categoryGroups, groupIds);
            Page.findByIdAndUpdate(pageId, {
                $set : {
                    categoryGroups : sortedGroups
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

exports.sortCategory = function(req, res, next) {
    var pageId = req.body.pageId;
    var groupId = req.body.groupId;
    var categoryIds = req.body.categoryIds;

    async.auto({
        updatePage : function(callback) {
            Page.update({
                _id : new ObjectId(pageId),
                'categoryGroups._id' : new ObjectId(groupId)
            }, {
                $set : {
                    'categoryGroups.$.categoryIds' : categoryIds
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
