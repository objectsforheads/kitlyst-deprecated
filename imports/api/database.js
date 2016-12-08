// Set the compound index for database searching
allCards._ensureIndex( { name: 1, race: 1, description: 1 } );

Meteor.publish( 'databaseResults', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );

  if (search !== null && typeof search !== 'undefined') {
    search = search.replace(/[-[\]{}()*+?%.,\\=!<>^$|#]/g, "\\$&");
  }

  let query      = {},
      projection = { limit: 100, sort: { title: 1 } };

  if ( search ) {
    let regex = new RegExp( search, 'gi' );

    query = {
      $or: [
        { name: regex },
        { race: regex },
        { description: regex }
      ]
    };

    return allCards.find( query, projection );
  }
});
