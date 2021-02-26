var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({ 
	name:{
		unique: true,
		type: String
	},
	// email: String,
	password: String, 
	role: {
		type: Number,
		default: 0
	},
	meta:{
		createAt:{
			type:Date,
			default: Date.now()
		},
		updateAt:{
			type:Date,
			default: Date.now()
		}
	}
})

// 为模式添加新的方法
UserSchema.pre('save',function(next){
	var user = this
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
		if(err) return next(err);
		bcrypt.hash(user.password,salt,null,function(err,hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
})

// 实例方法
UserSchema.methods = {
	comparePassword: function(password,cb){
		bcrypt.compare(password,this.password,function(err,isMatch){
			if(err) return cb(err);
			cb(null,isMatch);
		})
	}
}

UserSchema.statics = {
	fetch: function(cb){
		return this.find({}).sort('meta.updateAt').exec(cb);
	},
	findByName: function(name,cb){
		return this.findOne({name: name}).exec(cb);
	},
	delete: function(id,cb){
		return this.remove({_id: id}).exec(cb);
	},
}

module.exports = UserSchema