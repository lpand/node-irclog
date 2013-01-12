module.exports = {
	events: {
		JOIN: 0
	,	PART: 1
	,	NICK: 2
	,	MESSAGE: 3
	, ME: 4
	}
,	db: {
		user: ''
	,	password: ''
	,	host: '192.168.15.10'
	,	port: 27017
	}
,	express: {
		view: {
			engine: 'jade'
		,	ext: '.html'
		,	dir: '/views'
		}
	,	javascript: '/js'
	,	style: '/style'
	,	channels: [

		]
	,	port: 8080
	, host: '127.0.0.1'
	}
};
