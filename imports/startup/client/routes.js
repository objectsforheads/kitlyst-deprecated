import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route( '/', {
  name: 'homepage',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'homepage' } );
  }
});

var deckBuild = FlowRouter.group({
  prefix: '/deck/build'
})

deckBuild.route('/', {
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'deckBuildWrapper' } );
  }
})
deckBuild.route('/:hash', {
  action: function(params) {
    BlazeLayout.render( 'mainLayout', { main: 'deckBuildWrapper' } );
  }
})

FlowRouter.route( '/deck/edit/:hash', {
  name: 'deckEdit',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'deckEdit' } );
  }
});
FlowRouter.route( '/deck/view', {
  name: 'deckView',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'deckView' } );
  }
});
