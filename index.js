#!/usr/bin/env node
var fs = require('fs');
var fse = require('fs-extra');
if (fs.existsSync(__dirname+'/config.json')) {
	var config = fse.readJsonSync(__dirname+'/config.json', {
		throws: false
	});
}else var config = {};
var projectConfig = false;
if (fs.existsSync(process.cwd()+'/config.json')) {
	projectConfig = fse.readJsonSync(process.cwd()+'/config.json', {
		throws: false
	})||{};
}
if (fs.existsSync(process.cwd()+'/server.json')) {
	var extra = fse.readJsonSync(process.cwd()+'/server.json', {
		throws: false
	})||{};
	for(var key in extra){
		projectConfig[key] = extra[key];
	}
}

var exeCode;
var should_have_nodemon = function(){
	if(!projectConfig){
		console.log('This is not waw project');
		process.exit();
	}
	try {
		exeCode = require('../nodemon');
	} catch (err) {
		console.log("You have to install nodemon globally:\nnpm i -g nodemon");
		process.exit(0);
	}
}
var run = function(){
	var path = require('path');
	fse.mkdirsSync(process.cwd()+'/server');
	fse.mkdirsSync(process.cwd()+'/client');
	// add check if this is waw project
	var obj = {
		script: __dirname+'/run/index.js',
		ext: 'js json html css'
	}
	obj.watch = [process.cwd()+'/server'];
	var clientRoot = process.cwd()+'/client';
	fse.mkdirsSync(clientRoot);
	fse.mkdirsSync(process.cwd()+'/client');
	obj.ignore = projectConfig.dererIgnore||[];
	if (fs.existsSync(clientRoot + '/config.json')) {
		var info = fse.readJsonSync(clientRoot + '/config.json', {
			throws: false
		});
		for (var j = 0; j < info.router.length; j++) {
			obj.watch.push(clientRoot + '/' + info.router[j].src);
		}
		if(Array.isArray(info.plugins)){			
			for (var j = 0; j < info.plugins.length; j++) {
				let pluginLoc = clientRoot + '/js/' + info.plugins[j];
				//fse.mkdirsSync(pluginLoc);
				obj.ignore.push(pluginLoc+'/'+info.plugins[j]+'.js');
				obj.ignore.push(pluginLoc+'/'+info.plugins[j]+'-min.js');
				obj.watch.push(pluginLoc);
			}
		}
	} else {
		var pages = fs.readdirSync(process.cwd() + '/client').filter(function(file) {
			return fs.statSync(path.join(process.cwd() + '/client', file)).isDirectory();
		});
		for (var i = 0; i < pages.length; i++) {
			var pageUrl = clientRoot + '/' + pages[i];
			if (fs.existsSync(pageUrl + '/config.json')) var info = fse
				.readJsonSync(pageUrl + '/config.json', {
					throws: false
				});
			else var info = false;
			if (!info) continue;
			for (var j = 0; j < info.router.length; j++) {
				obj.watch.push(pageUrl + '/' + info.router[j].src);
			}
		}
	}
	obj.watch.push(process.cwd()+'/config.json');
	exeCode(obj);
}
var should_have_pm2 = function(){
	if(!projectConfig){
		console.log('This is not waw project');
		process.exit();
	}
	try {
		exeCode = require('../pm2');
	} catch (err) {
		console.log("You have to install pm2 globally:\nnpm i -g pm2");
		process.exit(0);
	}
}
var serve = function(){
	if(!projectConfig){
		console.log('This is not waw project');
		process.exit();
	}
	exeCode.connect(function(err) {
		if (err) {
			console.error(err);
			process.exit(2);
		}
		exeCode.start({
			name: projectConfig.name||process.cwd(),
			script: __dirname+'/run/index.js',
			exec_mode: 'cluster',
			instances: 1,
			max_memory_restart: '200M'
		}, function(err, apps) {
			exeCode.disconnect();
			process.exit(2);
		});
	});
}
var stopServe = function(){
	exeCode.connect(function(err) {
		if (err) {
			console.error(err);
			process.exit(2);
		}
		exeCode.delete(projectConfig.name||process.cwd(), function(err, apps) {
			exeCode.disconnect();
			process.exit(2);
		});
	});
}
var restart = function(){
	exeCode.connect(function(err) {
		if (err) {
			console.error(err);
			process.exit(2);
		}
		exeCode.delete(projectConfig.name||process.cwd(), function(err, apps) {
			exeCode.start({
				name: projectConfig.name||process.cwd(),
				script: __dirname+'/run/index.js',
				exec_mode: 'cluster',
				instances: 1,
				max_memory_restart: '200M'
			}, function(err, apps) {
				exeCode.disconnect();
				process.exit(2);
			});
		});
	});
}
if(process.argv[2]){
	var exe = __dirname+'/exe';
	switch(process.argv[2].toLowerCase()){
	/*
	* Run
	*/
		// Nodemon
		case 'r':
		case 'run':
			should_have_nodemon();
			return run();
		// PM2
		case 's':
		case 'start':
			should_have_pm2();
			return serve();
		case 'r':
		case 'restart':
			should_have_pm2();
			return restart();
		case 'stop':
			should_have_pm2();
			return stopServe();
	/*
	* Executable Commands
	*/
		// Version Check
		case '--version':
		case '-version':
		case '--v':
		case '-v':
			var config = fse.readJsonSync(__dirname+'/package.json', {throws: false});
			console.log('waw version is '+config.version);
			return;
		// Parts Management
		case 'addpart':
		case 'part':
		case 'add':
		case 'p':
		case 'a':
		case 'ap':
			if(process.argv[3]){
				require(exe+'/part')(process.argv[3]);
			}else{
				require(exe).part();
			}
			return;
		// Initialize Project
		case 'new':
		case 'init':
		case 'n':
		case 'i':
			if(process.argv[3]){
				require(exe).install(process.argv[3]);
			}else{
				require(exe).project_name();
			}
			return;
		// Update Management
		case 'u':
		case 'update':
			require(exe+'/update').project(process.argv[3], function(){
				should_have_pm2();
				restart();
			});
			return;
		case 'uw':
			require(exe+'/update').framework();
			return;
		// Domain Management
		case 'domain_list':
		case 'domainlist':
		case 'dl':
			return require(exe+'/domain').list(require(__dirname+'/sd')());
		case 'domain_remove':
		case 'domain_delete':
		case 'domainremove':
		case 'domaindelete':
		case 'dd':
		case 'dr':
			return require(exe).remove_domain(require(__dirname+'/sd')());
		case 'domain_add':
		case 'domainadd':
		case 'da':
			return require(exe).add_domain(require(__dirname+'/sd')());
		case 'd':
		case 'domain':
			if(!process.argv[3]) process.argv[3]='';
			switch(process.argv[3].toLowerCase()){
				case 'remove':
				case 'delete':
				case 'r':
				case 'd':
					return require(exe).remove_domain(require(__dirname+'/sd')());
				case 'add':
				case 'a':
					return require(exe).add_domain(require(__dirname+'/sd')());
				case 'list':
				case 'l':
					return require(exe+'/domain').list(require(__dirname+'/sd')());
				default:
					return require(exe).domain(require(__dirname+'/sd')());
			}
		// Translate Management
		case 't':
		case 'tr':
		case 'translate':
			if(process.argv[3].toLowerCase()=='update'||process.argv[3].toLowerCase()=='u')
				require(exe+'/tr.js').update();
			else require(exe+'/tr.js').fetch();
			return;
		case 'tf':
			require(exe+'/tr.js').fetch();
			return;
		case 'tu':
			require(exe+'/tr.js').update();
			return;
		default:
			return console.log('Wrong Command.');
	/*
	*	More Things Comming :)
	*/
	}
} else {
	should_have_nodemon();
	return run();
}