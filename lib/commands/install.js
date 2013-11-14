var bower = require('bower'),
    chalk = require('chalk'),
    path = require('path'),
    Q = require('q'),
    PluginTypeResolver = require('../PluginTypeResolver'),
    PackageMeta = require('../PackageMeta'),
    Plugin = require('../Plugin'),
    RendererHelpers = require('../RendererHelpers');

module.exports = {
    install: function (renderer, packageName, done) {
        done = done || function () {};
        
        var plugin = new Plugin(packageName);

        PackageMeta.getKeywords(plugin)
        .then(function (keywords) {
            var resolver = new PluginTypeResolver(),
                pluginType = resolver.resolve(keywords);

            renderer.log(chalk.cyan(plugin.packageName), 'found.', 'Installing', pluginType.typename, '...');
            return install(plugin, { 
                directory: path.join('src', pluginType.belongsTo)
            });
        })
        .then(function (installed) {
            if(!installed) throw new Error('The plugin was found but failed to download and install.')
            
            renderer.log(chalk.cyan(plugin.packageName), 'has been installed successfully.');
            done();
        })
        .fail(RendererHelpers.reportFailure(renderer, done));
    }
};

function install (plugin, config) {
    var deferred = Q.defer();

    bower.commands.install([plugin.toString()], { save: true }, config)
    .on('end', function(installed) {
        deferred.resolve(installed);
    })
    .on('error', function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}