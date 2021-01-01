const { Schema, model } = require('mongoose')

const banSchema = new Schema({
    userID: { type: String, required: true },
    reason: { type: String, required: true },
    authorID: { type: String, required: true },
    bannedAt: { type: String, default: Date.now() }
})

const kickSchema = new Schema({
    userID: { type: String, required: true },
    reason: { type: String, required: true },
    authorID: { type: String, required: true },
    kickedAt: { type: String, default: Date.now() }
})

const GuildSchema = new Schema({
    guildID: { type: String, required: true },
    spamDetectorPoints: { type: Number, default: 15 },
    informBan: { type: Boolean, default: false },
    informKick: { type: Boolean, default: false },
    informWarn: { type: Boolean, default: false },
    bansCount: { type: Number, default: 0 },
    kicksCount: { type: Number, default: 0 },
    warnsCount: { type: Number, default: 0 },
    bans: [banSchema],
    kicks: [kickSchema]
})

const GuildModel = new model('guilds', GuildSchema)

module.exports = { GuildModel }