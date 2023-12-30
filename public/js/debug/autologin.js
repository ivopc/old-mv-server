const accounts = [
    { name: "Linhas", password: "nb1234567890" },
    { name: "Testinhow", password: "nb1234567890" }
];

function autoLoginIniter () {
    document.addEventListener("keydown", event => autoLogin(event));
};

/**
 * 
 * @param {KeyboardEvent} event 
 */
 function autoLogin (event) {
    let accountIndex;
    if (event.ctrlKey) {
        if (event.code === "Digit1") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            accountIndex = 0;
        } else if (event.code === "Digit2") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            accountIndex = 1;
        } else {
            return;
        };
        axios.post("/account/login", { 
            nickname: accounts[accountIndex].name, 
            password: accounts[accountIndex].password 
        }).then(() => location.reload());
    };
};


document.addEventListener("DOMContentLoaded", autoLoginIniter);