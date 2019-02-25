var fs = require("fs");
var JavaScriptObfuscator = require('javascript-obfuscator');


fs.readdirSync('./public/js-backup').forEach(file => {
    fs.readFile('./public/js-backup/' + file, "UTF-8", function(err, data) {
        if (err) {
            throw err;
        }
    
        // Obfuscate content of the JS file
        var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
            compact: false,
            debugProtection: true,
            debugProtectionInterval: true,
            selfDefending: true
        });
        
        // Write the obfuscated code into a new file
        fs.writeFile('./dist/js/' + file, obfuscationResult.getObfuscatedCode() , function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved!");
        });
    });
    
});