const express = require('express');
const fetchRecords = require('../main').fetchRecords;

module.exports = function (db) {
  const router = express.Router();
  const appCollection = db.collection('apps');

  router.get('/', async (req, res, next) => {
    let appData = await appCollection.find(
      { hidden: { $ne: true } },
      {
        projection: {
          appId: 1,
          name: 1,
          coverArt: 1,
          rating: 1,
          _id: 0
        }
      }).toArray();
    res.render('index', { appData: appData });
  });
  router.get('/appdetails', async (req, res, next) => {
    const appId = req.query.pkg;
    let appData = await appCollection.findOne({ appId: appId });
    if(appData.additionalInfo){
      const info = {}
      appData.additionalInfo.keys().forEach(key => {
        info[key.replace(/ /, ' ')] = appData.additionalInfo[key]
      });
      appData.additionalInfo = info;
    }
    res.render('detail', {app: appData})
  });
  router.get('/refresh', async (req, res, next) => {
    fetchRecords(db).then(y => {
      res.redirect('/');
    });
  });
  return router;
};
