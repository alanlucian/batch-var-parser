
const path = require("path");
const fs = require('fs')
const LineByLineReader = require('line-by-line');



function BatchVarParser(){
    let returnData = new Map();
    let reader = {};


    var applyVarsIntoLine = (line, dp0)=>{
        line = line.replace('%~dp0',dp0);
        var vars = line.match(/%[a-zA-Z0-9-_]+%/g);
        if(vars == null) {
            return line;
        }
        vars.forEach(element => {
            var propertie = element.replace(/%/g, '');
            if( returnData.has(propertie)){
                line = line.replace(`${element}`,returnData.get(propertie));
            }
        });

        return line;

    }

    var parseAdditionalBatch = ( line , baseDir )=>{

        var file = line.match(/^ *CALL +([\w-\/\\.:]+)/i)
        file.shift();//remove match line
        file = file.pop(); // get file 
        if (!fs.existsSync(file)) {
            file  = path.join(baseDir, file);
        }
        if (!fs.existsSync(file)) {
            throw new Error( `Corupted BATCH command ${file} does not exists ` );
        }
        return this.extract(file, false);

    }

    var parseFileContent = ( file )=>{
        
            var dp0 = path.dirname(file);
            var dataFile = fs.readFileSync( file , 'utf8');
            /*var i = 
            reader[file] = {
                interface : new LineByLineReader( file )
            }*/

            var lines  = dataFile.split("\n");
            for(var l in lines){
                var line = lines[l].replace('\r','');
            //reader[file].interface.on('line', async (line)=>{

                // skip comments
                if(line.match(/^ *::/i) ||line.match(/^ *REM/i) ){
                   continue ;
                }

                //Apply variables into line
                line = applyVarsIntoLine(line, dp0);                

                //CALLING external BATCH
                if(line.match(/^ *CALL/i)){
                    parseAdditionalBatch(line, dp0);
                    continue;
                }

                var data = line.match(/SET ([a-zA-Z0-9-_]+)= ?(.*)$/i);            
                if( data == null ){
                    continue;
                }
                var [m,key,value] = data;
                returnData.set(key, value);
                
            //})
            }
            return returnData;

    };

    this.extract = ( filePath, reset = true )=>{
        if( reset ){
            returnData = new Map();
            reader = {};
        }
        if (!fs.existsSync(filePath)) {
            throw new Error(  `file not found ${filePath}`);
        }
        return parseFileContent( filePath )
    }

}

module.exports = new BatchVarParser();