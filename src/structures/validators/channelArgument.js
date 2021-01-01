const { ValidateError } = require('./Errors')

const getChannel = require("../getChannel")

async function channelArgument(data) {
    const arg = data.joinSpace ? data.args.slice(data.position).join(' ') : data.args[data.position]

    if (data.required && !arg) throw new ValidateError('MISSING_ARGUMENT')

    if (!data.required && !arg) return true

    const messageGuild = data.message.guild

    const id = (arg.match(/\d{18}/) || [])[0]

    const channel = await getChannel({
        id,
        guild: messageGuild,
        name: id ? null : arg,
        channelType: data.channelType || 'text'
    })

    if (!channel) throw new ValidateError('ARGUMENT_NOT_FOUND', { arg })

    return channel
}

module.exports = { channelArgument }