var	express = require('express') 
	, app = express()
	,	CONF = require('config')
	,	util = require('irclog-util')
	, LogsProvider = require('irclog-provider')
	, logsProv;

/* Config */
// engine to call based on the extension. .html -> engine
app.engine('html', require(CONF.express.view.engine).__express);
// default engine ext to use when omitted.
app.set('view engine', CONF.express.view.engine);
app.set('views', __dirname + CONF.express.view.dir);
var beginDay = new Date(2013, 0, 10);

app.use(express.static(__dirname + CONF.express.style));
app.use(express.static(__dirname + CONF.express.javascript));
app.use(express.logger({immediate: true}));
// app.use(express.compress());
app.use(express.bodyParser());
// app.use(app.router);
app.use(express.responseTime());

logsProv = new LogsProvider(CONF.db.host, CONF.db.port, CONF.db.user, CONF.db.password);

/* My app */

app.set('title', 'irc logger');
app.set('channelPath', function (id) {
	return '/'+ id.substr(1);
});

app.get('/', function(req, res) {
	var today = new Date()
		,	days = util.enumDays(beginDay, today);
	// i could use the app.locals function for the binding
	res.render('index.html', 
		{ channels: CONF.express.channels
		,	messages: []
		,	days: days });
});

app.get('/log', function(req, res) {
	logsProv.findByChannelDay('#'+req.query.channel, req.query.day, function (err, mex) {
		if (err)
			return res.send(404) && res.redirect('/');

		var today = new Date()
			,	days = util.enumDays(beginDay, today)
			,	m = listMessages(mex);
		
		res.render('index.html', 
		{ channels: CONF.express.channels
		,	messages: m
		,	days: days });
	});
});

app.listen(CONF.express.port, CONF.express.host, function (){
  console.log(' Express server listening on port %d', 8080 );
  console.log(' Settings:\n view folder: %s\n', __dirname + CONF.express.view.dir);
});

var listMessages = function (messages) {
	var ary = []
		,	i = 0
		, s, m
		, len = messages.length;
	for (; i < len; ++i) {
		m = messages[i];
		if (m.event == CONF.events.JOIN) {
			s = m.nick +' ('+m.host+') '+'has joined the channel';
			s = '<span class="join">'+ s +'</span>';
			ary.unshift({time: m.time, text: s});
		} else if (m.event == CONF.events.PART) {
			s = m.nick +' left the channel';
			s = '<span class="part">'+ s +'</span>';
			ary.unshift({time: m.time, text: s});	
		} else if (m.event == CONF.events.NICK) {
			s = m.oldnick +' now is '+ m.newnick;
			s = '<span class="nick">'+ s +'</span>';
			ary.unshift({time: m.time, text: s});	
		} else if (m.event == CONF.events.MESSAGE) {
			s = '<span class="name">&lt;'+ m.nick +'&gt;</span>'+ m.text;
			console.log(s);
			ary.unshift({time: m.time, text: s});	
		} else if (m.event == CONF.events.ME) {
			s = m.from +' '+ m.text;
			s = '<span class="me">'+ s +'</span>';
			ary.unshift({time: m.time, text: s});	
		}
	}
	return ary;
};

