
const
    bcrypt = require("bcrypt")
;
let
    saltRounds = 10
;
bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash("marzipan", salt, function(err, hash) {
        // Store hash in your password DB.
        console.log(hash);
    });
});
debugger;
// EOF