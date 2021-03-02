'use strict'
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var enterpriseSchema = Schema({
    name: String,
    email: String,
    phone: Number,
    cantidadEmpleado: Number,
    employees: [{
        name: String,
        lastname: String,
        job: String,
        departament: String
    }]
});

module.exports = mongoose.model('enterprise', enterpriseSchema);