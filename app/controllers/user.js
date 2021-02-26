const _ = require('underscore');
const User = require('../models/user');

exports.register= function(req,res){
	res.render('register',{
		title: '电影交流平台'
	})
};

/* 用户登录控制器 */
exports.signin = function(req,res){
	let _user = req.body.user; 
	let name = _user.name;
	let password = _user.password;

	User.findOne({name:name},function(err,user){
		if(err){
			console.log(err);
		}
		// 若用户不存在
		if(!user){
			return res.json({'issuccess':false,'data':"用户名不存在",'place':'name'});
		}
		user.comparePassword(password,function(err,isMatch){
			if(err){
				console.log(err);
			}
			// 密码匹配
			if(isMatch){
				req.session.user = user;
				return res.json({'issuccess':true,'data':"登录成功"});
			} else {
				// 密码错误
				return res.json({'issuccess':false,'data':"密码错误",'place':'password'});
			}
		});
	})
}

/* 用户注册控制器 */	
exports.signup = function(req,res){
	let userObj = req.body.user; 
	User.findOne({name:userObj.name},function(err,user){
		if(err){
			console.log(err);
		}
		// 如果用户名已存在
		if(user){
			return res.json({'issuccess':false,'data':"用户名已存在",'place':'name'});
		} else {
			let _user = new User(userObj)
			_user.save(function(err,user){
				if(err){
					console.log(err);
				}
				req.session.user = user;
				return res.json({'issuccess':true,'data':"注册成功"});
			});
		}
	})
};
	
/* 用户注销控制器 */
exports.logout = function(req,res){
	delete req.session.user;
	res.redirect('back')
};

/* 用户列表页面渲染控制器 */
exports.userlist = function(req,res){
	User.fetch(function(err,users){
		if(err) console.log(err);
		res.render('user_list',{
			title: '用户列表',
			users: users
		})	
	})
};

/* 用户是否登陆判断中间件 */
exports.signinRequired = function(req,res,next){
	let user = req.session.user;
	if(!user){
		return res.redirect('/register#signin');
	}
	next();
}

/* 用户权限判断中间件 */
exports.adminRequired = function(req,res,next){
	let user = req.session.user;
	if(!user.role || user.role < 10){
		return res.redirect('/');
	}
	next();
};

/* 用户列表删除渲染控制器 */
exports.userDelete = function(req,res){
    let id = req.query.id;
    console.log(id);
    if(id){
        User.delete(id,function(err,user){
            if(err){
                console.log(err);
            } else {
                res.json({'success': true});
            }
        })
    }
};