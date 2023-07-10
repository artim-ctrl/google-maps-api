'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const {logger} = require('./services/logger');
const {APP_PORT} = require('./config/config');
const getInfoByPlaceIdAction = require('./controllers/getInfoByPLaceIdAction');

let browser;
puppeteer.launch({headless: 'new'}).then(b => {
    browser = b;
})

const app = express();
app.get('/', async (req, res) => {
    logger.info(req.url);

    try {
        await getInfoByPlaceIdAction(req, res, browser);
    } catch (error) {
        logger.error(error.message);

        res.sendStatus(500);
    }
});

app.listen(APP_PORT, () => {
    const log = `Running on http://127.0.0.1:${APP_PORT}`;

    logger.info(log);

    console.log(log);
});
