//REQUIRE
var ftp = require("ftp-srv")


console.log('-- ProjectTube Server --')

//FTP SERVER INIT
var ftpServ = new ftp("ftp://127.0.0.1:250", {});
ftpServ.on('login', ({connection, username, password}, resolve, reject) => {
    if (username != "root" && password != "root"){reject("auth")}
    resolve({root : __dirname + "/Video/Temp/"})
}) 

ftpServ.listen().then(() => {
    console.log("FTP server is running !")
});