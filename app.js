"use strict";

var port = process.env.PORT || 1337;
var express = require('express');
var bodyParser = require('body-parser');
var cacheResponseDirective = require('express-cache-response-directive');

var githubAuth = require('./src/github-auth.js');

var app = express();
app.use(bodyParser.json());
app.use(cacheResponseDirective());

app.post('/register', (req,res) => {
  res.cacheControl("no-cache");
  githubAuth.registerUser(req.body).then((result) => {
    res.json(result);
  });
});

app.listen(port);