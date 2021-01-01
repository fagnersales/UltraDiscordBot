const { validateMemberArgument } = require('./memberArgument')
const { validateContentArgumet } = require('./contentArgument')
const { channelArgument } = require('./channelArgument')
const { commandArgument } = require('./commandArgument')
const { validateNumberArgumet } = require('./numberArgument')

const types = {
    'member': validateMemberArgument,
    'text': validateContentArgumet,
    'string': validateContentArgumet,
    'content': validateContentArgumet,
    'channel': channelArgument,
    'command': commandArgument,
    'number': validateNumberArgumet
}

/**
 * Gets the validator by the type name
 * @param {String} type 
 */
function validatorByType(type) {
    return types[type.toLowerCase()]
}


module.exports = { validatorByType }