Mongo DB
================


### 创建索引
```js
db.pages.ensureIndex( { name: 1 }, {unique : true} );
db.areas.ensureIndex( { pageId: 1 } );
db.links.ensureIndex( { areaId: 1 } );
db.links.ensureIndex( { areaId: 1, text: 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, type: 1, name : 1 }, {unique : true} );
db.categories.ensureIndex( { channel: 1, type: 1, title : 1 }, {unique : true} );
```

### 添加数据示例
```js
db.nodes.insert({nid: 0, title:'首页', areas: []});

db.areas.insert({title: '面部护肤热门品牌', links: []});
db.areas.insert({title: '时尚彩妆品牌', links: []});
db.links.insert({text: '文字文字', url: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字2', url: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字3', url: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字4', url: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字5', url: 'http://www.qiri.com/', addDate: Date.now() });
db.links.insert({text: '文字6', url: 'http://www.qiri.com/', addDate: Date.now() });

db.nodes.update({nid: 0}, {$set: {areas: [] }});
db.nodes.update({nid: 0}, {$push: {areas: "527e4677c535072a46155df3" }});
db.nodes.update({nid: 0}, {$push: {areas: "527e5fb3c535072a46155df7" }});
```