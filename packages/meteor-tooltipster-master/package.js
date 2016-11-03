Package.describe({
  name: 'comerc:tooltipster',
  summary: 'A powerful, flexible jQuery plugin enabling you to easily create semantic, modern tooltips enhanced with the power of CSS.',
  version: '3.3.0',
  git: 'https://github.com/comerc/meteor-watch.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.use('jquery', 'client');
  api.addFiles([
    'tooltipster.css',
    'tooltipster.js',
  ], 'client');
});
