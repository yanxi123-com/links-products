Mongo DB
================

### 创建 collection
```js
db.createCollection('nodes');
db.createCollection('areas');
db.createCollection('links');
```

### 闯进索引
```js
db.nodes.ensureIndex( { nid: 1 }, {unique : true} );
db.areas.ensureIndex( { nid: 1 } );
db.links.ensureIndex( { areaId: 1 } );
```

### 添加数据示例
```js
db.nodes.insert({nid: 0, areas: []});
db.areas.insert({title: '面部护肤热门品牌', links: []});
db.areas.insert({title: '时尚彩妆品牌', links: []});
db.links.insert({text: '文字文字', href: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字2', href: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字3', href: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字4', href: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字5', href: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字6', href: 'http://www.qiri.com/', addDate: Date.now() });

db.nodes.update({nid: 0}, {$set: {areas: [] }});
db.nodes.update({nid: 0}, {$push: {areas: "527e4677c535072a46155df3" }});
db.nodes.update({nid: 0}, {$push: {areas: "527e5fb3c535072a46155df7" }});
```