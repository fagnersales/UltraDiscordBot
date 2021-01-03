const { Message, Client } = require('discord.js')
const { validatorByType } = require('../validators/validatorByType')
const { translateText } = require('../utils/translateText')
const { translateError } = require('../utils/translateError')

/**
 * @typedef {Object} CommandPermissions
 * @property {String[]} member Member permissions needed  
 * @property {String[]} client Client permissions needed  
 */

class BaseCommand {
    constructor(config) {

        /** @type {String} Command name */
        this.name = config.name

        /** @type {String[]} Command aliases (other names to be used) */
        this.aliases = config.aliases

        /** @type {Boolean} Wether it is a command or not */
        this.isCommand = config.isCommand

        /** @type {CommandPermissions} Command permissions needed */
        this.permissions = config.permissions

        /** @type {Object} Command props */
        this.props = {}

        if (config.props) Object.keys(config.props).forEach(prop => this.props[prop] = null)

        this.lang = 'pt-br'
        
        this.texts = translateText(config.id || config.name)

        this.configProps = config.props
    }

    async run(data) {

        const onThen = () => this.exec(data)

        const onCatch = (error) => data.message.channel.send(error.message)

        this.validate(data).then(onThen).catch(onCatch)
    }

    async validate(data) {
        this.validatePermissions(data)
        await this.validateProps(data)
    }

    validatePermissions(data) {

        if (!this.permissions) return true

        /** @type {Message} */
        const message = data.message

        const notHasPermission = target => permission => !target.permissions.has(permission)

        const getFailedMemberPermissions = () => this.permissions.member.filter(notHasPermission(message.member))

        const getFailedClientPermissions = () => this.permissions.client.filter(notHasPermission(message.guild.me))

        const failedPermissions = {
            member: getFailedMemberPermissions(),
            client: getFailedClientPermissions()
        }

        if (failedPermissions.member.length === 0 && failedPermissions.client.length === 0) return true

        const failedMemberPermissionsText = () => {
            if (failedPermissions.member.length === 0) return ''
            return failedPermissions.member.reduce((acc, cur) => `${acc} \`${cur}\``, 'Missing member permissions:')
        }

        const failedClientPermissionsText = () => {
            if (failedPermissions.client.length === 0) return ''
            return failedPermissions.client.reduce((acc, cur) => `${acc} \`${cur}\``, 'Missing client permissions:')
        }

        throw new Error(`${failedMemberPermissionsText()}${failedClientPermissionsText()}`)
    }

    async validateProps(data) {
        if (!this.configProps) return true

        let index = 0

        for (const [key, value] of Object.entries(this.configProps)) {
            try {
                const something = { ...value, ...data, key, position: index }
                this.props[key] = await validatorByType(value.type)(something)
            } catch (error) {
                const argumentIndex = value.joinSpace ? `${index + 1}...` : index + 1

                const translatedError = translateError(error.message)

                switch (error.message) {
                    // When the member doesn't provide an argument
                    case 'MISSING_ARGUMENT': throw new Error(
                        translatedError({ missing_on: this.missingOn({ key, text: value.text, messageContent: data.message.content }) })
                    )
                    // When the argument's length is less than the mininum
                    case 'LESS_THAN_MIN_LENGTH': throw new Error(
                        translatedError({ argument_index: argumentIndex, min: error.props.min, error_length: this.errorLength({ position: index, len: error.props.min, args: data.args, messageContent: data.message.content }) })
                    )
                    // When the argument's length is bigger than the maximum
                    case 'MAX_LENGTH_EXCEEDED': throw new Error(
                        translatedError({ argument_index: argumentIndex, min: error.props.min, error_length: this.errorLength({ position: index, len: error.props.max, args: data.args, messageContent: data.message.content }) })
                    )
                    // When the argument's length is not equal to the specified
                    case 'UNVALID_LENGTH': throw new Error(
                        translatedError({ argument_index: argumentIndex, length: error.props.expected, error_length: this.errorLength({ position: index, len: error.props.expected, args: data.args, messageContent: data.message.content }) })
                    )
                    // When the member doesn't provide a valid argument
                    case 'ARGUMENT_NOT_FOUND': throw new Error(
                        translatedError({ argument_index: argumentIndex, nont_found: this.notFound({ arg: (error.props || {}).arg, position: index, type: value.type, joinSpace: value.joinSpace, args: data.args, messageContent: data.message.content }) })
                    )
                    // When the member informs a channel that is not compatible with a specific type
                    case 'INCOMPATIBLE_CHANNEL_TYPE': throw new Error(
                        translatedError({ argument_index: argumentIndex, expected_type: error.props.expectedType, received_type: error.props.receivedType, channel_name: error.props.channelName })
                    )
                    // When the argument must be a number
                    case 'NOT_A_NUMBER': throw new Error(
                        translatedError({ argument_index: argumentIndex })
                    )
                    // if the error is not evoked by validatorByType#method
                    default: {
                        console.log(error)
                        throw error
                    }
                }
            }
            if (value.joinSpace === true) break;
            index++
        }
    }

    missingOn({ key, text, messageContent }) {
        return `\`\`\`\n${messageContent} <${key}>: ${text}\`\`\``
    }

    notFound({ arg, args, position, type, joinSpace, messageContent }) {
        const commandLength = messageContent.split(' ')[0].length + 1
        const joinSpaceLength = messageContent.slice(commandLength).length

        const reducerSpace = (acc, cur, index) => {
            if (index >= position) return acc
            return acc += ' '.repeat(cur.length + 1)
        }

        return `\`\`\`\n${messageContent.trim()}\n${' '.repeat(commandLength)
            + args.reduce(reducerSpace, '')
            + '^'.repeat(joinSpace ? joinSpaceLength : arg.length)
            }\`\`\`_Espera-se um valor de tipo **${type}**_`
    }

    errorLength({ position, len, messageContent, args }) {
        const commandLength = messageContent.split(' ')[0].length + 1

        const reducerSpace = (acc, cur, index) => {
            if (index >= position) return acc
            return acc += ' '.repeat(cur.length + 1)
        }

        return `\`\`\`\n${messageContent.trim()}\n${' '.repeat(commandLength)
            + args.reduce(reducerSpace, '')
            + '^'.repeat(len)}\`\`\``
    }

}

module.exports = BaseCommand