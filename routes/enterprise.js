'use strict'

var express = require('express');

var enterpriseController = require('../Controllers/enterprise');
var mdAuth =  require('../middlewares/authenticated');
const enterprise = require('../Models/enterprise');

var api = express.Router();

api.get('/getAdmin', enterpriseController.getAdmins);

api.get("/admin/login", enterpriseController.login);

api.post("/admin/:idA/saveEnterprise", mdAuth.ensureAuth, enterpriseController.saveEnterprise);

api.get('/admin/getEnterprises', enterpriseController.getEnterprises);

api.get('/admin/getEnterprise/:id', enterpriseController.getEnterprise);

api.put('/enterprise/updateEnterprise/:id', mdAuth.ensureAuth , enterpriseController.updateEnterprise);

api.delete('/enterprise/deleteEnterprise/:id', mdAuth.ensureAuth, enterpriseController.removeEnterprise);

// Funcion de empleados

api.get('/enterprisePdf/:id', mdAuth.ensureAuth, enterpriseController.pdfEmployees);

api.get("/enterprise/login", enterpriseController.loginEnterprise);

api.get('/enterprise/:id/getEmployees', mdAuth.ensureAuth, enterpriseController.getEmployees);

api.get('/enterprise/:idE/getEmployeeById/:idEm', mdAuth.ensureAuth, enterpriseController.getEmployeesById);

api.get('/enterprise/:id/getEmployeeByName', mdAuth.ensureAuth, enterpriseController.getEmployeesByName);

api.get('/enterprise/:id/getEmployeeByDepartament', mdAuth.ensureAuth, enterpriseController.getEmployeeByDepartament);

api.get('/enterprise/:id/getEmployeeByJob', mdAuth.ensureAuth, enterpriseController.getEmployeeByJob);

api.post('/enterprise/:id/setEmployee', mdAuth.ensureAuth, enterpriseController.setEmployee);

api.put('/enterprise/:idE/updateEmployee/:idEm',mdAuth.ensureAuth, enterpriseController.updateEmployee);

api.delete('/enterprise/:idE/removeEmployee/:idEm', mdAuth.ensureAuth, enterpriseController.removeEmployee);

module.exports = api;