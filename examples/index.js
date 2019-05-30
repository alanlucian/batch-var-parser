const batchVars = require('../src/index');
(async ()=>{
    var data = await batchVars.extract( __dirname +'\\first.bat' );
    console.log( data );
})()
