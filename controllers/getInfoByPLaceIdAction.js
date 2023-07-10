'use strict';

const getDataFromState = require('../services/getDataFromState');
const useProxy = require('puppeteer-page-proxy');
const {PROXY_USERNAME, PROXY_PASSWORD, PROXY_DNS, PROXY_PORT, PROXY_SECURE} = require('../config/config');
const {logger} = require('../services/logger');

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

                logger.info('Log response', {data});
            }
        });
    }
};

const getState = (browser, placeId) => {
    return new Promise(async (resolve, reject) => {
        const page = await browser.newPage();

        await page.setViewport({width: 1, height: 1, isMobile: false});

        await page.setDefaultNavigationTimeout(60000);

        await useProxy(page, configureProxyString());

        await page.goto(`https://www.google.com/maps/place/?hl=en&q=place_id:${placeId}`);

        const state = await page.evaluate(() => window.APP_INITIALIZATION_STATE);

        await page.close();

        resolve(state);
    });
};

const configureProxyString = () => {
    let proxyString = (PROXY_SECURE ? 'https' : 'http') + '://';
    if (PROXY_USERNAME && PROXY_PASSWORD) {
        proxyString += `${PROXY_USERNAME}:${PROXY_PASSWORD}@`;
    }

    proxyString += `${PROXY_DNS}:${PROXY_PORT}`;

    return proxyString;
};

module.exports = getInfoByPlaceIdAction;