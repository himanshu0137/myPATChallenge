const PlayStoreScrapper = require('./scrapper/playstoreScrapper');

async function fetchRecords(db) {
    const scrapper = new PlayStoreScrapper();
    await scrapper.init("https://play.google.com/store/apps/collection/topselling_free");
    const currentAppData = await scrapper.getAppsInfo();
    const appCollection = db.collection('apps');
    const existingAppData = await appCollection.find({}).toArray();

    if (!existingAppData.length) {
        await appCollection.insertMany(currentAppData);
        return
    }
    const operations = [];
    currentAppData.forEach(appData => {
        const existingAppIndex = existingAppData.findIndex(x => x.appId === appData.appId);
        if (existingAppIndex > -1) {
            appData._id = existingAppData[existingAppIndex]._id;
            appData.hidden = false;
            operations.push({
                replaceOne: {
                    filter: { _id: existingAppData[existingAppIndex]._id },
                    replacement: appData
                }
            });
            existingAppData[existingAppIndex].checked = true;
        }
        else {
            operations.push({
                insertOne: {
                    document: appData
                }
            });
        }
    });
    const oldApps = existingAppData.filter(x => !x.checked);
    oldApps.forEach(x => {
        x.hidden = true;
        operations.push({
            updateOne: {
                filter: { _id: x._id },
                update: { $set: { hidden: true } }
            }
        });
    });
    const result = await appCollection.bulkWrite(operations);
    return result;
}

module.exports = {
    fetchRecords: fetchRecords
}