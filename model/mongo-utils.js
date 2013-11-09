
/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */
 
var mongoose = require('mongoose'),
    config = require('../config'),
    conn = mongoose.createConnection(config.get('mongodb'));

var schemas = {
    Link: {
        text: String,
        href: String,
        tbBrand: {type: Number, "default": 0},
        tbCat: {type: Number, "default": 0},
        addDate: { type: Date, "default": Date.now }
    },
    Area: {
        title: String,
        links: [String]     
    }
};

var mongoSchemas = (function() {
    var result = {};
    for(var name in schemas) {
        result[name] = conn.model(name,
             mongoose.Schema(schemas[name], {
                 strict: true
             })
        );
    }
    return result;
}());

exports.getSchema = function(name) {
    return mongoSchemas[name];
};

