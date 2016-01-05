/*
    JavaScript c style pre-compiler script for node.js
    Created by Iain Shorter on 19th May 2015
    MIT License
    
    TODO - 
        Convert to streams to optimise speed
        Optimise memory
        #else
        #elseif
*/

var fs = require('fs'),
    beau = require('./jsbeautify.js');

var compile = (function () {

    var definitions = {},
        bLocked = false,
        output = [],
        activeFile,
        activeLine,
        main = {

            /*
                #include
                compiles file and injects in place to the parent file

                Example (Compiling "Parent.js" to "Output.js"):
                
                    Child.js -
                        var foo = 12;

                    Parent.js - 
                        #include Child.js
                        function bar() {
                            console.log(foo);
                        }
                        
                    Output.js - 
                        var foo = 12;
                        function bar() {
                            console.log(foo);
                        }
            */

            include: function (filename) {
                if (!bLocked) {
                    buildLog("Including \"" + filename + "\" into \"" + activeFile + "\"");
                    readFile(filename);
                }
            },

            /*
                #iffunc
                injects a function call with defined variables if the function has been defined

                Example (Compiling "InputA.js" to "OutputA.js" and "InputB.js" to "OutputB.js"):
                
                    InputA.js -
                        var foo = 'bar';
                        #iffunc LOG foo

                    OutputA.js - 
                        var foo = 'bar';
                        
                    InputB.js -
                        var foo = 'bar';
                        #define LOG function(a) { console.log(a); }
                        #iffunc LOG foo

                    OutputB.js - 
                        var foo = 'bar';
                        GLOBAL["LOG"] = function(a) { console.log(a); }
                        GLOBAL["LOG"](foo);
            */

            iffunc: function (key, value) {
                if (!bLocked && definitions[key]) {
                    definitions[key] = value;
                    buildLog("Inserting conditional function \"" + key + "\" with arguments " + value);
                    output.push('GLOBAL[\"' + key + '\"](' + value + ');');
                }
            },

            /*
                #define
                defines a global variable in the compiler and the output code, value defaults to true if no value is given

                Example (Compiling "Input.js" to "Output.js"):
                
                    Input.js -
                       #define foo "bar"

                    Output.js - 
                        GLOBAL["foo"] = "bar";
            */

            define: function (key, value) {
                if (!bLocked) {
                    value = value || true;
                    definitions[key] = value;
                    buildLog("Defining \"" + key + "\" as \"" + value + "\"");
                    output.push('GLOBAL[\"' + key + '\"] = ' + value + ';');
                }
            },

            /*
                #undef
                clears a global variable in the compiler and the output code 

                Example (Compiling "Input.js" to "Output.js"):
                
                    Input.js -
                       #undef foo "bar"

                    Output.js - 
                        GLOBAL["foo"] = null;
            */

            undef: function (key) {
                if (!bLocked) {
                    definitions[key] = null;
                    buildLog("Deleting definition \"" + key + "\"");
                    output.push('GLOBAL[\"' + key + '\"] = null;');
                }
            },

            /*
                #if
                injects the following code block if the specified key is defined, the end of the block must be marked with "#endif"

                Example (Compiling "InputA.js" to "OutputA.js" and "InputB.js" to "OutputB.js"):
                
                    InputA.js -
                        #if DEBUG
                        var foo = 'bar';
                        #endif

                    OutputA.js - 
                        
                        
                    InputB.js -
                        #define DEBUG 
                        #if DEBUG
                        var foo = 'bar';
                        #endif

                    OutputB.js - 
                        GLOBAL["DEBUG"] = true;
                        var foo = 'bar';
            */

            ifdef: function (key) {
                if (!bLocked) {
                    if (!definitions[key]) {
                        buildLog("Skipping conditional block");
                        bLocked = key;
                    } else {
                        buildLog("Inserting conditional block into script");
                    }
                }
            },

            /*
                #ifn
                injects the following code block if the specified key is NOT defined, the end of the block must be marked with "#endif"

                Example (Compiling "InputA.js" to "OutputA.js" and "InputB.js" to "OutputB.js"):
                
                    InputA.js -
                        #ifn DEBUG
                        var foo = 'bar';
                        #endif

                    OutputA.js - 
                        var foo = 'bar';
                        
                    InputB.js -
                        #define DEBUG 
                        #ifn DEBUG
                        var foo = 'bar';
                        #endif

                    OutputB.js - 
                        GLOBAL["DEBUG"] = true;
            */

            ifndef: function (key) {
                if (!bLocked) {
                    if (definitions[key]) {
                        buildLog("Skipping conditional block");
                        bLocked = key;
                    } else {
                        buildLog("Inserting conditional block into script");
                    }
                }
            },

            /*
                #endif
                Marks the end of a "#if" or "#ifn" conditional block

                Example :
                
                    See "#if" or "#ifn"
            */

            endif: function (key) {
                if (bLocked) {
                    bLocked = false;
                }
            }
        }

    /*
        Compiler Output Stream :
            -> Time of log in HH:MM:SS
            -> File being compiled
            -> Line number of current file
            -> Log message
    */

    function buildLog(text) {
        console.log(
            "[" + new Date().toTimeString().split(' ')[0] + "] " +
            activeFile +
            " Line:" + activeLine +
            " ---- " + text
        );
    }
    
    /*
        Read and compile contents of a file, line by line.
    */

    function readFile(name) {
        var contents = fs.readFileSync(name),
            lines,
            i,
            l;
        
        if(!contents) {
            buildLog("ERROR - Failed to read file!");
            return;
        }
        
        contents = contents.toString('utf8'); 

        for (lines = contents.split(/\r?\n/), i = 0, l = lines.length; i < l; i++) {
            activeLine = i + 1;
            activeFile = name;
            readLine(lines[i]);
        }
    }
    
    /*
        Process single file from line
    */

    function readLine(line) {
        if (line.trim().indexOf('#') === 0) { //special line
            var chunks = line.trim().substr(1).split(' ');
            if (main[chunks[0]]) {
                main[chunks[0]](
                    chunks[1] || '',
                    chunks.splice(0, 2) && chunks.join(' ')
                );
            }
        } else { //boring line
            if (!bLocked) {
                output.push(line);
            }
        }
    }
    
    /*
        Return main function for module
    */

    return function (srcfile, outputfile) {
        
        // get the contents of our main file
        var filebuffer = fs.readFileSync(srcfile);
        
        // add our GLOBAL definition to the beginning of the file, for node.js compatability 
        output.push([
            "(function(){",
            "    var G = window || global;",
            "    G.GLOBAL = G;",
            "}());"
        ].join(''));
        
        // compile our main file
        readFile(srcfile);
        
        // beautify and create buffer from output text
        var outputbuffer = new Buffer(
            beau.js_beautify(
                output.join('\n'),
                {
                    "preserve_newlines": false,
                    "indent_size": 2
                }
            )
        );
        
        // write out our output to file
        fs.writeFileSync(outputfile, outputbuffer);
        
        // clear down compiler state
        definitions = {};
        bLocked = false;
        output.length = 0;
        activeLine = null;
        activeFile = null;
    };
}());

(function () {
    compile('src/webservice.js', 'webservice.js');
    process.exit();
}());