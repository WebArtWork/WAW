module.exports.add = function(){
	if(process.argv[3]){
		switch(process.argv[3].toLowerCase()){
			case 'part':
				if(process.argv[4].indexOf('@')>-1)
					return require(__dirname+'/git')
					.createFromPublic(process.argv[4], process.argv[5]);
				else return require(__dirname+'/pm')
					.create(process.argv[4]);
			case 'service':
				return require(__dirname+'/pm')
				.addService(process.argv[4], process.argv[5], process.argv[6]);
			default: 
				return console.log('Wrong Command.');
		}
	}else return console.log('Wrong Command.');
};
module.exports.fetch = function(){
	if(process.argv[3]){
		switch(process.argv[3].toLowerCase()){
			case 'service':
				return require(__dirname+'/pm')
				.fetchService(process.argv[4], process.argv[5], process.argv[6]);
			case 'part':
				return require(__dirname+'/git')
				.fetchPart(process.argv[4]);
			default: 
				return console.log('Wrong Command.');
		}
	}else return console.log('Wrong Command.');
};
module.exports.git = function(){
	if(process.argv[3]){
		switch(process.argv[3].toLowerCase()){
			case 'init':
				return require(__dirname+'/git')
				.init(process.argv[4],process.argv[5]);
			case 'update':
				return require(__dirname+'/git')
				.pushAll(process.argv[4],process.argv[5], function(){
					console.log('Successfully updated');
				});
			default: 
				return console.log('Wrong Command.');
		}
	}else return console.log('Wrong Command.');
};
module.exports.create = function(){
	if(process.argv[4]){
		
	}else require(__dirname+'/git').create(process.argv[3], function(){
		console.log('Successfully updated');
	});
};