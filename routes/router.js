const path = require('path');
const routes = require('express').Router();

//const user = require('./user');

var user = require('./user');

routes.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

routes.get('/user', require('./user').router);

module.exports = routes;