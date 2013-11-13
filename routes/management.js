var _ = require('underscore');
var async = require('async');
var mongoUtils = require('../model/mongo-utils.js');
var Area = mongoUtils.getSchema('Area');
var Node = mongoUtils.getSchema('Node');
var Link = mongoUtils.getSchema('Link');
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
                url : link.url
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
        updateNode : [ 'newArea', function(callback, results) {
            Node.findOneAndUpdate({
                nid : newArea.nid
            }, {
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
    var nid = req.body.nid;
    var areaIds = req.body.areaIds;

    async.auto({
        updateNode : function(callback) {
            Node.findOneAndUpdate({
                nid : nid
            }, {
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
