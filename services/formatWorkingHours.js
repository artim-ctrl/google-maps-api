'use strict'

const formatWorkingHours = (workingHours) => {
    const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ]

    return workingHours
        .map((day) => {
            if (null === day[6]) {
                return {
                    day: day[0],
                    time: 'Closed',
                }
            }

            const dateFrom = new Date(day[4])
            dateFrom.setHours(day[6][0][0])
            dateFrom.setMinutes(day[6][0][1])

            const dateTo = new Date(day[4])
            dateTo.setHours(day[6][0][2])
            dateTo.setMinutes(day[6][0][3])

            const formattedDateFrom = dateFrom.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })
            const formattedDateTo = dateTo.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })

            return {
                day: day[0],
                time: formattedDateFrom + ' - ' + formattedDateTo,
            }
        })
        .sort((a, b) => {
            const dayA = daysOfWeek.indexOf(a.day)
            const dayB = daysOfWeek.indexOf(b.day)

            return dayA - dayB
        })
}

export { formatWorkingHours }
