'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretkey = 'encriptacion-IN6AM@';

exports.createToken = (enterpise)=>{
    var payload = {
        sub: enterpise._id,
        name: enterpise.name,
        email: enterpise.email,
        phone: enterpise.phone,
        iat: moment().unix(),
        exp: moment().add(4, 'hours').unix()
    }
    return jwt.encode(payload, secretkey);
}