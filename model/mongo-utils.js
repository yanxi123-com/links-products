/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var mongoose = require('mongoose');
var config = require('../config');
var conn = mongoose.createConnection(config.get('mongodb'), {
    server : {
        auto_reconnect : true
    }
});

var schemas = {
    Link : {
        areaId : String,
        text : String,
        url : String,
        image : String,
        addDate : {
            type : Date,
            "default" : Date.now
        }
    },
    Area : {
        title : String,
        linkIds : [ String ],
        type : String,
        pageId : String,
    },
    Page : {
        type : String,
        name : String,
        title : String,
        areaIds : [ String ],
    }
};

var mongoSchemas = (function() {
    var result = {};
    for ( var name in schemas) {
        result[name] = conn.model(name, mongoose.Schema(schemas[name], {
            strict : true
        }));
    }
    return result;
}());

exports.getSchema = function(name) {
    return mongoSchemas[name];
};
