/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var config = {
    site : {
        title : '七日科技',
        description : '七日美容馆为你推荐精品护肤、彩妆、香水、保健品等产品，让你健康美丽每一天。',
        logo : '/img/logo-60.gif',
        navs : [ {
            link : 'home',
            title : '首页'
        }, {
            link : 'skincare',
            title : '面部护肤'
        }, {
            link : 'makeup',
            title : '时尚彩妆'
        }, {
            link : 'men',
            title : '男士护肤'
        }, {
            link : 'perfume',
            title : '香水'
        }, {
            link : 'health',
            title : '保健品'
        } ],
    },
    port : 3000,
    mongodb : "mongodb://localhost/dbname?poolSize=10",
    cookieSecret : "your secret for cookie",
    pwdSecret : "your secret for pwd",
    encryptedPwd : "encrypted password",
    uploadPath : "/your/upload/path",
    originProdPath : "/your/upload/path/origin",
    resizeProdPath : "/your/upload/path/resize",
    amazonOption : {
        awsId : '',
        awsSecret : '',
        assocId : '',
        endPoint : 'webservices.amazon.cn'
    },
};

exports.config = config;
