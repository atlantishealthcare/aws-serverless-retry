module.exports = process.env.YOURPACKAGE_COVERAGE
    ? require('./lib-cov/sns_notifier')
    : require('./lib/sns_notifier');