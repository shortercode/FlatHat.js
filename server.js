var config = {
	port:80, //port 80 requires admin privileges
    home:'.',
	index:'pop.html',
	watch:[ //watch these for changes and call build script
		'src',
		'timingdemo'
	],
	buildScript:'build.sh', //build script to execute
	filetypes:{
		"htm":'text/html',
		"html":'text/html',
		"js":'application/javascript',
		"json":'application/json',
		"jpg": 'image/jpeg',
		"jpeg":'image/jpeg',
		"svg":'image/svg+xml',
		"png":'image/png',
		"css":'text/css',
		"ico":'image/x-icon',
		"default":'text/plain'
	}
};

var building = false;
var waitingBuild = false;

var http 	= require('http'	),
 	fs 		= require('fs'		),
 	path 	= require('path'	),
 	chokidar= require('chokidar'),
 	exec    = require('child_process').exec;

function serverLog(text){
    console.log("["+new Date().toTimeString().split(' ')[0]+"] "+text); 
}

function rebuild(e,p){
	if(e)
		serverLog('Watched file changed: '+e);
		
	if(building){
		serverLog('Already building, delaying');
		waitingBuild = true;
		return;
	}
	serverLog('Starting build\n');
	building = true;
	exec(config.buildScript,buildCallback);
}

function buildCallback(error, stdout, stderr){
	if(stdout)
		console.log(stdout);
	if(stderr)
    	console.log(stderr);
    serverLog("Build complete");
    building = false;
    if(waitingBuild){
		waitingBuild = false;
		rebuild();
	}
}

function serveRequest(request, response){
	serverLog('"'+request.method+'" Request: "'+request.url+'"');
	request.url = request.url.split("?")[0].split("#")[0]; 
	var fileroute = path.join(config.home, request.url);
	if (request.url.length > 1 && fs.existsSync(fileroute))
	{
		var filetype = path.extname(fileroute).split('.')[1];
		if(config.filetypes[filetype])
			response.writeHead(200, {'Content-Type':config.filetypes[filetype]});
		else
			response.writeHead(200, {'Content-Type':config.filetypes["default"]});
		serverLog("Serving requested file");
		fs.createReadStream(fileroute).pipe(response);
	}
	else
	{
		if(request.url.length <= 1 && defaultpage)
		{
			serverLog("Serving default page");
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(defaultpage);
		}
		else
		{
			serverLog('Invalid request');
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.end('404');
		}
	}
};

(function(){
    var defaultpage = (function(){
        var f = path.join(config.home, config.index);
        if(fs.existsSync(f)){
            serverLog("Index page loading into cache");
            return fs.readFileSync(f);
        }
        else
        {
            serverLog("No index page found");
            return null;
        }
    }());

    if(config.watch.length){
        config.buildScript = path.join(process.cwd(), config.buildScript);
        var i = config.watch.length;
        while(i--){
            config.watch[i] = path.join(process.cwd(), config.watch[i]);
            serverLog('Watching: ' + config.watch[i]);
            chokidar.watch(
            config.watch[i],
                {ignored: /[\/\\]\./}
            ).on('change', rebuild);
        }
        setTimeout(rebuild);
    }

    var server = http.createServer(serveRequest);
    server.listen(config.port);  
    serverLog("Webserver started at port "+config.port);
}());