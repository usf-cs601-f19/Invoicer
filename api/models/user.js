module.exports.loginUser = (req, res) => {
    console.log(req.body);
    let mobile = req.body.mobile;
    let password = req.body.password;

    connectionPool.query("SELECT * FROM invoicing.user where mobile = ?", [mobile], function(error, result, fields) {
        if (error) {
            res.status(500).send({
                status: "error",
                [error.errno]: error.sqlMessage
            });
        } else{
            if(result.length>0){
                console.log("result",result[0].password);
                if(bcrypt.compareSync(password, result[0].password)) {
                    // Passwords match

                    res.status(200).send({
                        status: "success",
                        data: result,
                        message: ""
                    });

                } else {
                    res.status(401).send({
                        status: "error",
                        data:"" ,
                        message: "password didn't match"
                    });
                }

            }
            else{
                res.status(500).send({
                    status: "error",
                    data:"" ,
                    message: "No account found"
                });
            }
        }
    });
}

module.exports.addUser = (req, res) => {

    let name = req.body.name;
    let mobile = req.body.mobile;
    let password = req.body.password;
    let company_name = req.body.company_name;
    let company_website = req.body.company_website;
    let email = req.body.email;

    let hashPassword = bcrypt.hashSync(password, 10);

    connectionPool.query("INSERT into invoicing.user(name, mobile, password, company_name, comapny_website, email) VALUES(?,?,?,?,?,?)", [name, mobile, hashPassword, company_name, company_website, email], function(error, result, fields) {
        console.log("user add result",result,error);
        if (error) {
            res.status(500).send({
                status: "error",
                message: error.sqlMessage
            });
        } else
            res.status(200).send({
                status: "success",
                data: result.insertId,
                message: "User added successfully"
            });
    });
}
