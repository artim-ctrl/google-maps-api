'use strict'

/**
 * const object = {
 *     name: 'Your name',
 *     parent: {
 *         name: 'Your parent name',
 *     },
 * };
 *
 * dataGet(object, 'name'); // 'Your name'
 * dataGet(object, 'parent.name'); // 'Your parent name'
 * dataGet(object, 'value', 'defaultValue'); // 'defaultValue'
 */
const dataGet = (object, path, defaultValue = null) => {
    const keys = path.split('.')
    let value = object

    for (const key of keys) {
        if (!value || !(key in value)) {
            return defaultValue
        }

        value = value[key]
    }

    return value
}

export { dataGet }
