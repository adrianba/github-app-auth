"use strict";

const assert = require("assert");
const githubAuth = require("../src/github-auth.js");

describe('Github Authorization config',function() {
  it('should throw with no args',function() {
    assert.throws(function() {
      githubAuth();
    })
  });
  it('should throw with missing client_id',function() {
    assert.throws(function() {
      githubAuth({
        client_secret:'secret',
        scopes:['scope']
      });
    })
  });
  it('should throw with missing client_secret',function() {
    assert.throws(function() {
      githubAuth({
        client_id:'id',
        scopes:['scope']
      });
    })
  });
  it('should throw with missing scopes',function() {
    assert.throws(function() {
      githubAuth({
        client_id:'id',
        client_secret:'secret'
      });
    })
  });
});