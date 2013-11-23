/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var _ = require('underscore');
var mongoose = require('mongoose');
var config = require('../config');

var Schema = mongoose.Schema;
var conn = mongoose.createConnection(config.get('mongodb'), {
    server : {
        auto_reconnect : true
    }
});

var schemas = {};

schemas.Vender = new Schema({
    code : String,
    shopName : String,
    vpid : String,
    price : Number,
    available : {
        type : Boolean,
        "default" : 1
    }
});

schemas.Vender.virtual('linkAttrs').get(function() {
    switch (this.code) {
    case 'taobao':
        return 'data-itemid="' + this.vpid + '" data-rd="1" data-style="2" href="#"';
    case 'amazon':
        return 'href="http://www.amazon.cn/dp/' + this.vpid + '?tag=qiri-23"';
    }
});

schemas.Vender.virtual('name').get(function() {
    if (this.code === 'taobao') {
        return this.shopName || '淘宝网';
    } else if (this.code === 'amazon') {
        return '亚马逊';
    }
});

var collections = {
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
        categoryGroups : [ {
            title : String,
            name : String,
            categoryIds : [ String ]
        } ]
    },
    Category : { // uniq:[channel + type + name], [channel + type + title];
        // url: /channel/brand/[prodType]-[efficacy]-[skinType]
        channel : String,
        group : String,
        name : String,
        title : String,
    },
    Product : {
        channel : String,
        name : String,
        image : String,
        listPrice : Number,
        categoryIds : [ String ],
        venders : [ schemas.Vender ],
        props : [ {
            name : String,
            value : String,
        } ],
        linkGroups : [ {
            title : String,
            type : String,
            links : [ {
                text : String,
                url : String,
                image : String
            } ]
        } ]
    },
};

_(collections).each(function(schema, name) {
    schemas[name] = mongoose.Schema(collections[name], {
        strict : true
    });
});

var models = (function() {
    var result = {};
    _(schemas).each(function(schema, name) {
        result[name] = conn.model(name, schema);
    });
    return result;
})();

exports.models = models;
