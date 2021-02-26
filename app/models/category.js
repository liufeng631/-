var mongoose = require('mongoose')
var CategorySchema = require('../schemas/category')
// 使用mongoose的模型方法编译生成模型
var Category = mongoose.model('Category',CategorySchema)
// 将模型构造函数导出
module.exports  = Category 