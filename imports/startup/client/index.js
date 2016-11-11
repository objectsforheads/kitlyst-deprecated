import './routes.js';

import '../../ui/layouts/main.js';

import '../../ui/components/card.js';

import '../../ui/pages/homepage.js';

import '../../ui/pages/deck/build.js';
import '../../ui/pages/deck/edit.js';
import '../../ui/pages/deck/view.js';

sAlert.config({
  effect: 'jelly',
  position: 'top-left',
  timeout: 2000,
  html: false,
  onRouteClose: true,
  stack: true,
  offset: 10,
  beep: false,
  onClose: _.noop
});
