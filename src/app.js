const express = require('express');
const bodyParser = require('body-parser');

const { sequelize } = require('./model')
const { contractModule } = require('./modules/contract')
const { jobModule } = require('./modules/job')
const { userModule } = require('./modules/user')
const { adminModule } = require('./modules/admin')

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(contractModule)
app.use(jobModule)
app.use(userModule)
app.use(adminModule)

module.exports = app;
