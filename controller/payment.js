const 
    axios = require("axios"),
    async = require("async");

const dev = true;

let baseURL;

baseURL = dev ? "http://localhost:3000/payment" : "https://appws.picpay.com/ecommerce/public";

const 
    picpayToken = "fd5tghg65-jhjh7j-adfzn3",
    sellerToken = "etr-0i6yhoko-8oo-764";

const callbackUrl = dev ? "localhost:8000/payment/callback" : "https://monstervalle.com/payment/callback";

const picpayApi = axios.create({
    baseURL,
    headers: {
        "accept-encoding": "gzip,deflate",
        "Content-Type": "application/json",
        "x-picpay-token": picpayToken
    }
});

const Products = {
    VIP1: 20, // 30 DIAS VIP = 20 R$
    VIP2: 35, // 60 DIAS VIP = 35 R$
    VIP3: 55, // 90 DIAS VIP = 55 R$
    COIN1: 10, // 100g = 10 R$
    COIN2: 18, // 190g = 18 R$
    COIN3: 35, // 400g = 35 R$
    COIN4: 50, // 650g = 50 R$
    COIN5: 100 // 1100g = 100 R$
};

// "created": registro criado
// "expired": prazo para pagamento expirado
// "analysis": pago e em processo de análise anti-fraude
// "paid": pago
// "completed": pago e saldo disponível
// "refunded": pago e devolvido
// "chargeback": pago e com chargeback

const Status = {
    created: 1,
    expired: 2,
    analysis: 3,
    paid: 4,
    completed: 5,
    refunded: 6,
    chargeback: 7
};

const randomString = len => {

    const _str = "1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
    let _rand = "";

    for (let i = 0, l = _str.length; i < len; i++)
        _rand += _str[Math.floor(Math.random() * l)];

    return _rand;
};

const getRef = (id, ref) => id + "-" + ref;

const dismemberRef = str => ({
    id: str.split("-")[0],
    ref: str.split("-")[1]
});

exports.pay = function (req, res) {
    const buyer = {
        firstName: req.body["firstName"],
        lastName: req.body["lastName"],
        document: req.body["cpf"],
        email: req.session["emal"],
        phone: req.body["phone"]
    };

    const product = req.body["product"];

    const ref = randomString(10);

    async.waterfall([
        next => {
            req.mysqlConn.query("INSERT INTO `picpay_payment` SET ?", {
                id: null,
                uid: req.session["uid"],
                ref,
                product_id: 1,
                value: Products[product],
                status: 0
            }, next);
        },
        (results, fields, next) => {
            
            picpayApi.post("/payments", {
                referenceId: getRef(results.insertId, ref),
                callbackUrl,
                returnUrl: "https://monstervalle.com/payment_completed",
                value: Products[product],
                buyer
            })
                .then(response => {

                    console.log("tnc fdp do crl");

                    res.json({
                        paymentUrl: response.data.paymentUrl
                    });
                })
                .catch(error => {

                    console.log("tnc fdp do crl 22");
                    // error.response.status
                    res.json({
                        error: true
                    });
                });
        }
    ]);
};

exports.callback = function (req, res) {
    const referenceId = req.body["referenceId"];

    picpayApi.post(`/payments/${referenceId}/status`)
        .then(response => {

            let ref = dismemberRef(referenceId),
                newStatus = Status[response.data["status"]];

            req.mysqlConn.query(
                "UPDATE `picpay_payment` SET `status` = ? WHERE `id` = ?",
                [newStatus, ref.id],
                () => res.status(200).json({ok: 123})
            );
        })
        .catch(error => {
            res.status(200).json({ok: 123});
        });
};

