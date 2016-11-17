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

import Clipboard from 'clipboard';

Template.mainLayout.helpers({
  'userAccessing': function() {
    return Session.get('userAccess');
  }
})

Template.mainLayout.onRendered(function() {
  var urlCopy = new Clipboard('.clipboardJS-trigger');

  urlCopy.on('success', function() {
    sAlert.success('Url copied');
  })
  urlCopy.on('error', function() {
    sAlert.error('Could not copy URL! Ctrl+C to continue.');
  })
})
