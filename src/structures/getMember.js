const { Guild, GuildMember } = require("discord.js")

/**
 * Tries a lot of options to get a member on guild by ID or Name
 * @param {{
 *  guild: Guild,
 *  id: String,
 *  name: String
 * }}
 * @returns {Promise<GuildMember>} 
 */
async function getMember({ guild, id, name }) {

    const findMemberByUsername = member => member.user.username.toLowerCase() === name.toLowerCase()
    const findMemberByNickname = member => member.displayName.toLowerCase() === name.toLowerCase()
    
    const findMemberByUsernameWithoutSpace = member => member.user.username.replace(/ /g, '').toLowerCase() === name.replace(/ /g, '').toLowerCase()
    const findMemberByNicknameWithoutSpace = member => member.displayName.replace(/ /g, '').toLowerCase() === name.replace(/ /g, '').toLowerCase()

    return id 
    ? await guild.members.fetch(id) 
    : guild.members.cache.find(findMemberByUsername)
    || guild.members.cache.find(findMemberByNickname)
    || guild.members.cache.find(findMemberByUsernameWithoutSpace)
    || guild.members.cache.find(findMemberByNicknameWithoutSpace)
    
}

module.exports = getMember