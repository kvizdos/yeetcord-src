window.onload = function() {
    var changelog = [
                        {
                            "version": "1.0b",
                            "title": "We're now in Beta V1.0! Invite your friends :D",
                            "desc": "Lots has been added this time and there is still more to come! Below is a changelog",
                            "changelog": [
                                "We no longer @ you when you talk (finally)",
                                "We now have notifications! If you would like push notificiations, please allow them!",
                                "No longer get lost when you joined conversations, chat history is here (loads last 100 messages)!",
                                "The logout button finally works (woot woot)",
                                "See online users with the new Users Tab!",
                                "Hey @%%you%%, tagging users are now a thing!",
                                "Grouped messages!"
                            ]
                        },
                        {
                            "version": "1.1b",
                            "title": "Just a lot of new stuff..",
                            "desc": "Mainly being, the new UI!",
                            "changelog": [
                                "New UI!!! Wahoo! Still early, but it's much better imo.",
                                "Emojis!! :<emoji>:",
                                "Max character count per message (2k)",
                                "You can now see images posted!!",
                                "Rich Chat. Now you can bold, italicize, etc (mostly everything that Discord can do in the same way!)",
                                "Fixed user lists-ish"
                            ]
                        }
                    ]
    
    changelog = changelog.reverse();
    
    for(var i = 0; i < changelog.length; i++) {
        var list = "";
        changelog[i]['changelog'].forEach((i) => {
            i = i.replace("%%you%%", JSON.parse(localStorage.getItem('auth'))['username']);

            list += "<li>" + i + "</li>";
        })
        $('#updatesContainer').append(`<div id="updateContainer">
                                        <h3>${changelog[i]['version']}: ${changelog[i]['title']}</h3>
                                        <p>${changelog[i]['desc']}</p>
                                        <strong>Changelog:</strong>
                                        <ul>
                                            ${list}
                                        </ul>
                                        <hr>
                                    </div>`)
    }
}