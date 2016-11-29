"use strict";

var port = process.env.PORT || 1337;
var client_id = process.env.GITHUB_CLIENT_ID;
var client_secret = process.env.GITHUB_CLIENT_SECRET;
var scopes = process.env.GITHUB_SCOPES.split(",");

var express = require('express');
var bodyParser = require('body-parser');
var cacheResponseDirective = require('express-cache-response-directive');

var githubAuth = require('./src/github-auth.js')({
  client_id, client_secret, scopes
});

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