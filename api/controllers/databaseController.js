'use strict';

const config = require('../../config');
const pgp = require('pg-promise')({});
const db = pgp(config.database);

const TABLES = [
  'athlete',
  'country',
  'event',
  'medal',
  'olympiad',
  'capital'
];

exports.check = function(req, res, next) {
  const table = req.params.table;
  if (TABLES.find((t) => t === table)) {
    next();
  } else {
    res.send('la table ' + table + ' dont exist');
  }
}
exports.list = function(req, res) {
  const table = req.params.table;
  if (table === 'country') {
    return listCountry(req, res);
  }
  if (table === 'capital') {
    return listCapital(req, res);
  }

  const size = getQuerySize(req);
  const skip = getQueryPage(req) * size >= 0 ? getQueryPage(req) * size : 0;

  let sql = `SELECT * FROM ${table}`;

  if (size !== -1) {
    sql += ` LIMIT ${size} OFFSET ${skip}`;
  }

  db.any(sql)
    .then((data) => {
        // success;
        res.json(data);
    })
    .catch((error) => {
        // error;
        res.send(error);
    });
}

const listCountry = function(req, res) {

  const size = getQuerySize(req);
  const skip = getQueryPage(req) * size >= 0 ? getQueryPage(req) * size : 0;

  let sql = 'SELECT id, name, code, pop,'
          + '   first_participation, last_participation,'
          + '   geojson as geometry'
          + ' FROM country';

  if (size !== -1) {
    sql += ` LIMIT ${size} OFFSET ${skip}`;
  }

  db.any(sql)
    .then((data) => {
        // success;
        // data.forEach((item) => item.geometry = JSON.parse(item.geometry));
        const result = data.map((item) => {
          return {
            type: 'Feature',
            properties: {
              id: item.id,
              name: item.name,
              code: item.code,
              pop: item.pop,
              first_participation: item.first_participation,
              last_participation: item.last_participation
            },
            geometry: JSON.parse(item.geometry)
          };
        });
        res.json({
          type: 'FeatureCollection',
          features: result
        });
    })
    .catch((error) => {
        // error;
        res.send(error);
    });
}


const listCapital = function(req, res) {

  const size = getQuerySize(req);
  const skip = getQueryPage(req) * size >= 0 ? getQueryPage(req) * size : 0;

  let sql = 'SELECT label_rank, name, '
          + '   country_name, country_code,'
          + '   geojson as geometry'
          + ' FROM capital';

  if (size !== -1) {
    sql += ` LIMIT ${size} OFFSET ${skip}`;
  }

  db.any(sql)
    .then((data) => {
        // success;
        // data.forEach((item) => item.geometry = JSON.parse(item.geometry));
        const result = data.map((item) => {
          return {
            type: 'Feature',
            properties: {
              label_rank: item.label_rank,
              name: item.name,
              country_name: item.country_name,
              country_code: item.country_code
            },
            geometry: JSON.parse(item.geometry)
          };
        });
        res.json({
          type: 'FeatureCollection',
          features: result
        });
    })
    .catch((error) => {
        // error;
        res.send(error);
    });
}

const getQuerySize = function(req) {
  return req.query && req.query.size ? parseInt(req.query.size) : -1;
}

const getQueryPage = function(req) {
  return req.query && req.query.page ? parseInt(req.query.page) : 0;
}


exports.checkInjection = function(req, res, next) {
  next();
}

exports.query = function(req, res) {
  const sql = req.body && req.body.sql ? req.body.sql : null;

  if (!sql) {
    return res.send('Requete vide');
  } else {
    // return res.json(sql);
  }

  db.any(sql)
    .then((data) => {
        // success;
        res.json(data);
    })
    .catch((error) => {
        // error;
        res.send(error.message);
    });
}
