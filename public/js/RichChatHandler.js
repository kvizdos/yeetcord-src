var Emoji = new Emoji("RichChat");

function RichChat(msg = "") {
    // Handle Bolding
    var bolding = msg.match(/\**/gm) !== null ? msg.match(/\**/gm).length : 0;
    bolding = bolding % 2 == 0 ? bolding : bolding - 1;

    do {
        msg = msg.replace('**', bolding % 2 == 0 ? "<span class='txt-bold'>" : "</span>");
        bolding--;
    } while(bolding > 0);

    // Handle Italics
    var italics = msg.match(/\*/gm) !== null ? msg.match(/\*/gm).length : 0;
    italics = italics % 2 == 0 ? italics : italics - 1;

    do {
        msg = msg.replace('*', italics % 2 == 0 ? "<span class='txt-italic'>" : "</span>");
        italics--;
    } while(italics > 0);

    // Handle Strikethrough
    var strike = msg.match(/~~/gm) !== null ? msg.match(/~~/gm).length : 0;
    strike = strike % 2 == 0 ? strike : strike - 1;

    do {
        msg = msg.replace('~~', strike % 2 == 0 ? "<span class='txt-strike'>" : "</span>");
        strike--;
    } while(strike > 0);

    // Handle Underline
    var underline = msg.match(/__/gm) !== null ? msg.match(/__/gm).length : 0;
    underline = underline % 2 == 0 ? underline : underline - 1;

    do {
        msg = msg.replace('__', underline % 2 == 0 ? "<span class='txt-underline'>" : "</span>");
        underline--;
    } while(underline > 0);

    // Handle Spoilers
    var spoiler = msg.match(/\|\|/gm) !== null ? msg.match(/\|\|/gm).length : 0;
    spoiler = spoiler % 2 == 0 ? spoiler : spoiler - 1;
    var sc = 0;
    do {
        msg = msg.replace('||', spoiler % 2 == 0 ? "<span class='txt-spoiler-container'><span class='txt-spoiler-btn' onclick='showSpoiler(this)'>.</span><span class='txt-spoiler'>" : "</span></span>");
        spoiler--;
        sc++;
    } while(spoiler > 0);

    // Handle Inline Code
    var inlinecode = msg.match(/\`/gm) !== null ? msg.match(/\`/gm).length : 0;
    inlinecode = inlinecode % 2 == 0 ? inlinecode : inlinecode - 1;

    do {
        msg = msg.replace('`', inlinecode % 2 == 0 ? "<span class='txt-inlinecode'>" : "</span>");
        inlinecode--;
    } while(inlinecode > 0);

    // Handle Emojis
    var msgs = msg.split(" ");
    for(var i = 0; i < msgs.length; i++) {
        if(msgs[i].startsWith(":") && msgs[i].endsWith(":")) {
            var emoji = Emoji.find(msgs[i].slice(1, msgs[i].length - 1));
            if(emoji.length > 0){
                msgs[i] = emoji[0].char
            };
        }
    }
    msg = msgs.join(" ");

    return msg;
}

function showSpoiler(el) {
    $(el).hide();
}

module.exports = { RichChat }