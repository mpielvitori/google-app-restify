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
   pass: 'pass'
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
  sendMail(req, res, 
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email de consumos '+error);
	    }
	    else {
			res.send('Se envio un email con Consumos a '+req.params.email+' (App OSDE)');
	    }
		return next();
	}
  );
});

/* Cambiar llamada desde gform para que ejecute por post en vez de ir por get
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
});*/

server.get('/observaciones/:socio/:motivo/:observaciones/:email/:consumo', function (req, res, next) {
  console.log('Ejecuta servicio por GET -> Motivo: '+req.params.motivo);
  sendMailResponse(req, res, 
  	function (successCallback, error) {
	    if (error) {
	        res.send('Error al enviar email con respuesta de google form '+error);
	    }
	    else {
			res.send('Hemos registrado su descargo. Muchas gracias(App OSDE)');
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
	      socio: req.params.socio,
	      gform: 'https://docs.google.com/forms/d/1uj1wZI-X9ZyMs4Zoelw9QVS8ACezeu1q6fCIEyLNvHo/formResponse',
	      gformlink: 'https://docs.google.com/forms/d/1uj1wZI-X9ZyMs4Zoelw9QVS8ACezeu1q6fCIEyLNvHo/viewform'
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

function sendMailResponse(req, res, callback) {
	//'/observaciones/:socio/:motivo/:observaciones/:email/:consumo'
	//Sending mail
	emailTemplates(templatesDir, function(err, template) {

	  if (err) {
        console.log('Error.4 '+err);
        callback(null, 'Error.4 ('+err+')');
	  } else {

		var locals = {
	      email: req.params.email,
	      from: 'CDT <martin.pielvitori@cdt.com.ar>',
	      subject: 'Registro de descargo - OSDE(test)',
	      socio: req.params.socio,
	      motivo: req.params.motivo,
	      consumo: req.params.consumo,
	      observaciones: req.params.observaciones
	    };

	    // Send a single email
	    template('response', locals, function(err, html, text) {
	      if (err) {
	        console.log('Error.5 '+err);
	        callback(null, 'Error.5 ('+err+')');
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
		        console.log('Error.6 '+err);
		        callback(null, 'Error.6 ('+err+')');
	          } else {
		        console.log('Envío respuestas correcto');
		        callback('Respuesta Ok');	          	
	          }
	        });
	      }
	    });
	  }

	});

};