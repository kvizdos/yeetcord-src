var CMID;
var ContextMenu = function(id) {
    this.id = id,
    this.register = () => {
        CMID = this.id;
        $(this.id).append(`
            <p>Hello</p>
        `)
    }
}

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    /*
    var posX = e.pageX ? e.pageX : e.clientX;
    var posY = e.pageY ? e.pageY : e.clientY;

    posY += document.body.scrollTop + document.documentElement.scrollTop;

    $(CMID).css({top: posY, left: posX});
    */
})