var _ = require('lodash')

module.exports = function (config) {
  process.env.NODE_ENV = 'test'

  switch (process.env.ENV) {
    case 'CI':
      config.set(saucelabs())
      break
    default:
      config.set(local())
      break
  }

  function saucelabs () {
    var customLaunchers = {
      sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        version: '38'
      },
      sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '33'
      },
      sl_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        version: '5'
      },
      sl_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      sl_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    }

    return _.extend(base(), {
      sauceLabs: {
        testName: 'TestTree Tests'
      },
      browserDisconnectTimeout: 10000,
      browserDisconnectTolerance: 1,
      browserNoActivityTimeout: 4 * 60 * 1000,
      captureTimeout: 4 * 60 * 1000,
      customLaunchers: customLaunchers,
      browsers: _.keys(customLaunchers),
      reporters: ['dots', 'saucelabs'],
      singleRun: true
    })
  }

  function local () {
    return _.extend(base(), {
      reporters: ['spec'],
      browsers: ['Chrome'],
      autoWatch: true,
      singleRun: false,
      colors: true
    })
  }

  function base () {
    return {
      basePath: '',
      frameworks: ['mocha', 'sinon-chai'],
      files: ['test/testIndex.js'],
      preprocessors: {
        'test/testIndex.js': ['webpack', 'sourcemap']
      },
      webpack: {
        devtool: 'inline-source-map',
        module: {
          loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=react' }
          ]
        }
      }
    }
  }
}
