const Comment = require('../models/comment'); // 电影评论模型
const Movie = require('../models/movie');

/* 电影评论回复控制器 */
exports.reply = function(req,res){
	// 获取Ajax发送的数据
	let _comment = req.body.comment;
	let movieId = _comment.movie;
	if(_comment.cid){
		Comment.findById(_comment.cid,function(err,comment){
			if(err) console.log(err);
			let reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content,
				meta:{
					createAt: Date.now()
				}
			}
			comment.reply.push(reply);
			comment.save(function(err,comment){
				if(err) console.log(err);
				Movie.update({_id:movieId},{$inc:{comments:1}},function(err){
					if(err)	console.log(err);
				})
				res.redirect('/movie/'+ movieId);
			})
		})
	} else {
		let comment = new Comment(_comment);
		comment.save(function(err,comment){
			if(err) console.log(err);
			Movie.update({_id:movieId},{$inc:{comments:1}},function(err){
				if(err)	console.log(err);
			})
			res.redirect('/movie/'+ movieId);
		})
	}	
}