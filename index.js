module.exports = process.env.QUICKSORT_COV
    ? require('./lib-cov/sns_notifier.js')
    : require('./lib/sns_notifier.js');