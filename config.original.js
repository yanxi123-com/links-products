/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */

var config = {
    port : 3000,
    mongodb : "mongodb://localhost/qiri?poolSize=10",
    cookieSecret : "your secret for cookie",
    pwdSecret : "your secret for pwd",
    encryptedPwd : "encrypted password",
};

exports.get = function(key) {
    return config[key];
};
