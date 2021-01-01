const texts = require('../texts.json')

function translateText(name, lang = 'pt-br') {
    const text = texts[String(name).toLowerCase()]

    return function (textID, textData = {}) {
        const editText = text[textID][lang]

        const variables = editText.match(/{\w+}/g) || []

        const replacer = current => (_match, p1, p2, p3) => {
            const dataMatch = current.match(/\w+/g)[0]
            const variableData = textData[dataMatch]

            if (p1 && p2 && p3 && variableData) {
                return `${variableData}${p3.slice(0, p3.length - 2)}`
            } else if (!p1 && p2 && !p3) {
                return variableData || dataMatch
            } else if (p1 && p2 && !p3) {
                return '(' + variableData || dataMatch
            } else return ''
        }

        return variables.reduce((acc, cur) => acc.replace(/(\()?({\w+})( [\w ,]+\)\?)?/, replacer(cur)), editText)
    }
}

module.exports = { translateText }