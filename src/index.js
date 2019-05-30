
const path = require("path");
const fs = require('fs')
const LineByLineReader = require('line-by-line');



function BatchVarParser(){
    let returnData = {};
    let reader = {};
    var applyVarsIntoLine = (line, dp0)=>{
        line = line.replace('%~dp0',dp0);
        var vars = line.match(/%[a-zA-Z0-9-_]+%/g);
        if(vars == null) {
            return line;
        }
        vars.forEach(element => {
            var propertie = element.replace(/%/g, '');
            line = line.replace(`${element}`,returnData[propertie]);
        });

        return line;

    }

    var parseAdditionalBatch = async ( line , baseDir )=>{

        var file = line.match(/^ *CALL +([\w-\/\\.:]+)/i)
        file.shift();//remove match line
        file = file.pop(); // get file 
        if (!fs.existsSync(file)) {
            file  = path.join(baseDir, file);
        }
        if (!fs.existsSync(file)) {
            throw new Error( `Corupted BATCH command ${file} does not exists ` );
        }
        return this.extract(file);

    }

    var parseFileContent = ( file )=>{
        return new Promise((resolve,reject)=>{
            var dp0 = path.dirname(file);
            //var dataFile = fs.readFileSync( filePath , 'utf8');
            var i = 
            reader[file] = {
                interface : new LineByLineReader( file )
            }

            reader[file].interface.on('line', async (line)=>{


                console.log(line);

                // skip comments
                if(line.match(/^ *::/i) ||line.match(/^ *REM/i) ){
                    return;
                }

                //Apply variables into line
                line = applyVarsIntoLine(line, dp0);                

                //CALLING external BATCH
                if(line.match(/^ *CALL/i)){
                    reader[file].interface.pause();
                    parseAdditionalBatch(line, dp0).then((d)=>{
                        console.log(d);
                        reader[file].interface.resume();
                    });
                    return;
                }

                var data = line.match(/SET ([a-zA-Z0-9-_]+)= ?(.*)$/i);            
                if( data == null ){
                    return;
                }
                var [m,key,value] = data;
                returnData[key] = value;
                
            })

            reader[file].interface.on('end',(line)=>{
                resolve(returnData)
            })

        });
    };

    this.extract = ( filePath )=>{
        return new Promise((resolve,reject)=>{
            if (!fs.existsSync(filePath)) {
                reject( `file not found ${filePath}`);
            }
            parseFileContent( filePath ).then(resolve)            
        });        
    }

}

module.exports = new BatchVarParser();