const BaseCommand = require("../../../structures/base/BaseCommand")

const { BanManager } = require('./Manager')
const { BanEmbedder } = require('./Embedder')

const { Client, Message } = require('discord.js')

const ban = require("./ban")

/**
 * @typedef SetupParams
 * @property {Client} client
 * @property {Message} message
 */

const config = {
    id: 4,
    name: 'clearbans',
    aliases: ['limparbans'],
    category: 'moderation',
    description: 'Limpa todos os banimentos feitos no servidor',
    permissions: ['BAN_MEMBERS']
}

class ClearBansCommand extends BaseCommand {
    constructor(data) {
        super(data, config)
        this.embedder = new BanEmbedder()
        this.manager = new BanManager()
    }

    /** @param {SetupParams} */
    async setup({ message, texts }) {

        await this.manager.clearBans({ guild: message.guild })

        const bans = await message.guild.fetchBans()

        if (bans.size === 0) return this.quote(texts('null-bans'))

        for (const [_key, value] of bans) {
            await message.guild.members.unban(value.user.id)
        }

        return this.quote(texts('unbanned-all', { size: bans.size }))

    }
}

module.exports = { ...config, run: ClearBansCommand }