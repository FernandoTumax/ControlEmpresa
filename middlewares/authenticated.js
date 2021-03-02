'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretkey = 'encriptacion-IN6AM@';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(404).send({
            message: "La peticion no lleva la autenticacion"
        })
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payload = jwt.decode(token, secretkey);
            if(payload.exp <= moment().unix()){
                return res.status(404).send({
                    message: "El token ya expiro"
                })
            }
        }catch(err){
            return res.status(404).send({
                message: "Token invalido"
            })
        }
        req.user = payload;
        next();
    }
}