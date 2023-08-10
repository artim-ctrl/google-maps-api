'use strict'

import {
    PROXY_USERNAME,
    PROXY_PASSWORD,
    PROXY_DNS,
    PROXY_PORT,
    PROXY_SECURE,
    PROXY,
} from '../config/config.js'
import { logger } from '../services/logger.js'
import useProxy from 'puppeteer-page-proxy'
import { getDataFromState } from '../services/getDataFromState.js'

const getInfoByPlaceIdAction = (req, res, browser) => {
    const data = []

    const placeIds = req.query.places?.split(',') ?? []
    if (0 === placeIds.length) {
        res.status(200).send({ data: [] })

        return
    }

    let count = 0
    for (const placeId of placeIds) {
        getState(browser, placeId).then((state) => {
            const placeData = getDataFromState(placeId, state)
            if (null !== placeData) {
                data.push(placeData)
            }

            count++
            if (count === placeIds.length) {
                res.status(200).json({ data })

                logger.info('Log response', { data })
            }
        })
    }
}

const getState = (browser, placeId) => {
    return new Promise(async (resolve, reject) => {
        const page = await browser.newPage()

        await page.setViewport({ width: 1, height: 1, isMobile: false })

        await page.setDefaultNavigationTimeout(60000)

        if (PROXY) {
            await useProxy(page, configureProxyString())
        }

        await page.goto(
            `https://www.google.com/maps/place/?hl=en&q=place_id:${placeId}`
        )

        const state = await page.evaluate(() => window.APP_INITIALIZATION_STATE)

        await page.close()

        resolve(state)
    })
}

const configureProxyString = () => {
    let proxyString = (PROXY_SECURE ? 'https' : 'http') + '://'
    if (PROXY_USERNAME && PROXY_PASSWORD) {
        proxyString += `${PROXY_USERNAME}:${PROXY_PASSWORD}@`
    }

    proxyString += `${PROXY_DNS}:${PROXY_PORT}`

    return proxyString
}

export { getInfoByPlaceIdAction }
