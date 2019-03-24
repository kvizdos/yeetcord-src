var Emoji = function(name) {
    this.em = name,
    this.search = (emoji, where) => {
        var foundEmoji = EmojiList.filter((e) => {
            return e.name.toLowerCase().replace(" ", "_").indexOf(emoji) >= 0;
        })    

        if(foundEmoji.length > 0) {
            renderEmojis(where, foundEmoji.slice(0, 10), emoji, false);
        } else {
            renderEmojis(where, [], "", true);

        }
    },
    this.find = (emoji) => {
        var foundEmoji = EmojiList.filter((e) => {
            return e.name.toLowerCase().replace(" ", "_").indexOf(emoji) >= 0;
        })    

        return foundEmoji;
    }
}

function renderEmojis(where, found, emoji, disable) {
    var newText = "<span id='foundEmojis'>EMOJIS MATCHING: <span class='emojiName'>:"+emoji.toLowerCase()+":</span></span><br>";
    if(!disable) {
        $(where).show(100);
        found.forEach((f) => {
            newText += "<p>" + f.char + " :" + f.name.toLowerCase() + ":</p>"
        })
        $(where).html(newText);
    } else {
        $(where).hide(100);
    }
}