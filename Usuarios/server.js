/**
 * (c)2019 - IDX Consultoria e Sistemas
 */
 
//@ts-nocheck

const http = require('http');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const httpProxy = require('express-http-proxy');
const app = express();
const helmet = require('helmet');
const open = require('open');

const port = 3000;
const ip = "127.0.0.1"

// Proxy
const odataServiceProxy = httpProxy('http://127.0.0.1:44000')

app.route('/idx/*')
    .all( (req, res, next)=> {
        odataServiceProxy(req, res, next); 
});

app.disable('x-powered-by');

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static("./webapp/"));

const server = http.createServer(app);
server.listen(port, ip, () => {
    console.log("\n\n*** IDX Consultoria e Sistemas ***");
    console.log("")
    console.log(`Servidor rodando em http://${ip}:${port}`);
    console.log('Para derrubar o servidor: CTRL + C');  
});

(async () => {
    // Opens the URL in the default browser
    await open(`http://${ip}:${port}`);
})();

