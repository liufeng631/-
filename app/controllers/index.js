const Movie = require('../models/movie'); // 电影数据模型
const Category = require('../models/category'); // 电影分类模型
const Comment = require('../models/comment'); // 电影评论模型
const Keyword = require('../models/keyword'); // 搜索关键词模型

/* 电影首页控制器 */
exports.index = function(req, res) {
	Category.find({}).populate({path:'movies'}).exec(function(err,categories){
		if(err)  console.log(err);
		Movie.find({}).sort({pv: -1}).limit(9).exec(function(err,movies){
			res.render('index',{ // 返回首页
				title: '电影交流平台', 
				category: categories,
				ranks: movies
			});
		})
	})
}

/* 电影搜索控制器 */
exports.search = function(req,res){
	let catId = req.query.cat; // 获取电影分类查询串ID
	let search_text = req.query.search_text;
	let page = parseInt(req.query.p) || 0; // 没传默认0
	let count = 10; // 每页展示电影数量
	let start = page * count;

	if(catId){
		Category.find({_id:catId}).populate({path:'movies'}).exec(function(err,categories){
			if(err){
				console.log(err);
			}
			let category = categories[0] || {}; 
			let movies = category.movies || []; 

			let totalPage = Math.ceil(movies.length / count);
			let results = movies.slice(start,start + count);

			Keyword.find({}).sort({count: -1}).limit(10).exec(function(err,keywords){
				res.render('search',{
					title: '查询结果',
					keyword: category.name, 
					currentPage: page + 1, 
					totalPage: totalPage,  
					movies: results, 
					keywords: keywords 
				});
			})
		})
	} else {
		// 如果搜索词不为空，保存搜索关键词
		if(search_text != ''){
			Keyword.findOne({keyword:search_text},function(err,keyword){
				if(err)	console.log(err);
				if(!keyword){
					let _keyword = new Keyword({
						keyword:  search_text,
						count: 1
					});	
					_keyword.save(function(err,keyword){
						if(err)	console.log(err);
					})
				} else {
					Keyword.update({_id:keyword._id},{$inc:{count:1}},function(err){
						if(err)	console.log(err);
					})
				}
			})
		}
		Movie.find({title: new RegExp(search_text+".*",'i')}).exec(function(err,movies){
			if(err){
				console.log(err);
			}
			let totalPage = Math.ceil(movies.length / count);
			let results = movies.slice(start,start + count);
			
			Keyword.find({}).sort({count: -1}).limit(10).exec(function(err,keywords){
				res.render('search',{
					title: '查询结果',
					keyword: search_text,
					currentPage: page + 1,
					totalPage: totalPage, 
					movies: results,
					keywords: keywords
				});
			})
		})
	}
}
