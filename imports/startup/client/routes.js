import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route( '/', {
  name: 'homepage',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'homepage' } );
  }
});

FlowRouter.route( '/deck/build', {
  name: 'deckBuild',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'deckBuild' } );
  }
});
FlowRouter.route( '/deck/edit', {
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
