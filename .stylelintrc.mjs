export default {
  extends: 'stylelint-config-standard',
  ignoreFiles: ['examples/**/*.css'],
  rules: {
    'color-hex-length': null,
    'declaration-empty-line-before': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'no-descending-specificity': null,
    'shorthand-property-no-redundant-values': null,
  },
};
