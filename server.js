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
/*var gmailTransport = nodemailer.createTransport('SMTP', {
 service: 'Gmail',
 auth: {
   user: 'martin.pielvitori@gmail.com',
   pass: 'tinchocdt00'
 }
});*/
var emailTemplates = require('email-templates');
var path = require('path');
var templatesDir = path.resolve(__dirname, '.', 'templates');

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
  res.send('Envio de mail con detalle de consumos OSDE');
});
// [END index]

// [START server_start]
server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
// [END server_start]


server.get('/send/:email/:socio', function (req, res, next) {
  console.log('sending mail to '+req.params.email+' socio '+req.params.socio);
  //sendSimpleMail(req, res);
  sendMail(req, res, 
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email '+error);
	    }
	    else {
			res.send('Se envio un email a '+req.params.email);
	    }
		return next();
	}
  );
});

server.post('/observaciones', function (req, res) {
  console.log('sending response to '+req.params.email+' socio '+req.params.socio);
  sendMail(req, res, 
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email '+error);
	    }
	    else {
			res.send('Las observaciones fueron enviadas a '+req.params.email);
	    }
		return next();
	}
  );
});

server.get('/response/:email/:id', function (req, res, next) {
  console.log('mail response to '+req.params.email+' id: '+req.params.id);
  sendMail(req, res, 
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email con observaciones '+error);
	    }
	    else {
			res.send('Hemos registrado su denuncia. Muchas gracias');
	    }
		return next();
	}
  );    
});

function sendMail(req, res, callback){
	emailTemplates(templatesDir, function(err, template) {

	  if (err) {
        console.log('Error.1 '+err);
        callback(null, 'Error.1 ('+err+')');
	  } else {

		var locals = {
	      email: req.params.email,
	      from: 'CDT <martin.pielvitori@cdt.com.ar>',
	      subject: 'Detalles de consumo - OSDE(test)',
	      url: 'http://localhost:8080',
	      socio: req.params.socio
	    };

	    // Send a single email
	    template('newsletter', locals, function(err, html, text) {
	      if (err) {
	        console.log('Error.2 '+err);
	        callback(null, 'Error.2 ('+err+')');
	      } else {
	        transporter.sendMail({
	          from: locals.from,
	          to: locals.email,
	          subject: locals.subject,
	          generateTextFromHTML: true,
	          html: html,
	          text: text
	        }, function(err, responseStatus) {
	          if (err) {
		        console.log('Error.3 '+err);
		        callback(null, 'Error.3 ('+err+')');
	          } else {
		        console.log('Envío correcto');
		        callback('Ok');	          	
	          }
	        });
	      }
	    });
	  }

	});
};

function sendSimpleMail(req, res) {
	//Sending mail
	transporter.sendMail({
	  from: 'martin.pielvitori@cdt.com.ar',
	  to: 'martinpielvitori@gmail.com',
	  subject: 'Detalles de consumo - OSDE',
	  generateTextFromHTML: true,
	  html: '<style>body {font-family: Arial,Helvetica,sans-serif;font-size: 22px;margin-top: 0px;min-height: 100%;background: #000;}</style>Nombre y apellido: <b>Martin Pielvitori</b><br>'
	}, function(error, response){
		if (error){
			console.error('Error al enviar email '+error);
			res.send('Error al enviar email '+error);
		}
		else {
			console.log('Success');
			res.send('Se envio un email a '+req.params.email);
		}
  		return next();
	});
};