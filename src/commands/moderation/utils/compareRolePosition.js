const { GuildMember } = require("discord.js");

/**
 * Weither the first member has higher role position than the second member
 * @param {GuildMember} firstMember
 * @param {GuildMember} secondMember
 * @returns {Boolean}
 */
function compareRolePosition(firstMember, secondMember) {
    return firstMember.roles.highest.position > secondMember.roles.highest.position
}

module.exports = { compareRolePosition }