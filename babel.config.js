module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  babelrcRoots: ['.', 'modules/*', 'modules-test'],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  env: {
    'es5': {
      'presets': [
        [
          '@babel/env',
          {
            'forceAllTransforms': true,
            'modules': 'commonjs'
          }
        ]
      ],
      'plugins': [
        'version-inline'
      ]
    },
    'esm': {
      'presets': [
        [
          '@babel/env',
          {
            'targets': {
              'chrome': '60',
              'edge': '15',
              'firefox': '53',
              'ios': '9',
              'safari': '9',
              'ie': '11',
              'node': '6'
            },
            'modules': false
          }
        ]
      ],
      'plugins': [
        'version-inline'
      ]
    },
    'es6': {
      'presets': [
        [
          '@babel/env',
          {
            'targets': {
              'chrome': '60',
              'edge': '15',
              'firefox': '53',
              'ios': '10.3',
              'safari': '10.1',
              'node': '8'
            },
            'modules': false
          }
        ]
      ],
      'plugins': [
        'version-inline'
      ]
    },
    'test': {
      'plugins': [
        'istanbul'
      ]
    }
  }
}
