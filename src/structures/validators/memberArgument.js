const { ValidateError } = require('./Errors')

const getMember = require("../getMember")

async function validateMemberArgument(data) {
    const arg = data.joinSpace ? data.args.slice(data.position).join(' ') : data.args[data.position]

    if (data.required && !arg) throw new ValidateError('MISSING_ARGUMENT')

    if (!data.required && !arg) return true

    const messageGuild = data.message.guild

    const id = (arg.match(/\d{18}/) || [])[0]

    const member = await getMember({
        id,
        guild: messageGuild,
        name: id ? null : arg
    })

    if (!member) throw new ValidateError('ARGUMENT_NOT_FOUND', { arg })

    return member
}

module.exports = { validateMemberArgument }