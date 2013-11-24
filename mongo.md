Mongo DB
================


### 创建索引
```js
db.pages.ensureIndex( { name: 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, type: 1, name : 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, type: 1, title : 1 }, {unique : true} );
```
