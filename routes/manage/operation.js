var _ = require('underscore');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;

var QiriError = require('../../model/qiri-err');
var utils = require('../../model/utils');
var m = require('../../model/models').models;

exports.addLink = function(req, res, next) {
    var newLink = req.body.newLink;

    async.auto({
        newLink : function(callback) {
            m.Link.create(newLink, callback);
        },
        updateArea : [ 'newLink', function(callback, results) {
            m.Area.findByIdAndUpdate(newLink.areaId, {
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
            m.Area.findByIdAndUpdate(areaId, {
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
            m.Link.findByIdAndRemove(linkId, callback);
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
            m.Link.findByIdAndUpdate(link.id, {
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
            m.Area.findByIdAndUpdate(area.id, {
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
            m.Area.create(newArea, callback);
        },
        updatePage : [ 'newArea', function(callback, results) {
            m.Page.findByIdAndUpdate(newArea.pageId, {
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
            m.Area.findByIdAndRemove(areaId, callback);
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
            m.Page.findByIdAndUpdate(pageId, {
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

exports.addLink2 = function(req, res, next) {
    var newLink = req.body.newLink;

    async.auto({
        newLink : function(callback) {
            m.Link.create(newLink, callback);
        },
        updateArea : [ 'newLink', function(callback, results) {
            m.Area.findByIdAndUpdate(newLink.areaId, {
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

exports.sortLink2 = function(req, res, next) {
    var areaId = req.body.areaId;
    var linkIds = req.body.linkIds;

    async.auto({
        updateArea : function(callback) {
            m.Area.findByIdAndUpdate(areaId, {
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

exports.deleteLink2 = function(req, res, next) {
    var linkId = req.body.linkId;

    async.auto({
        deleteLink : function(callback) {
            m.Link.findByIdAndRemove(linkId, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.changeLink2 = function(req, res, next) {
    var link = req.body.link;

    async.auto({
        updateLink : function(callback) {
            m.Link.findByIdAndUpdate(link.id, {
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

exports.changeLinkGroup = function(req, res, next) {
    var group = req.body.group;
    var collection = group.collection;
    var collectionId = group.collectionId;
    var groupId = group.id;
    var title = group.title;
    var type = groups.type;
    
    async.auto({
        LinkGroups : function(callback) {
            var conditions = {
                _id : new ObjectId(collectionId)
            };
            conditions[collection + ".linkGroups._id"] = groupId;
            var update = {};
            update[collection + '.$.title'] = title;
            update[collection + '.$.type'] = type;
            m[collection].update(conditions, update, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.addArea2 = function(req, res, next) {
    var newArea = req.body.newArea;

    async.auto({
        newArea : function(callback) {
            m.Area.create(newArea, callback);
        },
        updatePage : [ 'newArea', function(callback, results) {
            m.Page.findByIdAndUpdate(newArea.pageId, {
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

exports.deleteArea2 = function(req, res, next) {
    var areaId = req.body.areaId;

    async.auto({
        deleteArea : function(callback) {
            m.Area.findByIdAndRemove(areaId, callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.json({});
    });
};

exports.sortArea2 = function(req, res, next) {
    var pageId = req.body.pageId;
    var areaIds = req.body.areaIds;

    async.auto({
        updatePage : function(callback) {
            m.Page.findByIdAndUpdate(pageId, {
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
