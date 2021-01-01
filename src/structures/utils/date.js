function createDate(ms) {
    const data = new Date(ms)

    const day = data.getDate().toString()
    const fullDate = (day.length == 1) ? '0' + day : day

    const month = (data.getMonth() + 1).toString()
    const fullMonth = (month.length == 1) ? '0' + month : month

    const fullYear = data.getFullYear()

    return `${fullDate}/${fullMonth}/${fullYear}`
}

/**
 * @param {Number} number Difference time in miliseconds
 */
function timeAgo(number) {

    const times = [
        ["second", 1],
        ["minute", 60],
        ["hour", 3600],
        ["day", 86400],
        ["week", 604800],
        ["month", 2592000],
        ["year", 31536000]
    ]
    
    number = (Date.now() - number) / 1000

    const diffs = { input: number * 1000 }

    for (let actualValue = number; actualValue > 0;) {
        
        const value = times[times.findIndex(time => time[1] > actualValue) - 1] || times[0]
        const timesOf = Math.round(actualValue / value[1])
        
        diffs[value[0]] = timesOf

        actualValue = actualValue - (value[1] * timesOf)
    }

    return diffs
}
module.exports = {
    createDate,
    timeAgo
}