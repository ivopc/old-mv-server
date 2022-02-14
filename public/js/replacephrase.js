function ReplacePhrase(phrase, attr) {
    var obj = Object.getOwnPropertyNames(attr);
    for (let i = 0; i < obj.length; i ++) {
        phrase = phrase.replace(
            new RegExp("{" + obj[i] + "}"), 
            attr[obj[i]]
        );
    };
    return phrase;
};