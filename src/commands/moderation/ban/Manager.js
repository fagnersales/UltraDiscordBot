const { GuildModel } = require('../../../structures/providers/GuildModel')

const { Guild, GuildMember, User } = require('discord.js')

/**
 * @typedef BanParameters
 * @property {Guild} guild
 * @property {GuildMember} member
 * @property {User} author
 * @property {String} reason
 */

/**
 * @typedef UnBanParameters
 * @property {Guild} guild
 * @property {String} userID
 */

class BanManager {
    /**
     * Adds a ban into the database 
     * @param {BanParameters}
     * @returns {Promise<any>
     */
    add({ guild, member, author, reason }) {

        const query = { guildID: guild.id }

        const ban = { reason, authorID: author.id, userID: member.id }

        const update = {
            guildID: guild.id,
            $push: { bans: ban },
            $inc: { bansCount: 1 }
        }

        const options = { upsert: true, new: true }

        return GuildModel.findOneAndUpdate(query, update, options)
    }

    /**
     * Removes a ban from the database
     * @param {UnBanParameters}
     * @returns {Promise<any>}
    */
    async undo({ guild, userID }) {

        const query = { guildID: guild.id }

        const update = { $pull: { bans: { userID } } }

        const options = { new: true }

        const newDocument = await GuildModel.updateOne(query, update, options)

        return newDocument.nModified > 0
            ? await GuildModel.findOneAndUpdate(query, { $inc: { bansCount: 1 } })
            : false

    }

    async findByID({ guild, userID }) {

        const query = { guildID: guild.id }
        const selector = { bans: { $elemMatch: { userID } } }

        const document = await GuildModel.findOne(query).select(selector)

        return document ? document.bans[0] : null
    }

    async clearBans({ guild }) {
        const query = { guildID: guild.id }
        const update = { $set: { 'bansCount': 1, bans: [] } }
        const options = { new: true }
        return GuildModel.findOneAndUpdate(query, update, options)
    }

    /**
     * Weither this ban should ban informed to the member 
     * @param {{guild: Guild}}
     * @returns {Promise<Boolean>}
     */
    async inform({ guild }) {
        return GuildModel.findOne({ guildID: guild.id }).then(data => data ? data.informBan || false : null)
    }
}

module.exports = { BanManager }