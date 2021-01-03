const BaseCommand = require("../../../structures/base/BaseCommand")

const { BanManager } = require('./Manager')
const { BanEmbedder } = require('./Embedder')

const { Client, Message, GuildMember } = require('discord.js')

const { compareRolePosition } = require('../utils/compareRolePosition')

/**
 * @typedef Props
 * @property {GuildMember} memberToBan
 * @property {String} [reason]
 */

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 */

class BanCommand extends BaseCommand {
    constructor() {
        super({
            id: 1,
            name: 'ban',
            aliases: ['banir'],
            category: 'moderation',
            description: 'Bane um usuário do servidor',
            props: {
                'memberToBan': {
                    type: 'member',
                    text: 'O membro que será banido',
                    required: true,
                    position: 0
                },
                'reason': {
                    type: 'text',
                    minLength: 4,
                    maxLength: 512,
                    joinSpace: true,
                    text: 'A razão do banimento',
                    required: false,
                    position: 1
                }
            },
            permissions: {
                member: ['BAN_MEMBERS'],
                client: ['BAN_MEMBERS']
            }
        })

        this.embedder = new BanEmbedder()
        this.manager = new BanManager()
    }

    /** @param {SetupParams} */
    async exec({ client, message }) {

        /** @type {Props} */
        const { memberToBan, reason = this.texts('default-reason') } = this.props

        const { guild } = message

        if (memberToBan.user.equals(message.author)) return message.reply(this.texts('is-yourself'))

        if (memberToBan.user.equals(client.user)) return message.reply(this.texts('is-myself'))

        const isHigherThanMe = compareRolePosition(memberToBan.guild.me, memberToBan)
        if (!isHigherThanMe) return message.reply(this.texts('higher-than-me'))

        const isHigherThanAuthor = compareRolePosition(message.member, memberToBan)
        if (!isHigherThanAuthor) return message.reply(this.texts('higher-than-you'))

        if (!memberToBan.bannable) return message.reply(this.texts('unbannable'))

        const shouldInform = await this.manager.inform({ guild })

        const member = memberToBan
        const author = message.author

        await this.manager.add({ guild, reason, member, author })

        const guildName = guild.name

        const informed = shouldInform ? await memberToBan.send(this.texts('you-got-banned', { reason, guildName })).then(_ => true).catch(_ => false) : false

        const banned = await memberToBan.ban({ reason }).then(_ => true).catch(console.log)

        const userTag = memberToBan.user.tag

        if (banned) return message.channel.send(this.texts('success-ban', {
            reason, userTag,
            informed: informed ? ':thumbsup:' : ':thumbsdown:'
        }))

        return message.channel.send(this.texts('unsuccess-ban', { userTag }))
    }
}

module.exports = new BanCommand()