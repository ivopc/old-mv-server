var template;

function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function() {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
    });
};

function showSoldTrade (event, el) {

    let parent = el.closest("ul"),
        data,
        type;

    if (el.getAttribute("data-sold-type") == "monster") {
        data = {
            id: parent.getAttribute("data-id"),
            name: parent.getAttribute("data-name"),
            level: parent.getAttribute("data-level"),
            stats: JSON.parse(parent.getAttribute("data-stats"))
        };

        type = "sellMonster";

    } else {
        data = {
            id: parent.getAttribute("data-id"),
            name: parent.getAttribute("data-name")
        };

        type = "sellItem";
    };
    document.querySelector("#modal-appears").innerHTML = template[type]({
        type: {
            title: "Venda",
            action: "Vender"
        },
        data
    });

    setInputFilter(document.querySelector("[data-coin-value]"), function(value) {
        return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 100000000);
    });

    $("[data-toggle='tooltip']").tooltip();

    document.querySelector("#toggle-modal").click();

    document.querySelector("[data-action='sell']").addEventListener("click", () =>{
        
        switch (el.getAttribute("data-sold-type")) {
            case "monster": {
                sellMonster();
                break;
            };

            case "item": {
                sellItem();
                break;
            };
        };
        
    });
};

function sellMonster() {
    const 
        el = document.querySelector("[data-coin-type]"),
        soldPrice = parseInt(document.querySelector("[data-coin-value]").value),
        cashType = parseInt(el.options[el.selectedIndex].getAttribute("value")),
        response = document.querySelector("#response");

    if (
        isNaN(soldPrice) ||
        soldPrice < 0 ||
        soldPrice >= 100000000 ||
        isNaN(cashType) ||
        cashType == 0
    ) {
        response.innerHTML = "";
        var _alert = document.createElement("div");
        _alert.setAttribute("class", "alert alert-danger");
        _alert.innerHTML = "Preencha todos os campos corretamente!";
        response.appendChild(_alert);
        return;
    };

    var data = {
        token,
        type: 1,
        id: +document.querySelector("#monster-id").value,
        price: soldPrice,
        cashType
    };

    axios.post("/routes/marketplace", data)
        .then(_response => {
            console.log(_response);
            if (_response.data.success) {
                _response.innerHTML = "";
                var success = document.createElement("div");
                success.setAttribute("class", "alert alert-success");
                success.innerHTML = "Seu Monstro está a venda! <a href=\"/marketplace/purchase/" + _response.data.id + "\">Clique aqui</a> para ver o Monstro a venda!";
                response.appendChild(success);
                var remove = document.querySelector("[data-id='" + data.id + "']");
                remove.parentNode.removeChild(remove);
            };
        });
};

function sellItem () {
    const 
        el = document.querySelector("[data-coin-type]"),
        soldPrice = parseInt(document.querySelector("[data-coin-value]").value),
        cashType = parseInt(el.options[el.selectedIndex].getAttribute("value")),
        response = document.querySelector("#response");

    if (
        isNaN(soldPrice) ||
        soldPrice < 0 ||
        soldPrice >= 100000000 ||
        isNaN(cashType) ||
        cashType == 0
    ) {
        response.innerHTML = "";
        var _alert = document.createElement("div");
        _alert.setAttribute("class", "alert alert-danger");
        _alert.innerHTML = "Preencha todos os campos corretamente!";
        response.appendChild(_alert);
        return;
    };

    const data = {
        token,
        type: 4,
        id: +document.querySelector("#item-id").value,
        price: soldPrice,
        cashType
    };

    axios.post("/routes/marketplace", data)
        .then(_response => {
            console.log(_response);
            if (_response.data.success) {
                _response.innerHTML = "";
                var success = document.createElement("div");
                success.setAttribute("class", "alert alert-success");
                success.innerHTML = "Seu item está a venda! <a href=\"/marketplace/purchase/" + _response.data.id + "\">Clique aqui</a> para ver o item a venda!";
                response.appendChild(success);
                var remove = document.querySelector("[data-id='" + data.id + "']");
                remove.parentNode.removeChild(remove);
            };
        });
};

function init () {

    $("[data-toggle='tooltip']").tooltip();

    template = {
        sellMonster: _.template(document.querySelector("[data-template=sell-monster-modal]").innerHTML),
        sellItem: _.template(document.querySelector("[data-template=sell-item-modal]").innerHTML)
    };

    const btnsold = document.querySelectorAll(".a-sold");

    for (let i = 0; i < btnsold.length; i++) {
        btnsold[i].addEventListener("click", function (e) {
            showSoldTrade(e, this);
        });
    };
};

window.addEventListener("DOMContentLoaded", init);