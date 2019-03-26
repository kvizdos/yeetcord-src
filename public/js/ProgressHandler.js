var Progress = function(el, starting) {
    this.bar = el,
    this.percent = starting,
    this.addPercent = (newPercent) => {
        this.percent += newPercent;
        document.querySelector(el + ' #progress').style.width = this.percent + '%';
    },
    this.setPercent = (p) => {
        this.percent = p;
            document.querySelector(el + ' #progress').style.width = this.percent + '%';

    }
}