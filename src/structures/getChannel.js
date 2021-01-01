const { Guild, Channel } = require("discord.js")

const { ValidateError } = require("./validators/Errors")

/**
 * Tries a lot of options to get a channel on guild by ID or Name
 * @param {{
 *  guild: Guild,
 *  id: String,
 *  name: String,
 *  channelType: 'text' | 'voice' | 'category' | 'news'
 * }}
 * @returns {Promise<Channel>} 
 */
async function getChannel({ guild, id, name, channelType }) {
    
    const findChannelByName = channel => channel.name.toLowerCase() === name.toLowerCase()
    const findChannelByNameWithoutSpace = channel => channel.name.toLowerCase() === name.replace(/ /g, '').toLowerCase()
    
    const channel = id
    ? guild.channels.cache.get(id) 
    : guild.channels.cache.find(findChannelByName)
    || guild.channels.cache.find(findChannelByNameWithoutSpace)

    if (channel && channel.type !== channelType) throw new ValidateError('INCOMPATIBLE_CHANNEL_TYPE', { expectedType: channelType, receivedType: channel.type, channelName: channel.name })
    
    return channel
}

module.exports = getChannel