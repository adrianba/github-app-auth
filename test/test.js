"use strict";

const assert = require("assert");
const nock = require("nock");
const githubAuth = require("../src/github-auth.js");

const GITHUB_API_ENDPOINT = /api\.github\.com/;

describe('Github Authorization',function() {
  it('should reject on service error',function() {
    nock(GITHUB_API_ENDPOINT)
      .post("/authorizations")
      .reply(500,{"message":"Server unavailable"});

    return githubAuth.registerUser({
      user: 'fred',
      password: 'password'
    }).then(result => {
      assert.false('Should not land here');
    }).catch(e => {
      assert.equal(e.code,500);
    });
  });

  it('should get badauth with an invalid username/password',function() {
    nock(GITHUB_API_ENDPOINT)
      .post("/authorizations")
      .reply(401,{"message":"Bad credentials","documentation_url":"https://developer.github.com/v3"});

    return githubAuth.registerUser({
      user: 'fred',
      password: 'password'
    }).then(result => {
      assert.equal(result.status,"badauth");
    });
  });

  it('should get needcode with 2fa enabled',function() {
    nock(GITHUB_API_ENDPOINT)
      .post("/authorizations")
      .reply(401,{
        "message":"Must specify two-factor authentication OTP code.",
        "documentation_url":"https://developer.github.com/v3/auth#working-with-two-factor-authentication"
      }, {
        'x-github-otp':'required; sms'
      });

    return githubAuth.registerUser({
      user: 'fred',
      password: 'password'
    }).then(result => {
      assert.equal(result.status,"needcode");
    });
  });

  it('should get okay with 2fa enabled and code',function() {
    var api = nock(/api\.github\.com/)
      .post("/authorizations")
      .reply(201,{token:'abcdef'});

    return githubAuth.registerUser({
      user: 'fred',
      password: 'password',
      code: '111111'
    }).then(result => {
      assert.equal(result.status,"okay");
      assert.equal(result.token,"abcdef");
    });
  });

  it('should get okay with valid username/password and no 2fa',function() {
    var api = nock(/api\.github\.com/)
      .post("/authorizations")
      .reply(201,{"token":"abcdef"});

    return githubAuth.registerUser({
      user: 'fred',
      password: 'password'
    }).then(result => {
      assert.equal(result.status,"okay");
      assert.equal(result.token,"abcdef");
    });
  });
});
