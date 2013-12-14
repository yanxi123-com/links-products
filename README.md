Show links & products
-----------------

本项目是用Nodejs和MongoDB搭建起来的、用于快速生成以链接和商品为主要内容的网站。

### 管理页面
http://hostname:port/manage


### 创建索引
```js
db.pages.ensureIndex( { name: 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, name : 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, title : 1 }, {unique : true} );
```
