import './routes.js';

import '../../ui/layouts/main.js';

import '../../ui/components/card.js';

import '../../ui/pages/homepage.js';
import '../../ui/pages/account.js';

import '../../ui/pages/deck/build.js';
import '../../ui/pages/deck/view.js';

import '../../ui/pages/admin/main.js';

import '../../ui/pages/devlog/main.js';

import '../../ui/pages/database/main.js';
import '../../ui/pages/database/single.js';
import '../../ui/pages/database/faction.js';
import '../../ui/pages/database/patch.js';

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
