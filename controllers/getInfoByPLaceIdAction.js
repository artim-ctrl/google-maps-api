'use strict';

const getDataFromState = require('../services/getDataFromState');
const useProxy = require("puppeteer-page-proxy");
const {PROXY_USERNAME, PROXY_PASSWORD, PROXY_DNS, PROXY_PORT} = require("../config/config");

const getInfoByPlaceIdAction = (req, res, browser) => {
    const data = [];

    const placeIds = req.query.places?.split(',') ?? [];
    let count = 0;
    for (const placeId of placeIds) {
        getState(browser, placeId).then(state => {
            const placeData = getDataFromState(placeId, state);
            if (null !== placeData) {
                data.push(placeData);
            }

            count++;
            if (count === placeIds.length) {
                res.status(200).json({data})
            }
        });
    }
}

const getState = (browser, placeId) => {
    return new Promise((resolve, reject) => {
        browser.newPage().then(page => {
            page.setViewport({width: 1, height: 1, isMobile: false}).then(() => {
                page.setDefaultNavigationTimeout(60000)

                // TODO: it's temporary
                // useProxy(page, `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_DNS}:${PROXY_PORT}`).then(() => {
                    page.goto(`https://www.google.com/maps/place/?hl=en&q=place_id:${placeId}`).then(() => {
                        page.evaluate(() => window.APP_INITIALIZATION_STATE).then(state => {
                            resolve(state);

                            page.close();
                        });
                    });
                // });
            });
        });
    });
};

module.exports = getInfoByPlaceIdAction;