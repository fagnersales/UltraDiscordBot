const { MessageEmbed } = require('discord.js')

const { BaseEmbed } = require('../../../structures/base/BaseEmbed')
const { timeAgo } = require('../../../structures/utils/date')

class BanEmbedder extends BaseEmbed {

    infoBan({ ban, texts, data }) {

        const descriptionData = {
            "reason": ban.reason,
            "author": ban.author,
            "banned-since": texts('banned-since', timeAgo(ban.bannedAt))
        }

        const embed = new MessageEmbed()
            .setTitle(texts('embed-info-title', { user: ban.user }))
            .setDescription(texts('embed-info-description', descriptionData))
            .setColor(this.baseColor())

        return this.setCopyright(embed, data.lang, data.user)
    }
}

module.exports = { BanEmbedder }