const supertest = require('supertest');
const chai = require('chai');
const uuid = require('uuid');
const app = require('../index.js');


global.app = app;
global.uuid = uuid;
global.expect = chai.expect;
global.request = supertest(app);
