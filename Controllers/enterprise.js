'use strict'

var Enterprise = require('../Models/enterprise');
var Admin = require('../Models/admin');
var Employee = require('../Models/employee');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
const pdf = require('html-pdf');
const user = require('../../AgendaWeb/models/user');
var mongoose = require('mongoose');
const { Mongoose } = require('mongoose');
const enterprise = require('../Models/enterprise');
const { param } = require('../routes/enterprise');



/* CREACION DEL ADMINISTRADOR */
var enterpriseController = {
    createInit: function (req, res) {
        let admin = new Admin();
        Admin.findOne({ username: 'admin' }, (err, adminFind) => {
            if (err) {
                console.log("Error al cargar el administrador");
            } else if (adminFind) {
                console.log("El administrador ya fue creado");
            } else {
                admin.password = "12345";
                bcrypt.hash(admin.password, null, null, (err, passwordHash) => {
                    if (err) {
                        res.status(500).send({
                            message: "Error al ecriptar la contraseña"
                        })
                    } else if (passwordHash) {
                        admin.username = "admin";
                            admin.password = passwordHash;
                        admin.save((err, adminSave) => {
                            if (err) {
                                console.log("Error al crear el administrador");
                            } else if (adminSave) {
                                console.log("El administrador fue creado con exito");
                            } else {
                                console.log("El administrador no fue creado");
                            }
                        })
                    }
                })
            }
        })
    },
    /* INICIAR SESION */
    login: function (req, res) {
        var params = req.body;

        if (params.username && params.password) {
            Admin.findOne({ username: params.username }, (err, adminFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error al intentar buscar el usuario"
                    })
                } else if (adminFind) {
                    bcrypt.compare(params.password, adminFind.password, (err, checkPassword) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error en el servidor"
                            })
                        } else if (checkPassword) {
                            if (params.gettoken) {
                                return res.status(200).send({
                                    token: jwt.createToken(adminFind),
                                    message: "Administrador logeado con exito"
                                });
                            } else {
                                res.status(200).send({
                                    message: "Administrador logeado con exito"
                                })
                            }
                        } else {
                            res.status(404).send({
                                message: "Nombre de usuario o contraseña incorrectas"
                            })
                        }
                    })
                } else {
                    res.status(404).send({
                        message: "No se encuentra la cuenta"
                    })
                }
            })
        } else {
            res.status(404).send({
                message: "Por favor ingrese todos los campos"
            })
        }
    },
    /*LOGIN EMPRESA*/

    loginEnterprise: function (req, res) {
        var params = req.body;
        if (params.email && params.phone) {
            Enterprise.findOne({ email: params.email, phone: params.phone }, (err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(enterpriseFind),
                            message: "Empresa logeada, Bienvenidos",
                            name: enterpriseFind.name
                        })
                    } else {
                        res.status(200).send({
                            message: "Empresa logeada, Bienvenidos",
                            name: enterpriseFind.name
                        })
                    }
                } else {
                    res.status(204).send({
                        message: "No existe esta empresa"
                    })
                }
            })
        } else {
            res.status(404).send({
                message: "Por favor ingrese todos los campos"
            })
        }
    },

    /* CREAR EMPRESA */
    saveEnterprise: function (req, res) {
        var enterprise = new Enterprise();
        var adminId = req.params.idA;
        var params = req.body;

        if(adminId != req.user.sub){
            res.status(404).send({
                message: "No tiene permiso para realizar esta accion"
            })
        }else{
            Admin.findById(adminId).exec((err, adminFind) => {
                if (err) {
                    res.status(500).send({
                        message: "No eres administrador"
                    })
                } else if (adminFind) {
                    if (params.name && params.email && params.phone && params.cantidadEmpleado && params.cantidadEmpleado == 0) {
                        Enterprise.findOne({ name: params.name }, (err, enterpriseFind) => {
                            if (err) {
                                res.status(500).send({
                                    message: "Error en el servidor: ", err
                                })
                            } else if (enterpriseFind) {
                                res.status(200).send({
                                    message: "Esa empresa ya existe"
                                })
                            } else {
                                enterprise.name = params.name;
                                enterprise.email = params.email;
                                enterprise.phone = params.phone;
                                enterprise.cantidadEmpleado = 0;
    
                                enterprise.save((err, enterpriseSaved) => {
                                    if (err) {
                                        res.status(500).send({
                                            message: "Error al guardar los datos"
                                        })
                                    } else if (enterpriseSaved) {
                                        res.status(200).send({
                                            message: "Usuario guardado con exito"
                                        })
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(204).send({
                            message: "Introduce los campos minimos"
                        })
                    }
                } else {
                    res.status(204).send({
                        message: "No eres administrador"
                    })
                }
            })
        }
    },
    /*OBTENER TODOS LOS ADMINS */
    getAdmins: function (req, res) {
        Admin.find({}).exec((err, admins) => {
            if (err) {
                res.status(500).send({
                    message: "Error en el servidor"
                })
            } else if (admins) {
                res.status(200).send({
                    message: "Estos son los admins",
                    admins
                })
            } else {
                res.status(204).send({
                    message: "No existe ningun admin"
                })
            }
        })
    },
    /* OBTENER TODAS LAS EMPRESAS CREADAS */
    getEnterprises: function (req, res) {
        Enterprise.find({}).exec((err, enterprises) => {
            if (err) {
                res.status(500).send({
                    message: "Error en el servidor"
                })
            } else if (enterprises) {
                Enterprise.countDocuments({}, (err, c) => {
                    if (err) {
                        res.status(500).send({
                            message: "Error en el servidor"
                        })
                    } else if (c) {
                        res.status(200).send({
                            message: "Empresas encontradas y su cantidad es: ",
                            totalEmpresas: c, enterprises
                        })
                    }
                })
            } else {
                res.status(200).send({
                    message: "No hay registro"
                })
            }
        })
    },

    /* OBTENER UNA EMPRESA SEGUN EL ID */

    getEnterprise: function (req, res) {
        let enterpriseId = req.params.id;

        Enterprise.findById(enterpriseId).exec((err, enterprise) => {
            if (err) {
                res.status(500).send({
                    message: "Error en el servidor"
                })
            } else if (enterprise) {
                res.status(200).send({
                    message: "Empresa encontrada", enterprise
                })
            } else {
                res.status(200).send({
                    message: "No hay registro"
                })
            }
        })
    },

    /* ACTUALIZAR UNA EMPRESA */

    updateEnterprise: function (req, res) {
        let enterpriseId = req.params.id;
        let update = req.body;
        let enterprise = new Enterprise();

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tiene permiso para realizar esta accion",
                message: enterpriseId,
                message: req.user.sub
            })
        } else {
            Enterprise.findOne({ name: update.name }, (err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    res.status(200).send({
                        message: "Nombre de la empresa ya existe"
                    });
                } else {
                    Enterprise.findByIdAndUpdate(enterpriseId, update, { new: true }, (err, updateEnterprise) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error al actualizar"
                            })
                        } else if (updateEnterprise) {
                            res.status(200).send({
                                message: "Empresa actualizada", updateEnterprise
                            })
                        } else {
                            res.status(200).send({
                                message: "No hay registros para actualizar"
                            })
                        }
                    })
                }
            })
        }
    },
    /* ELIMINAR EMPRESA */
    removeEnterprise: function (req, res) {
        let enterpriseId = req.params.id;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes permisos para realizar esta accion"
            })
        } else {
            Enterprise.findByIdAndRemove(enterpriseId, (err, enterpriseRemoved) => {
                if (err) {
                    res.status(500).send({
                        message: "Error al actualizar"
                    })
                } else if (enterpriseRemoved) {
                    res.status(200).send({
                        message: "Empresa Eliminada", enterpriseRemoved
                    })
                } else {
                    res.status(200).send({
                        message: "No hay registros para eliminar"
                    })
                }
            })
        }
    },
    /*Crear PDF de empleados */

    pdfEmployees: function (req, res) {
        let enterpriseId = req.params.id;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "no tienes acceso para esta funcion"
            });
        } else {
            Enterprise.findOne({ _id: enterpriseId }).exec((err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error al traer los empleados"
                    })
                } else if (enterpriseFind) {
                    let employees = enterpriseFind.employees;
                    let employeesFound = [];

                    employees.forEach(elemento => {
                        employeesFound.push(elemento);
                    });

                    let content = `
                    <!doctype html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                            <title>PDF Result Template</title>
                            <style>
                                    #text{
                                        font-size: 15px;
                                        text-align: center;
                                    }
                                #header{
                                    display:block; 
                                    text-align: center; 
                                    font-size: 55px; 
                                    border-bottom: 1px solid black;
                                    padding-bottom: 1px;
                                }
                            </style>
                        <link rel="stylesheet" type="text/css" href="./css/stylesPdf.css" />
                    </head>
                    <body>
                    <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                        <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;">${enterpriseFind.email}</p>
                        <p style="color: #666; margin: 0; padding-bottom: 5px; text-align: right; font-family: sans-serif; font-size: .65em">${enterpriseFind.phone}</p>
                        <p style="color: #666; margin: 0; padding-bottom: 5px; text-align: right; font-family: sans-serif; font-size: .65em">Página {{page}} de {{pages}}</p>
                    </div>
                        <h1> 
                        <ul>
                        </ul>
                        <table border="1" style="width: 85%; height: 70%; margin-left: 5%; margin-right: 5%">
                        <tbody>
                            <tr>
                            <th>name</th>
                            <th>lastname</th>
                            <th>job</th>
                            <th>departament</th>
                            </tr>
                            <tr>
                                ${employeesFound.map(employee => `<tr><td id="text">${employee.name}</td><td id="text">${employee.lastname}</td><td id="text">${employee.job}</td><td id="text">${employee.departament}</td></tr>`).join(` `)}
                            </tr>
                            <tr>
                                
                            </tr>  
                        </tbody>
                        </table>
                    </body>
                    </html>
                    `;

                    let options = {
                        paginationOffset: 1,
                        "header": {
                            "height": "25mm",
                            "contents": `<div id="header">` + enterpriseFind.name + `</div>`
                        },
                        "body": {
                            "height": "100%"
                        }
                    }

                    pdf.create(content, options).toFile('./PDF/Empleados ' + enterpriseFind.name + '.pdf', function (err, res) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res);
                        }
                    })
                    res.status(200).send({
                        message: "El pdf fue creado"
                    })

                } else {
                    res.status(204).send({
                        message: "No existe ningun contacto"
                    })
                }
            })
        }
    },

    /* OBTENER TODOS LOS EMPLEADOS */

    getEmployees: function (req, res) {
        let enterpriseId = req.params.id;

        if (enterpriseId != req.user.sub) {
            res.status(400).send({
                message: "No tienes acceso a esta funcion",
                enterpriseId,
                id: req.user.sub
            })
        } else {
            Enterprise.findOne({ _id: enterpriseId }).exec((err, enterpriseEmployee) => {
                if (err) {
                    res.status(500).send({
                        message: "Error al traer los empleados"
                    })
                } else if (enterpriseEmployee) {
                    res.status(200).send({
                        message: "Empleados: ", empleados: enterpriseEmployee.employees
                    })
                } else {
                    res.status(200).send({
                        message: "No existe ningun contacto"
                    })
                }
            })
        }
    },

    /* OBTENER LOS EMPLEADOS POR ID */

    getEmployeesById: function (req, res) {
        let enterpriseId = req.params.idE;
        let employeeId = req.params.idEm;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            Enterprise.findById(enterpriseId).exec((err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    Enterprise.findOne({ 'employees._id': employeeId }, { "employees.$": 1 }, (err, employeeFind) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error en el servidor"
                            })
                        } else if (employeeFind) {
                            res.status(200).send({
                                message: "Se ha encontrado el empleado segun su id",
                                empresa: enterpriseFind.name,
                                employeeFind
                            })
                        } else {
                            res.status(404).send({
                                message: "No existe ningun dato"
                            })
                        }

                    })
                } else {
                    res.status(404).send({
                        message: "algo esta mal"
                    })
                }
            })
        }
    },

    /* OBTENER EMPLEADOS POR NOMBRE */

    getEmployeesByName: function (req, res) {
        let enterpriseId = req.params.id;
        let params = req.body;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            Enterprise.findById(enterpriseId).exec((err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    let employees = enterpriseFind.employees;

                    let employeesFound = [];

                    employees.forEach(elemento => {
                        if (elemento.name.includes(params.name)) {
                            employeesFound.push(elemento);
                        }
                    });



                    if (employeesFound.length > 0) {
                        res.status(200).send({
                            nombreEmpresa: enterpriseFind.name,
                            emailEmpresa: enterpriseFind.email,
                            message: "estos son los empleados segun su nombre",
                            employeesFound
                        });
                    } else if (employeesFound.length == 0 || employeesFound == null) {
                        res.status(200).send({
                            message: "No hay datos encontrados"
                        })
                    }
                } else {
                    res.status(204).send({
                        message: "No existe ninguna empresa"
                    })
                }
            })
        }
    },
    /*OBTENER LOS EMPLEADOS POR DEPARTAMENTO*/
    getEmployeeByDepartament: function (req, res) {
        let enterpriseId = req.params.id;
        let params = req.body;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            Enterprise.findById(enterpriseId).exec((err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    let employees = enterpriseFind.employees;
                    let employeesFound = [];

                    employees.forEach(elemento => {
                        if (elemento.departament.includes(params.departament)) {
                            employeesFound.push(elemento);
                        }
                    });

                    if (employeesFound.length > 0) {
                        res.status(200).send({
                            nombreEmpresa: enterpriseFind.name,
                            emailEmpresa: enterpriseFind.email,
                            message: "estos son los empleados segun su departamento",
                            employeesFound
                        });
                    } else {
                        res.status(200).send({
                            message: "No hay datos encontrados"
                        })
                    }
                } else {
                    res.status(204).send({
                        message: "No existe ninguna empresa"
                    })
                }
            })
        }
    },
    /*OBTENER LOS EMPLEADOS POR PUESTO DE TRABAJO*/

    getEmployeeByJob: function (req, res) {
        let enterpriseId = req.params.id;
        let params = req.body;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            Enterprise.findById(enterpriseId).exec((err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error en el servidor"
                    })
                } else if (enterpriseFind) {
                    let employees = enterpriseFind.employees;

                    let employeesFound = [];
                    employees.forEach(elemento => {
                        if (elemento.job.includes(params.job)){
                            employeesFound.push(elemento);
                            console.log(elemento);
                        }
                    });
                    if (employeesFound.length > 0) {
                        res.status(200).send({
                            nombreEmpresa: enterpriseFind.name,
                            emailEmpresa: enterpriseFind.email,
                            message: "estos son los empleados segun su puesto",
                            employeesFound
                        })
                    } else {
                        res.status(200).send({
                            message: "No hay datos encontrados"
                        })
                    }
                }
            })
        }
    },

    /*GUARDAR EMPLEADO */
    setEmployee: function (req, res) {
        let enterpriseId = req.params.id;
        let paramsEmployee = req.body;
        let employee = new Employee();
        let enterprise = new Enterprise();

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso para esta funcion"
            })
        } else {
            Enterprise.findById(enterpriseId, (err, enterpriseFind) => {
                if (err) {
                    res.status(500).send({
                        message: "Error al agregar un empleado"
                    })
                } else if (enterpriseFind) {
                    if (paramsEmployee.name && paramsEmployee.lastname && paramsEmployee.job && paramsEmployee.departament) {
                        employee.name = paramsEmployee.name;
                        employee.lastname = paramsEmployee.lastname;
                        employee.job = paramsEmployee.job;
                        employee.departament = paramsEmployee.departament;

                        Enterprise.findByIdAndUpdate(enterpriseId, { $push: { employees: employee } }, { new: true }, (err, enterpriseUpdate) => {
                            if (err) {
                                res.status(500).send({
                                    message: "Error al guardar el contacto"
                                });
                            } else if (enterpriseUpdate) {
                                Enterprise.findByIdAndUpdate(enterpriseId, { $inc: { cantidadEmpleado: 1 } }, { new: true }, (err, enterpriseInc) => {
                                    if (err) {
                                        res.status(500).send({
                                            message: "Error al incrementar el empleado"
                                        })
                                    } else if (enterpriseInc) {
                                        res.status(200).send({
                                            message: "Contacto agregado", enterpriseInc
                                        })
                                    }
                                })
                            } else {
                                res.status(404).send({
                                    message: "Empleado no agregado"
                                })
                            }
                        });
                    } else {
                        res.status(200).send({
                            message: "Ingrese los datos minimos para agregar un empleado"
                        })
                    }
                } else {
                    res.status(200).send({
                        message: "No existe el empleado"
                    })
                }
            })
        }
    },
    /* ACTUALIZAR EMPLEADO */
    updateEmployee: function (req, res) {
        let enterpriseId = req.params.idE;
        let employeeId = req.params.idEm;
        let update = req.body;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            if (update.name && update.lastname && update.job && update.departament) {
                Enterprise.findOne({ _id: enterpriseId }, (err, enterpriseFind) => {
                    if (err) {
                        res.status(500).send({
                            message: "Error General"
                        })
                    } else if (enterpriseFind) {
                        Enterprise.findOneAndUpdate({
                            _id: enterpriseId,
                            'employees._id': employeeId
                        }, {
                            'employees.$.name': update.name,
                            'employees.$.lastname': update.lastname,
                            'employees.$.job': update.job,
                            'employees.$.departament': update.departament
                        }, { new: true }, (err, employeeUpdate) => {
                            if (err) {
                                res.status(500).send({
                                    message: "Error general al actualizar al empleado"
                                })
                            } else if (employeeUpdate) {
                                res.status(200).send({
                                    message: "Empleado actualizado: ", employeeUpdate
                                })
                            } else {
                                res.status(404).send({
                                    message: "Contacto no actualizado"
                                })
                            }
                        })
                    } else {
                        res.status(200).send({
                            message: "El empleado no existe"
                        })
                    }
                })
            } else {
                res.status(200).send({
                    message: "Enviar los datos minimos"
                })
            }
        }
    },
    /* ELIMINAR EMPLEADO */
    removeEmployee: function (req, res) {
        let enterpriseId = req.params.idE;
        let employeeId = req.params.idEm;

        if (enterpriseId != req.user.sub) {
            res.status(404).send({
                message: "No tienes acceso a esta funcion"
            })
        } else {
            Enterprise.findOneAndUpdate({ _id: enterpriseId, 'employees._id': employeeId },
                { $pull: { employees: { _id: employeeId } } }, { new: true }, (err, employeeRemove) => {
                    if (err) {
                        res.status(500).send({
                            message: "El id del empleado no existe"
                        })
                    } else if (employeeRemove) {
                        Enterprise.findByIdAndUpdate(enterpriseId, { $inc: { cantidadEmpleado: -1 } }, { new: true }, (err, enterpriseInc) => {
                            if (err) {
                                res.status(500).send({
                                    message: "Error al desincrementar el empleado"
                                })
                            } else if (enterpriseInc) {
                                res.status(200).send({
                                    message: "Actualizacion de estado de la empresa", enterpriseInc
                                })
                            }
                        })
                    } else {
                        res.status(404).send({
                            message: 'Empleado no encontrado o ya eliminado'
                        })
                    }
                })
        }
    }
};

module.exports = enterpriseController;