const { ValidateError } = require('./Errors')

async function commandArgument(data) {
    const arg = data.joinSpace ? data.args.slice(data.position).join(' ') : data.args[data.position]

    if (data.required && !arg) throw new ValidateError('MISSING_ARGUMENT')

    if (!data.required && !arg) return true

    const command = data.client.commands.get(arg) || data.client.aliases.get(arg)

    if (!command) throw new ValidateError('ARGUMENT_NOT_FOUND', { arg })

    return command.name
}

module.exports = { commandArgument }