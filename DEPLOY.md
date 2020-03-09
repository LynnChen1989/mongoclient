# 

### 部署参考

http://fangzf.me/2017/06/02/%E9%83%A8%E7%BD%B2Meteor%E5%BA%94%E7%94%A8%E5%88%B0%E6%9C%8D%E5%8A%A1%E5%99%A8/

参考进行打包部署

### 创建初始用户
```
db.users.insert({ "_id" : "jP7bLQcHoG3DxvuHX", "createdAt" : ISODate("2020-03-06T05:37:41.603Z"), "services" : { "password" : { "bcrypt" : "$2a$10$wDFK0P.qSlJ49ut1tf5OZec0HxC7fCmanBmFo9eRZlMaywVY0fJWa" }, "resume" : { "loginTokens" : [ { "when" : ISODate("2020-03-06T05:40:15.811Z"), "hashedToken" : "yqFIFSP5UWg7BfSShtZ/G2nPmAJEDn+TCAFN1PKgdC4=" } ] } }, "emails" : [ { "address" : "admin@xwfintech.com", "verified" : false } ] })
```

### 必须的环境变量

```
ROOT_URL
MONGO_URL
```