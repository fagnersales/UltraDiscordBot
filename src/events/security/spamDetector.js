const data = new Map()

const incrementMessage = (message, detectorPoints) => {
    const location = `${message.guild.id}-${message.channel.id}`

    const { timeout, messages } = data.get(location)

    clearTimeout(timeout)

    if (messages.length >= detectorPoints) {
        return message.client.emit('spamDetected', message.guild, message.channel, messages, detectorPoints)
    }

    console.log(`{${location}} Reseted timeout and added one message (${messages.length + 1})`)
    data.set(location, {
        timeout: setTimeout(() => {
            console.log(`{${location}} no messages after 5 seconds!`)
            data.delete(location)
        }, 5000),
        messages: [...messages, message]
    })
}

const addMessage = message => {
    const location = `${message.guild.id}-${message.channel.id}`

    console.log(`{${location}} Created 1 point`)

    data.set(location, {
        timeout: setTimeout(() => {
            console.log(`{${location}} no messages after 5 seconds!`)
            data.delete(location)
        }, 5000),
        messages: [message]
    })
}

const messagesSent = {
    save(message, detectorPoints) {
        const location = `${message.guild.id}-${message.channel.id}`
        if (data.has(location)) incrementMessage(message, detectorPoints)
        else addMessage(message)
    }
}

module.exports = {
    listeners: 'message',
    run: (client, message) => {
        const { spamDetectorPoints = client.defaults.spamDetectorPoints } = client.guilds.cache.get(message.guild.id)
        if (message.guild) messagesSent.save(message, spamDetectorPoints)
    }
}