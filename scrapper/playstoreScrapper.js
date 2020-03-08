const puppeteer = require('puppeteer');

class PlayStoreScrapper {
    constructor() { }
    async init(pageUrl) {
        this.pageUrl = pageUrl;
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }
    async getStoreData() {
        const appUrls = [];
        await this.page.goto(this.pageUrl);
        await this.autoScroll();
        const appList = await this.page.$$('.Vpfmgd');
        for (let i = 0; i < appList.length; i++) {
            const value = await this.getElementProperty(appList[i], 'a', 'href');
            appUrls.push(value);
        }
        return appUrls;
    }
    async autoScroll() {
        return this.page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
    async getAppsInfo() {
        const appData = [];
        const appUrls = await this.getStoreData();
        for (let i = 0; i < appUrls.length; i++) {
            const data = {};
            data.url = appUrls[i];
            data.appId = appUrls[i].match(/(?:\?|\&)id=(.+)/g)[0].replace(/^(\?|\&)id=/, '');
            await this.page.goto(appUrls[i]);
            data.name = await this.getElementProperty(this.page, '[itemprop=name]', 'innerText');
            data.genre = await this.getElementProperty(this.page, '[itemprop=genre]', 'innerText');
            data.description = await this.getElementProperty(this.page, 'meta[itemprop=description]', 'content');
            data.screenShots = [];
            const imageElements = await this.page.$$('[itemprop=image]');
            for (let j = 0; j < imageElements.length; j++) {
                const alt = await (await imageElements[j].getProperty('alt')).jsonValue();
                if (typeof alt !== 'string') break;
                if (alt.toLowerCase() == "cover art") {
                    data.coverArt = await (await imageElements[j].getProperty('src')).jsonValue();
                }
                else if (alt.toLowerCase() == "screenshot image") {
                    const imageUrl = await (await imageElements[j].getProperty('src')).jsonValue();
                    if(!imageUrl.startsWith('data'))
                        data.screenShots.push(imageUrl);
                }
            }
            data.trailer = await this.getElementProperty(this.page, '[data-trailer-url]', 'data-trailer-url');
            data.additionalInfo = {};
            const additionalInfo = await this.page.$$('.IxB2fe .hAyfc');
            for (let j = 0; j < additionalInfo.length; j++) {
                let key = await this.getElementProperty(additionalInfo[j], '.BgcNfc', 'innerText');
                key = key.toLowerCase().replace(/ /g, '_');
                if(['permissions', 'report'].includes(key)) continue;
                let selector = '.IQ1z0d .htlgb';
                if(key === 'developer') 
                    data.additionalInfo[key] = await this.getElementProperty(additionalInfo[j], '.IQ1z0d .htlgb a', 'href');
                else
                    data.additionalInfo[key] = await this.getElementProperty(additionalInfo[j], '.IQ1z0d .htlgb', 'innerText');
                switch (key) {
                    case 'content_rating': data.additionalInfo[key] = data.additionalInfo[key].split('\n')[0]
                }
            }
            data.rating = await this.getElementProperty(this.page, 'div.BHMmbe', 'innerText');
            appData.push(data);
        }
        return appData
    }
    async getElementProperty(elementHandler, selector, property) {
        try {
            const element = await elementHandler.$(selector);
            const value = await element.getProperty(property);
            return value.jsonValue();
        }
        catch {
            return null;
        }
    }
}

module.exports = PlayStoreScrapper
// const a = new PlayStoreScrapper();
// a.init("https://play.google.com/store/apps/collection/topselling_free").then(async () => {
//     const d = await a.getAppsInfo();
//     const fs = require('fs');
//     fs.writeFileSync('a.json', JSON.stringify(d));
//     fs.close(0);
//     process.exit(0);
// });
