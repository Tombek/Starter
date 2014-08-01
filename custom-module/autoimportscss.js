// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var glob = require("glob")
var PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-autoimportscss';

// Plugin level function(dealing with files)
function autoImportScss(dirArg, dirRoot) {    
    // If has error, use line below
    // throw new PluginError(PLUGIN_NAME, "Missing files!");
    
    // Get files to import
    var filesToImport = glob.sync(dirArg);

    // Creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, callback) {
        if (file.isNull()) {
           // Do nothing if no contents
        }
        if (file.isBuffer()) {
            var content = file.contents.toString();
            // Set imports to add in main scss if not in it
            for (var i in filesToImport) {
                var f = filesToImport[i].replace(/\.[^/.]+$/, "").replace(/_/, "").replace(dirRoot, "");

                if(content.indexOf(f) < 0){
                    content += '\n@import \'' + f + '\';';
                }
            }

            file.contents = new Buffer(content);
        }

        this.push(file);
        return callback();

    });

    // returning the file stream
    return stream;
};

// Exporting the plugin main function
module.exports = autoImportScss;