var _ = require('underscore');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;

var QiriError = require('../../model/qiri-err');
var utils = require('../../model/utils');
var m = require('../../model/models').models;
var utils = require('../../model/utils');
var funcs = require('../functions');
config = require('../../config').config,

exports.addLink = function(req, res, next) {
    var link = req.body.link;
    var collection = link.collection;
    var collectionId = link.collectionId;
    var groupId = link.groupId;

    async.auto({
        update : function(callback) {
            m[collection].update({
                _id : new ObjectId(collectionId),
                'linkGroups._id' : new ObjectId(groupId)
            }, {
                $push : {
                    'linkGroups.$.links' : link
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
    var link = req.body.link;
    var collection = link.collection;
    var collectionId = link.collectionId;
    var groupId = link.groupId;
    var linkId = link.id;

    async.auto({
        update : function(callback) {
            m[collection].update({
                _id : new ObjectId(collectionId),
                'linkGroups._id' : new ObjectId(groupId),
            }, {
                $pull : {
                    'linkGroups.$.links' : {
                        _id : new ObjectId(linkId)
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

exports.changeLink = function(req, res, next) {
    var link = req.body.link;
    var collection = link.collection;
    var collectionId = link.collectionId;
    var groupId = link.groupId;
    var linkId = link.id;

    async.auto({
        linkGroups : function(callback) {
            m[collection].findById(collectionId, function(err, collection){
                callback(err, collection.linkGroups);
            });
        },
        update : [ 'linkGroups', function(callback, results) {
            var groups = utils.toHash(results.linkGroups, 'id');
            var links = groups[groupId].links;
            _(links).each(function(dbLink) {
                if (dbLink.id === linkId) {
                    dbLink.text = link.text;
                    dbLink.url = link.url;
                    dbLink.image = link.image;
                }
            });
            m[collection].update({
                _id : new ObjectId(collectionId),
                'linkGroups._id' : new ObjectId(groupId),
            }, {
                $set : {
                    'linkGroups.$.links' : links
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
    var link = req.body.link;
    var collection = link.collection;
    var collectionId = link.collectionId;
    var groupId = link.groupId;
    var linkIds = link.ids;

    async.auto({
        linkGroups : function(callback) {
            m[collection].findById(collectionId, function(err, collection) {
                callback(err, collection.linkGroups);
            });
        },
        update : [ 'linkGroups', function(callback, results) {
            var groups = utils.toHash(results.linkGroups, 'id');
            var links = utils.sortById(groups[groupId].links, linkIds);
            m[collection].update({
                _id : new ObjectId(collectionId),
                'linkGroups._id' : new ObjectId(groupId)
            }, {
                $set : {
                    'linkGroups.$.links' : links
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

exports.changeLinkGroup = function(req, res, next) {
    var group = req.body.group;
    var collection = group.collection;
    var collectionId = group.collectionId;
    var groupId = group.id;
    var title = group.title;
    var type = group.type;

    async.auto({
        update : function(callback) {
            m[collection].update({
                _id : new ObjectId(collectionId),
                "linkGroups._id" : new ObjectId(groupId)
            }, {
                $set : {
                    'linkGroups.$.title' : title,
                    'linkGroups.$.type' : type
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

exports.addLinkGroup = function(req, res, next) {
    var group = req.body.group;
    var collection = group.collection;
    var collectionId = group.collectionId;
    var title = group.title;
    var type = group.type;

    async.auto({
        update : function(callback) {
            m[collection].findByIdAndUpdate(collectionId, {
                $push : {
                    linkGroups : {
                        title : title,
                        type : type
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

exports.deleteLinkGroup = function(req, res, next) {
    var group = req.body.group;
    var collection = group.collection;
    var collectionId = group.collectionId;
    var groupId = group.id;

    async.auto({
        update : function(callback) {
            m[collection].findByIdAndUpdate(collectionId, {
                $pull : {
                    linkGroups : {
                        _id : new ObjectId(groupId)
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

exports.sortLinkGroup = function(req, res, next) {
    var group = req.body.group;
    var collection = group.collection;
    var collectionId = group.collectionId;
    var groupIds = group.ids;

    async.auto({
        linkGroups : function(callback) {
            m[collection].findById(collectionId, function(err, collection) {
                callback(err, collection.linkGroups);
            });
        },
        update : ['linkGroups', function(callback, results) {
            var linkGroups = utils.sortById(results.linkGroups, groupIds);
            m[collection].findByIdAndUpdate(collectionId, {
                $set : {
                    linkGroups : linkGroups
                }
            }, callback);
        }]
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
            m.Page.findByIdAndUpdate(page.id, {
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
            m.Category.create(category, callback);
        },
        updatePage : [ 'category', function(callback, results) {
            var category = results.category;
            m.Page.update({
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
            m.Category.findById(categoryId, callback);
        },
        deleteCategory : [ 'category', function(callback, results) {
            m.Category.findByIdAndRemove(categoryId, callback);
        } ],
        updatePage : [ 'deleteCategory', function(callback, results) {
            var category = results.category;
            m.Page.update({
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
            m.Category.findByIdAndUpdate(category.id, {
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
            m.Page.findByIdAndUpdate(categoryGroup.pageId, {
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
            m.Page.findByIdAndUpdate(group.pageId, {
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
            m.Page.findById(pageId, function(err, page) {
                callback(err, page.categoryGroups);
            });
        },
        updatePage : ['categoryGroups', function(callback, results) {
            var sortedGroups = utils.sortById(results.categoryGroups, groupIds);
            m.Page.findByIdAndUpdate(pageId, {
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
            m.Page.update({
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

exports.addProduct = function(req, res, next) {
    var product = req.body.product;

    async.auto({
        addProduct : function(callback) {
            m.Product.create(product, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeProductBasic = function(req, res, next) {
    var product = req.body.product;
    var update = {};
    update[product.key] = product.value;
    
    async.auto({
        updateProduct : function(callback) {
            m.Product.findByIdAndUpdate(product.id, {
                $set: update
            }, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeProductCategory = function(req, res, next) {
    var prodId = req.body.prodId;
    var addId = req.body.addId;
    var removeId = req.body.removeId;

    var tasks = [];
    if (addId) {
        tasks.push(function(callback) {
            m.Product.findByIdAndUpdate(prodId, {
                $addToSet : {
                    categoryIds : addId
                }
            }, callback);
        });
    }
    if (removeId) {
        tasks.push(function(callback) {
            m.Product.findByIdAndUpdate(prodId, {
                $pull : {
                    categoryIds : removeId
                }
            }, callback);
        });
    }

    async.auto(tasks, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.addProductProp = function(req, res, next) {
    var prodId = req.body.prodId;
    var name = req.body.name;
    var value = req.body.value;

    async.auto([ function(callback) {
        m.Product.findByIdAndUpdate(prodId, {
            $push : {
                props : {
                    name : name,
                    value : value
                }
            }
        }, callback);
    } ], function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeProductProp = function(req, res, next) {
    var prop = req.body.prop;

    async.auto([ function(callback) {
        m.Product.update({
            _id : new ObjectId(prop.prodId),
            'props._id' : new ObjectId(prop.id)
        }, {
            $set : {
                'props.$' : {
                    _id : new ObjectId(prop.id),
                    name : prop.name,
                    value : prop.value
                }
            }
        }, callback);
    } ], function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.deleteProductProp = function(req, res, next) {
    var prop = req.body.prop;

    async.auto([ function(callback) {
        m.Product.findByIdAndUpdate(prop.prodId, {
            $pull : {
                props : {
                    _id : new ObjectId(prop.id)
                }
            }
        }, callback);
    } ], function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.sortProductProp = function(req, res, next) {
    var prodId = req.body.prodId;
    var propIds = req.body.propIds;

    async.auto({
        props : function(callback) {
            m.Product.findById(prodId, function(err, product) {
                callback(err, product.props);
            });
        },
        updatePage : ['props', function(callback, results) {
            var sortedProps = utils.sortById(results.props, propIds);
            console.log(sortedProps);
            m.Product.findByIdAndUpdate(prodId, {
                $set : {
                    props : sortedProps
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

exports.addProductVender = function(req, res, next) {
    var vender = req.body.vender;
    async.auto({
        updatePage : function(callback) {
            m.Product.findByIdAndUpdate(vender.prodId, {
                $push : {
                    venders : {
                        code : vender.code,
                        vpid : vender.vpid,
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

exports.deleteProductVender = function(req, res, next) {
    var vender = req.body.vender;
    async.auto({
        updatePage : function(callback) {
            m.Product.findByIdAndUpdate(vender.prodId, {
                $pull : {
                    venders : {
                        _id : new ObjectId(vender.id)
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

exports.changeProductImage = function(req, res, next) {
    var image = req.body.image;
    var url = image.url;
    var prodId = image.prodId;

    async.auto({
        fileUrlPath : function(callback) {
            var uploadPath = config.originProdPath;
            funcs.download(url, uploadPath, callback);
        },
        uploadProd : [ 'fileUrlPath', function(callback, results) {
            m.Product.findByIdAndUpdate(prodId, {
                $set : {
                    image : results.fileUrlPath
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

exports.deleteProduct = function(req, res, next) {
    var prodId = req.body.prodId;

    async.auto({
        deleteProd : function(callback) {
            m.Product.findByIdAndRemove(prodId, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};
