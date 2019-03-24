/*
var Modal = function(modalId, modalHider) {
    this.id = "#" + modalId,
    this.hider = "#" + modalHider,
    this.header = "Waiting",
    this.text = "Loading",
    this.show = (delay = 0) => {
        $(this.id + " #modal #modalHeader").text(this.header);
        $(this.id + " #modal #modalText").text(this.text);
        $(this.hider).show(delay);
    },
    this.hide = (delay = 0) => {
        $(this.hider).hide(delay);
    },
    $(this.id).click(() => {
        alert("Clicked!");
    })
}
*/

var Modal = function(modal) {
    this.selector = modal,
    this.text = "Loading",
    this.header = "Loading",
    this.register = () => {
        $(this.selector).click((e) => {
            if(e.target.id == "modalContainer") $(this.selector).hide();
        })
        $(this.selector).append(`
        <div id="modalBackground"></div>
        <div id="modalContainer">
            <div id="modal">
                <h2 id="modalHeader">${this.text}</h2>
                <p id="modalText">${this.header}</p>
                <div id="modalActions">
                    <input id="modalInput" />
                    <button id="modalButton"></button>

                </div>
            </div>
        </div>
        `);
        $(this.selector).hide();
    },
    this.showActions = (type, placeholder = "", placeholder2 = "", btnActions = "") => {
        $(this.selector + " #modal #modalHeader").html(this.header);
        $(this.selector + " #modal #modalText").html(this.text);
        $(this.selector + " #modal #modalActions").show();
        switch(type) {
            case 0:
                // BUTTON
                break;
            case 1:
                // INPUT
                $(this.selector + " #modal #modalButton").text(placeholder2)
                $(this.selector + " #modal #modalInput").attr('placeholder', placeholder);
                $(this.selector + " #modal #modalButton").click(btnActions);
                break;
        }

        $(this.selector).show();

    },
    this.show = () => {
        $(this.selector + " #modal #modalHeader").html(this.header);
        $(this.selector + " #modal #modalText").html(this.text);
        $(this.selector + " #modal #modalActions").hide();
        $(this.selector).show();
    },
    this.hide = () => {
        $(this.selector).hide();
    }
}

var ImageModal = function(modal) {
    this.url = "",
    this.selector = modal,
    this.register = () => {
        $(this.selector).click((e) => {
            if(e.target.id == "modalContainer") $(this.selector).hide();
        })
        $(this.selector).append(`
        
        <div id="modalBackground"></div>
        <div id="modalContainer">
            <div id="modal" class="imageModal">
                <a id="imgClick"><img id="modalImgUrl" src="" width=100% /></a>
            </div>
        </div>
        `)

        $(this.selector).hide();
    }
    this.show = (url) => {
        $('#imgClick').attr('href', url);
        $('#modalImgUrl').attr('src', url);
        $(modal).show();
    }
}