const App = function () {

    this.lang = this.getCookie("lang") || "br";
    this.errors = JSON.parse(document.querySelector("[data-name='errors']").innerHTML);

    new WOW().init();

    this.animateBG();
    this.changeLangBtns();
    this.formListeners();
};

App.prototype.formListeners = function () {
    document.querySelector("#loginform").addEventListener("submit", e => this.loginSubmit(e));
    document.querySelector("#registerform").addEventListener("submit", e => this.registerSubmit(e));
};

App.prototype.changeLangBtns = function () {
    document.querySelector("#lang-br").addEventListener("click", e => this.changeLang(e, "br"));
    document.querySelector("#lang-en").addEventListener("click", e => this.changeLang(e, "en"));
};

App.prototype.changeLang = function (event, lang) {
    event.preventDefault();
    document.cookie = "lang = " + lang;
    location.reload();
};

App.prototype.loginSubmit = function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (!formData.get("nickname") || !formData.get("password")) {
        this.handleLoginError(0);
        return;
    };
    this.login(formData.get("nickname"), formData.get("password"));

};

App.prototype.login = function (nickname, password) {
    axios.post("/account/login", { nickname, password })
        .then(response => {
            if (response.data.error) {
                this.handleLoginError(response.data.error);
            }; 
            if (response.data.success) {
                location.href = "/";
            };
        });
};

App.prototype.registerSubmit = function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    if (!formData.get("nickname") || !formData.get("password") || !formData.get("repeatpassword") || !formData.get("email")) {
        this.handleRegisterError(0);
        return;
    };

    if (formData.get("password") != formData.get("repeatpassword")) {
        this.handleRegisterError(2);
        return;
    };

    axios.post("/account/register", {
        nickname: formData.get("nickname"),
        password: formData.get("password"),
        email: formData.get("email")
    }).then(response => {
        if (response.data.error) {
            this.handleRegisterError(response.data.error);
        };

        if (response.data.success) {
            location.href = "/";
        };
    });
};

App.prototype.handleLoginError = function (id) {

    const 
        parent = document.querySelector("#login-response"),
        message = document.createElement("div");
        parent.innerHTML = "";
        message.setAttribute("class", "alert alert-danger");

    switch (id) {
        case 0: 
        case 1:
        {
            message.innerHTML = this.errors["EMPTY_INPUTS"][this.lang];
            break;
        };

        case 2: {
            message.innerHTML = this.errors["INVALID_USER_PASSWORD"][this.lang];
            break;
        };

        case 3: {
            message.innerHTML = this.errors["ACCOUNT_BANNED"][this.lang];
            break;
        };
    };

    parent.appendChild(message);

    setTimeout(() => {
        message.parentNode.removeChild(message);
    }, 2000);
};

App.prototype.handleRegisterError = function (id) {
    const 
        parent = document.querySelector("#register-response"),
        message = document.createElement("div");
        parent.innerHTML = "";
        message.setAttribute("class", "alert alert-danger");

    switch (id) {
        case 0: 
        case 1:
        {
            message.innerHTML = this.errors["EMPTY_INPUTS"][this.lang];
            break;
        };

        case 2: {
            message.innerHTML = this.errors["DIFFERENT_PASSWORD"][this.lang];
            break;
        };

        case 3: {
            message.innerHTML = this.errors["EXISTENT_USER"][this.lang];
            break;
        };

        case 4: {
            message.innerHTML = this.errors["IN_USE_EMAIL"][this.lang];
            break;
        };
        case 5: {
            message.innerHTML = this.errors["LENGTH_USER"][this.lang];
            break;
        };
        case 6: {
            message.innerHTML = this.errors["LENGTH_PASSWORD"][this.lang];
            break;
        };
        case 7: {
            message.innerHTML = this.errors["INVALID_EMAIL"][this.lang];
            break;
        }
    };

    parent.appendChild(message);

    setTimeout(() => {
        message.parentNode.removeChild(message);
    }, 2000);
};


App.prototype.animateBG = function () {
    this.position = {
        x: 0,
        y: 0
    };
    this.bg = document.querySelector("#movingbg");
    setInterval(() => this.loopAnimation(), 30);
};

App.prototype.loopAnimation = function () {
    this.bg.style["backgroundPosition"] = `${this.position.x}px ${this.position.y}px`; 
    this.position.x ++;
};

App.prototype.getCookie = function(name)  {
    const 
        value = "; " + document.cookie,
        parts = value.split("; " + name + "=");

    if (parts.length == 2) 
        return parts.pop().split(";").shift();
};

function init() {
    new App();
};

document.addEventListener("DOMContentLoaded", init);