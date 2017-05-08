var AarTransformer = require('appc-aar-transform');
var async = require('async');
var fs = require('fs');
var fsxtra = require('fs-extra');

var path = require('path');

exports.cliVersion = '>=3.2';

exports.init = function (logger, config, cli) {
	cli.on('build.pre.compile', {
        post: function (builder, callback) {
            builder.classPaths = {};
            builder.extraPackages = {};
            var foundAndroidArchives = [];
            var aarOutputPath = path.join(builder.buildDir, 'intermediates/exploded-aar');
            var assetsDestinationPath = builder.buildBinAssetsDir;
            var libraryDestinationPath = path.join(builder.buildDir, 'intermediates/lib');
            var sharedLibraryDestinationPath = path.join(builder.buildDir,"jni");
            var transformer = new AarTransformer(logger);
            var modulePath ="";
            var moduleAarPath ="";
            builder.modules.forEach(function (module) {
            modulePath = module.modulePath;
            moduleAarPath = path.join(module.modulePath,"aar");
            if(fs.existsSync(moduleAarPath)) {
                fs.readdirSync(moduleAarPath).forEach(function (file) {
                    if (/\.aar/.test(file)) {
                        foundAndroidArchives.push(path.join(moduleAarPath, file));
                    }
                });
            }
        });
            async.forEachSeries(foundAndroidArchives, function(aarPathAndFilename, next) {
                var aarBasename = path.basename(aarPathAndFilename, '.aar');
                transformer.transform({
                    aarPathAndFilename: aarPathAndFilename,
                    outputPath: aarOutputPath,
                    assetsDestinationPath: assetsDestinationPath,
                    libraryDestinationPath: libraryDestinationPath,
                    sharedLibraryDestinationPath: sharedLibraryDestinationPath
                }, function(err, result) {
                    if (err) {
                        logger.info("Error occured " + err);
                        return next(err);
                    }
                    result.jars.forEach(function(jarPathAndFilename) {
						var destPath = libraryDestinationPath;
                    	var jarName = path.basename(jarPathAndFilename);
                    	if(jarName === "classes.jar")
						{
							var dest = path.join(destPath, aarBasename + '.jar');
                            builder.aarClassPaths[dest] = jarName;
                            fsxtra.copySync(jarPathAndFilename, dest);
						} else if (jarName === "org.apache.http.legacy.jar") {
                    		;
                        }  else {
                            var dest = path.join(destPath, jarName);
                            builder.aarClassPaths[dest] = jarName;
						}

                    });
					var resDir = path.dirname(result.jars[0])+"/res";
					builder.aarResPackages[resDir]=result.packageName;
					builder.extraPackages[result.packageName] = 1;
                    next();
                });
            }, callback);
        }
    });
};