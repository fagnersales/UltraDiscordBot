const errors = {
    'MISSING_ARGUMENT': 'Argumento não encontrado!\n%%missing_on',
    'LESS_THAN_MIN_LENGTH': '> Argumento **(%%argument_index)** é menor que o tamanho minimo **(%%min caracteres)**\n%%error_length',
    'MAX_LENGTH_EXCEEDED': '> Argumento **(%%argument_index)** é maior que o tamanho máximo **(%%max caracteres)**\n%%error_length',
    'UNVALID_LENGTH': '> Argumento **(%%argument_index)** não é igual ao tamanho desejado **(%%length caracteres)**\n%%error_length',
    'ARGUMENT_NOT_FOUND': '> Argumento **(%%argument_index)** não identificado\n%%not_found',
    'INCOMPATIBLE_CHANNEL_TYPE': '> Argumento **(%%argument_index)** é incompatível pois precisa ser um canal do tipo: `%%expected_type` e recebeu o tipo: `%%received_type` - `%%channel_name`',
    'NOT_A_NUMBER': '> Argumento **(%%argument_index)** precisa ser do tipo **número**.'
}

function translateError(errorName) {
    const errorText = errors[errorName]

    return function (errorData, errorObject) {    
        if (!errorText || !errorData) return errorObject
        
        const variables = errorText.match(/%%\w+/g)
        
        return variables.reduce((acc, cur) => acc.replace(cur, errorData[cur.slice(2)]), errorText)
    }
}

module.exports = { translateError }