'use strict'

import express from 'express'
import puppeteer from 'puppeteer'
import { logger } from './services/logger.js'
import { APP_PORT } from './config/config.js'
import { getInfoByPlaceIdAction } from './controllers/getInfoByPLaceIdAction.js'

let browser
puppeteer.launch({ headless: 'new' }).then((b) => {
    browser = b
})

const app = express()
app.get('/', async (req, res) => {
    logger.info(req.url)

    try {
        await getInfoByPlaceIdAction(req, res, browser)
    } catch (error) {
        logger.error(error.message)

        res.sendStatus(500)
    }
})

app.listen(APP_PORT, () => {
    const log = `Running on http://127.0.0.1:${APP_PORT}`

    logger.info(log)

    console.log(log)
})
