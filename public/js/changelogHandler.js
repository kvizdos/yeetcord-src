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