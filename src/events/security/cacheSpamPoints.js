const { GuildModel } = require("../../structures/providers/GuildModel")

module.exports = {
    listeners: 'ready',
    run: async client => {
        const guilds = await GuildModel.find({}).select(['spamDetectorPoints', 'guildID'])

        for (const { guildID, spamDetectorPoints } of guilds) {
            const guild = client.guilds.cache.get(guildID)
            if (guild) client.guilds.cache.set(guildID, { spamDetectorPoints, ...guild })
        }
    }
}