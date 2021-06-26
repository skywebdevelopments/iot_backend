const TLV = require('node-tlv');
const cryptojs = require('crypto-js')

let encrypt_secret = "thisismysecret";


function tlv_encoder(req, res, next) {
    // custom 
    let db_secret = req.body.tlv_value;
    let encoded_value = new TLV("E2", Buffer.from(db_secret));
    let encrypted_value = cryptojs.AES.encrypt(encoded_value.toString(), encrypt_secret);

    let decoded_value = cryptojs.AES.decrypt(encrypted_value, encrypt_secret).toString(cryptojs.enc.Utf8);


    //parsing the data to be returned as a plain text string....

    let stringfied_decoded_value = TLV.parse(decoded_value);

    return {
        "encoded_value": encoded_value.toString(),
        "encrypted_value": encrypted_value.toString(),
        "decoded_value": decoded_value,
        "stringfied_value": stringfied_decoded_value.bValue.toString()
    }
}


exports.tlv_encoder = tlv_encoder;
