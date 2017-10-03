#!/bin/env node
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var methodOverride = require('method-override');
var socket = require('socket.io');
var path = require('path');

var classifier = require('./ai/classifier');
var Client = require('./ai/client');
var pluginService = require('./ai/pluginService');

var Server = function () {

    var self = this;

    this.ipaddress = "localhost";
    this.port = 3000;

    var apiRoutes = require('./ai/api');

    this.app = express();

    this.app.use(bodyParser.json());
    this.app.use(methodOverride('X-HTTP-Method-Override'));

    this.app.use(express.static(__dirname + '/public'));
    this.app.use('/lib', express.static(__dirname + '/node_modules'));
    this.app.use('/api', apiRoutes);

    this.server = http.createServer(this.app);

    this.server.listen(this.port, function () {
        console.log('Server started on %s:%d ...', self.ipaddress, self.port);
    });

    classifier.load();

    pluginService.load();

    // TODO: if in dev mode:
    // classifier.train();

    this.io = socket(this.server);
    this.io.on('connection', function (ioClient) {
        return new Client(ioClient);
    });
};

var server = new Server();