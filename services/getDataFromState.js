'use strict'

import { logger } from './logger.js'
import { dataGet } from '../helpers/array.js'
import { formatWorkingHours } from './formatWorkingHours.js'

const getDataFromState = (placeId, state) => {
    logger.info('STATE', { placeId, state })
    try {
        // place id is incorrect
        if ('Google Maps' === state[9][0]) {
            return null
        }

        const data = {
            place_id: placeId,
            working_hours: null,
        }

        // location always exists
        data.location = {
            lng: dataGet(state, '0.0.1'),
            lat: dataGet(state, '0.0.2'),
        }
        ;[data.name = null, data.address = null] =
            dataGet(state, '9.0')?.split(' · ') ?? []

        const notFormattedPayloadState = dataGet(state, '3.6')?.substring(5)
        if (null === notFormattedPayloadState) {
            logger.error('Payload state not found', { placeId, state })

            return null
        }

        const payloadState = JSON.parse(notFormattedPayloadState)
        logger.info('PAYLOAD STATE', { placeId, payloadState })

        data.phone = dataGet(payloadState, '6.178.0.0')

        data.website_url = dataGet(payloadState, '6.7.0')

        const workingHours = dataGet(payloadState, '6.34.1')
        if (null !== workingHours) {
            data.working_hours = formatWorkingHours(workingHours)
        }

        return data
    } catch (exception) {
        logger.error(exception.message)

        return null
    }
}

export { getDataFromState }
