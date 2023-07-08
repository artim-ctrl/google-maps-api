'use strict';

const getDataFromState = require('../services/getDataFromState');
const useProxy = require("puppeteer-page-proxy");
const {PROXY_USERNAME, PROXY_PASSWORD, PROXY_DNS, PROXY_PORT} = require("../config/config");

const getInfoByPlaceIdAction = async (req, res, browser) => {
    const data = [];

    const placeIds = req.query.places?.split(',') ?? [];
    for (const placeId of placeIds) {
        const page = await browser.newPage();
        await page.setViewport({width: 1, height: 1, isMobile: false});
        await page.setDefaultNavigationTimeout(60000);
        await useProxy(page, `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_DNS}:${PROXY_PORT}`);

        await page.goto(`https://www.google.com/maps/place/?hl=en&q=place_id:${placeId}`);

        const state = await page.evaluate(() => window.APP_INITIALIZATION_STATE);

        const placeData = getDataFromState(placeId, state);
        if (null !== placeData) {
            data.push(placeData);
        }
    }

    res.json({data})
}

module.exports = getInfoByPlaceIdAction;