import '../../ui/css/normalize.css';
import '../../ui/css/rpg-awesome.css';
import '../../ui/css/typebase.css';
import '../../ui/css/typography.scss';

import '../components/mainNav.js';
import '../components/mainFooter.html';
import '../components/shim/loader.js';
import '../components/shim/error.js';
import '../components/shim/userAccess.js';

import './main.html';

Template.mainLayout.helpers({
  'userAccessing': function() {
    return Session.get('userAccess');
  }
})
