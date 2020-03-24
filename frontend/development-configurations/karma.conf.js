// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html
const isDocker = require('is-docker')();
process.env.CHROME_BIN = require('puppeteer').executablePath()
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadless1024X768: {
        base: "ChromeHeadless",
        flags: isDocker ? ["--window-size=1024,768", "--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"] : ["--window-size=1024,768"]
      }
    },
    singleRun: false
  });
};
