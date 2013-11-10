/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore'), 
    async = require('async'),
    config = require('../config'), 
    mongoUtils = require('../model/mongo-utils.js'),
    Area = mongoUtils.getSchema('Area'),
    Node = mongoUtils.getSchema('Node'),
    Link = mongoUtils.getSchema('Link'),
    QiriError = require('../model/qiri-err');

var getSortedObjects = function(objects, ids) {
    var idIndexMap = {};
    _(ids || []).each(function(id, index) {
      idIndexMap[id] = index;
    });
    return _(objects).sortBy(function(object){
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
                    if(!node) {
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
            var areas = _(results.areas).map(function(area) {
                return {
                    id : area.id,
                    title : area.title,
                    linkIds: area.linkIds,
                    links : getSortedObjects(results.areaLinks[area.id],
                            area.linkIds)
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
    getPage('manage')(req, res, next);
};
