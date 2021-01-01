const { ValidateError } = require('./Errors')

async function validateContentArgumet(data) {
    const arg = data.joinSpace ? data.args.slice(data.position).join(' ') : data.args[data.position]
    if (data.required && !arg) throw new ValidateError('MISSING_ARGUMENT')

    if (!data.required && !arg) return true

    if (data.minLength && arg.length < data.minLength) {
        throw new ValidateError('LESS_THAN_MIN_LENGTH', { arg, min: data.minLength })
    }

    if (data.maxLength && arg.length > data.maxLength) {
        if (data.cut) return arg.slice(0, data.maxLength)
        else throw new ValidateError('MAX_LENGTH_EXCEEDED', { arg, max: data.maxLength })
    }
    return arg
}

module.exports = { validateContentArgumet }