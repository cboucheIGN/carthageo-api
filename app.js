// load librairies
const express      = require('express');
const cors         = require('cors');
const bodyParser   = require('body-parser');
const morgan       = require('morgan');
const config       = require('./config'); // get our config file

// register all models
// require('./api/models/boardgameModel');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// use morgan to log requests to the console
app.use(morgan('dev'));

// load database
// const initOptions = {
//   // promiseLib: Promise
// };
// const pgp = require('pg-promise')(initOptions);
// const db = pgp(config.database);

const routes = require('./api/routes/databaseRoutes');
routes(app);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3030;

app.listen(port);

console.log('Carthageo API server started on: ' + port);
