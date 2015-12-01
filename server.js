// Copyright 2015, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START server]
var restify = require('restify');
var nodemailer = require('nodemailer');
var directTransport = require('nodemailer-direct-transport');
var transporter = nodemailer.createTransport(directTransport({name:"cdt.com.ar",debug:false}));

var server = restify.createServer({
  name: 'appengine-restify',
  version: '1.0.0'
});
// [END server]

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

// [START index]
server.get('/', function (req, res) {
  res.send('Hello World! Restify.js on Google App Enginesasas.');
});
// [END index]

// [START server_start]
server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
// [END server_start]


server.get('/send/:email', function (req, res, next) {
  console.log('sending mail to '+req.params.email);
  sendMail(req, res);
  res.send('Se envio un email a '+req.params.email);
  return next();
});

function sendMail(req, res) {
	//Sending mail
	transporter.sendMail({
	  from: 'martin.pielvitori@cdt.com.ar',
	  to: 'martinpielvitori@gmail.com',
	  subject: 'Detalles de consumo - OSDE',
	  generateTextFromHTML: true,
	  html: 'Nombre y apellido: <b>'+'Martin Pielvitori'+'</b><br>'
	}, function(error, response){
		if (error){
			console.error('Error al enviar mail '+error);
		}
		console.log('Success');
	});
};