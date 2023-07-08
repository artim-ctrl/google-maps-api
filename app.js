'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const useProxy = require('puppeteer-page-proxy');
const {logger} = require('./services/logger');
const {dataGet} = require('./helpers/array');
const {APP_PORT, PROXY_USERNAME, PROXY_PASSWORD, PROXY_DNS, PROXY_PORT} = require('./services/config');

let browser;
puppeteer.launch({headless: 'new'}).then(b => {
    browser = b;
})

const app = express();
app.get('/', async (req, res) => {
    const data = [];

    const placeIds = req.query.places?.split(',') ?? [];
    for (const placeId of placeIds) {
        const page = await browser.newPage();
        await page.setViewport({width: 1, height: 1, isMobile: false});
        await page.setDefaultNavigationTimeout(60000);
        await useProxy(page, `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_DNS}:${PROXY_PORT}`);

        const placeData = await getInfoByPlaceId(page, placeId);
        if (null !== placeData) {
            data.push(placeData);
        }
    }

    res.json({data})
});

app.listen(APP_PORT, () => {
    logger.info(`Running on 127.0.0.1:${APP_PORT}`);

    console.log(`Running on 127.0.0.1:${APP_PORT}`);
});

const getInfoByPlaceId = async (page, placeId) => {
    await page.goto(`https://www.google.com/maps/place/?hl=en&q=place_id:${placeId}`);

    const state = await page.evaluate(() => window.APP_INITIALIZATION_STATE);
    logger.info('STATE', {placeId, state});
    try {
        // place id is incorrect
        if ('Google Maps' === state[9][0]) {
            return null;
        }

        const data = {
            place_id: placeId,
            working_hours: null,
        };

        // location always exists
        data.location = {
            lng: dataGet(state, '0.0.1'),
            lat: dataGet(state, '0.0.2'),
        };

        [data.name = null, data.address = null] = dataGet(state, '9.0')?.split(' · ') ?? [];

        const notFormattedPayloadState = dataGet(state, '3.6');
        if (null === notFormattedPayloadState) {
            logger.error('Payload state not found', {placeId, state});

            return null;
        }

        const payloadState = JSON.parse(notFormattedPayloadState.substring(5));
        logger.info('PAYLOAD STATE', {placeId, payloadState});

        data.phone = dataGet(payloadState, '6.178.0.0');

        data.website_url = dataGet(payloadState, '6.7.0');

        const workingHours = dataGet(payloadState, '6.34.1');
        if (null !== workingHours) {
            data.working_hours = formatWorkingHours(workingHours);
        }

        return data;
    } catch (exception) {
        logger.error(exception.message);

        return null;
    }
}

const formatWorkingHours = (workingHours) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return workingHours.map(day => {
        if (null === day[6]) {
            return {
                day: day[0],
                time: 'Closed',
            };
        }

        const dateFrom = new Date(day[4]);
        dateFrom.setHours(day[6][0][0]);
        dateFrom.setMinutes(day[6][0][1]);

        const dateTo = new Date(day[4]);
        dateTo.setHours(day[6][0][2]);
        dateTo.setMinutes(day[6][0][3]);

        const formattedDateFrom = dateFrom.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit"});
        const formattedDateTo = dateTo.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit"});

        return {
            day: day[0],
            time: formattedDateFrom + ' - ' + formattedDateTo,
        };
    }).sort((a, b) => {
        const dayA = daysOfWeek.indexOf(a.day);
        const dayB = daysOfWeek.indexOf(b.day);

        return dayA - dayB;
    });
}
