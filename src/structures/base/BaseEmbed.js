const texts = require('../texts.json')

class BaseEmbed {
    setCopyright(embed, lang, user) {
        return embed.setFooter(texts.copyright[lang], user.displayAvatarURL())
    }

    setAuthor(embed, user) {
        return embed.setFooter(user.tag, user.displayAvatarURL())
    }

    baseColor() {
        return 'RANDOM'
    }
}

module.exports = { BaseEmbed }