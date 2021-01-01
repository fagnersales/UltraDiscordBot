const { Message, Client } = require("discord.js")
const { BasicAPIManager } = require('../interfaces/BasicAPIManager')
const { BasicDatabaseManager } = require('../interfaces/BasicDatabaseManager')
const { BasicCollectors } = require('../interfaces/BasicCollectors')
const { translateError } = require('../utils/translateError')
const { translateText } = require('../utils/translateText')
const { validatorByType } = require('../validators/validatorByType')

class BaseCommand {
    constructor(data, config) {
        /**
         * @type {Object}
         */
        this.props = {}

        if (config.props) Object.keys(config.props).forEach(prop => this.props[prop] = null)

        /**
         * The message for this Base
         * @type {Message}
         */
        this.message = data.message

        /**
         * The client instance for this Base
         * @type {Client}
         */
        this.client = data.client

        /**
         * The arguments used in the message
         * @type {String[]}
         */
        this.args = data.args

        /**
         * The command configuration
         * @type {Object}
         */
        this.config = config

        this.lang = 'pt-br'

        const onThen = () => {
            this.setup({
                client: this.client,
                message: this.message,
                args: this.args,
                props: this.props,
                lang: this.lang,
                texts: translateText(this.config.id || this.config.name)
            })
        }

        const onCatch = error => {
            this.quote(error.message)
        }

        this.validate(this.config).then(onThen).catch(onCatch)

        this.basicAPIManager = new BasicAPIManager({ baseURI: 'https://discord.com/api/v8' })
        this.collectors = new BasicCollectors(this)
        this.basicDatabaseManager = new BasicDatabaseManager()
    }

    /**
     * Sends a content as reply for the message author
     * @param {String} content
     * @param {Message} [message] Specific message for replying 
     * @returns {Promise<Message>}
     */
    async quote(content, message) {
        if (!message instanceof Message) message = this.message

        const repliedMessage = await this.basicAPIManager.post({
            path: ['channels', this.message.channel.id, 'messages'],
            body: {
                embed: typeof content === 'object' ? content : null,
                content: typeof content === 'string' ? content : null,
                message_reference: {
                    message_id: (message || this.message).id,
                    messagechannel_id: (message || this.message).channel.id,
                    channelguild_id: (message || this.message).guild.id
                }
            },
            authorization: `Bot ${process.env.TOKEN}`
        })

        return this.message.channel.messages.fetch(repliedMessage.id)
    }

    async validate() {
        this.validatePermissions()
        await this.validateProperties()
    }

    validatePermissions() {
        if (!this.config.permissions || this.config.permissions.length === 0) return true

        const permissionsStringified = this.config.permissions.map(permission => `\`${permission}\``).join(', ')

        const mePermissions = this.message.guild.me.hasPermission(this.config.permissions)
        if (!mePermissions) throw new Error(`Não tenho as permissões ${permissionsStringified}`)

        const memberPermissions = this.message.member.hasPermission(this.config.permissions)
        if (!memberPermissions) throw new Error(`Você não tem as permissões necessárias: ${permissionsStringified}`)

        return true
    }

    async validateProperties() {
        if (!this.config.props) return true

        let index = 0;
        for (const [key, value] of Object.entries(this.config.props)) {
            try {
                const data = { ...value, key, position: index, args: this.args, message: this.message, client: this.client }
                this.props[key] = await validatorByType(value.type)(data)
            } catch (error) {
                const argumentIndex = value.joinSpace ? `${index + 1}...` : index + 1

                const translatedError = translateError(error.message)

                switch (error.message) {
                    // When the member doesn't provide an argument
                    case 'MISSING_ARGUMENT': throw new Error(translatedError({ missing_on: this.missingOn({ key, text: value.text }) }))
                    // When the argument's length is less than the mininum
                    case 'LESS_THAN_MIN_LENGTH': throw new Error(translatedError({ argument_index: argumentIndex, min: error.props.min, error_length: this.errorLength({ position: index, len: error.props.min }) }))
                    // When the argument's length is bigger than the maximum
                    case 'MAX_LENGTH_EXCEEDED': throw new Error(translatedError({ argument_index: argumentIndex, max: error.props.max, error_length: this.errorLength({ position: index, len: error.props.max }) }))
                    // When the argument's length is not equal to the specified
                    case 'UNVALID_LENGTH': throw new Error(translatedError({ argument_index: argumentIndex, length: error.props.expected, error_length: this.errorLength({ position: index, len: error.props.expected }) }))
                    // When the member doesn't provide a valid argument
                    case 'ARGUMENT_NOT_FOUND': throw new Error(translatedError({ argument_index: argumentIndex, not_found: this.notFound({ arg: (error.props || {}).arg, position: index, type: value.type, joinSpace: value.joinSpace }) }))
                    // When the member informs a channel that is not compatible with a specific type
                    case 'INCOMPATIBLE_CHANNEL_TYPE': throw new Error(translatedError({ argument_index: argumentIndex, expected_type: error.props.expectedType, received_type: error.props.receivedType, channel_name: error.props.channelName }))
                    // When the argument must be a number
                    case 'NOT_A_NUMBER': throw new Error(translatedError({ argument_index: argumentIndex }))
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

    /**
     * Warns the member where an argument is missing
     * @param {{ key: String, text: String }}
     * @returns {String}
     */
    missingOn({ key, text }) {
        return `\`\`\`\n${this.message.content} <${key}>: ${text}\`\`\``
    }

    /**
     * Warns the member when an argument could not be resolved/found
     * @param {{ arg: String, position: Number, type: String, joinSpace: Boolean }} 
     * @return {String}
     */
    notFound({ arg, position, type, joinSpace }) {
        const commandLength = this.message.content.split(' ')[0].length + 1
        const joinSpaceLength = this.message.content.slice(commandLength).length

        const reducerSpace = (acc, cur, index) => {
            if (index >= position) return acc
            return acc += ' '.repeat(cur.length + 1)
        }

        return `\`\`\`\n${this.message.content.trim()}\n${' '.repeat(commandLength)
            + this.args.reduce(reducerSpace, '')
            + '^'.repeat(joinSpace ? joinSpaceLength : arg.length)}\`\`\`_Espera-se um valor de tipo **${type}**_`
    }

    /**
     * Warns the member about an argument that does not match the min/max length
     * @param {{ position: Number, len: Number }}
     * @returns {String}
     */
    errorLength({ position, len }) {
        const commandLength = this.message.content.split(' ')[0].length + 1

        const reducerSpace = (acc, cur, index) => {
            if (index >= position) return acc
            return acc += ' '.repeat(cur.length + 1)
        }

        return `\`\`\`\n${this.message.content.trim()}\n${' '.repeat(commandLength)
            + this.args.reduce(reducerSpace, '')
            + '^'.repeat(len)}\`\`\``
    }
}

module.exports = BaseCommand