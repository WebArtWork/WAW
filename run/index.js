var sd = {
	_express: require('express'),
	_passport: require('passport'),
	_mongoose: require('mongoose'),
	_fs: require('fs'),
	_fse: require('fs-extra'),
	_path: require('path'),
};
sd._config = JSON.parse(sd._fs.readFileSync(process.cwd()+'/config.json','utf8'));

sd._app = sd._express();
var server = require('http').Server(sd._app);
var session = require('express-session');
sd._mongoUrl = 'mongodb://'+(sd._config.mongo.host||'localhost')+':'+(sd._config.mongo.port||'27017')+'/'+(sd._config.mongo.db||'test');
var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');
sd._app.use(cookieParser());

var methodOverride = require('method-override');
sd._app.use(methodOverride('X-HTTP-Method-Override'));

var morgan = require('morgan');
sd._app.use(morgan('dev'));

var bodyParser = require('body-parser');
sd._app.use(bodyParser.urlencoded({
	'extended': 'true',
	'limit': '50mb'
}));
sd._app.use(bodyParser.json({
	'limit': '50mb'
}));

var store = new(require("connect-mongo")(session))({
	url: sd._mongoUrl
});
var sessionMaxAge = 365 * 24 * 60 * 60 * 1000;
if(typeof sd._config.session == 'number'){
	sessionMaxAge = sd._config.session;
}
var sessionMiddleware = session({
	key: 'express.sid.'+sd._config.prefix,
	secret: 'thisIsCoolSecretFromWaWFramework'+sd._config.prefix,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: sessionMaxAge
	},
	rolling: true,
	store: store
});
sd._app.use(sessionMiddleware);
sd._app.use(sd._passport.initialize());
sd._app.use(sd._passport.session());
sd._app.set('view cache', true);

sd._app.use(favicon(process.cwd() + sd._config.icon));

// Socket Management
sd._io = require('socket.io').listen(server);
var mongo = require('socket.io-adapter-mongo');
sd._io.adapter(mongo({ host: sd._config.mongo.host||'localhost', port: sd._config.mongo.port||'27017', db: sd._config.mongo.db||'test' }));
var passportSocketIo = require("passport.socketio");

sd._io.use(passportSocketIo.authorize({
	passport: sd._passport,
	cookieParser: cookieParser,
	key: 'express.sid.'+sd._config.prefix,
	secret: 'thisIsCoolSecretFromWaWFramework'+sd._config.prefix,
	store: store,
	success: function(data, accept) {
		console.log('successful connection to socket.io');
		accept();
	},
	fail: function(data, message, error, accept) {
		console.log('error');
		console.log(error);
		console.log('failed connection to socket.io:', message);
		accept();
	}
}));

require(__dirname + '/scripts')(sd);
require(__dirname + '/readAllParts')(sd);
require(__dirname + '/readAllModules')(sd, function(){
	require(__dirname + '/readAllRoutes')(sd);
	require(__dirname + '/readClientRoutes')(sd);

	server.listen(sd._config.port || 8080);
	console.log("App listening on port " + (sd._config.port || 8080));
});