const fs = require('fs');
const chalk = require('chalk');

module.exports = {
  input: [
    'src/**/*.{js,jsx}',
    'views/**/*.{ejs,html}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{js,jsx}',
    '!client/modules/i18n.js'
  ],
  output: './',
  options: {
    debug: true,
    removeUnusedKeys: true,
    sort: true,
    attr: {
      list: ['data-i18n', 'data-i18n-placeholder', 'data-i18n-title'],
      extensions: ['.ejs', '.html']
    },
    func: {
      list: ['i18next.t', 'i18n.t', 't', 'req.t', 'window.t'],
      extensions: ['.js', '.jsx', '.ejs']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      extensions: ['.js', '.jsx'],
      fallbackKey: function(ns, value) {
        return value;
      }
    },
    lngs: ['id', 'en'],
    ns: [
      'common',
      'auth',
      'landing',
      'dashboard',
      'pomodoro',
      'analytics',
      'quiz',
      'chatbot',
      'mood',
      'notification',
      'validation',
      'calendar',
      'gamification',
      'api',
      'error',
      'onboarding',
      'chat',
      'pomo',
      'general',
      'btn',
      'sidebar',
      'page'
    ],
    defaultLng: 'id',
    defaultNs: 'common',
    defaultValue: function(lng, ns, key) {
      if (lng === 'en') {
        return `__NOT_TRANSLATED__`; // Return key for english if not translated
      }
      return key;
    },
    resource: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: '.', // namespace separator
    keySeparator: '.', // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);

    parser.parseFuncFromString(content, { list: ['t', 'req.t', 'window.t'] }, (key, options) => {
      parser.set(key, Object.assign({}, options, {
        nsSeparator: '.',
        keySeparator: '.'
      }));
    });

    parser.parseAttrFromString(content, { list: ['data-i18n', 'data-i18n-placeholder', 'data-i18n-title'] }, (key, options) => {
        parser.set(key, Object.assign({}, options, {
            nsSeparator: '.',
            keySeparator: '.'
        }));
    });

    done();
  }
};
