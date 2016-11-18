// Allow Google Fonts
BrowserPolicy.content.allowOriginForAll('fonts.googleapis.com');
BrowserPolicy.content.allowOriginForAll('fonts.gstatic.com');

// Allow Google Analytics
BrowserPolicy.content.allowOriginForAll("www.google-analytics.com");

// Allow CDNs
BrowserPolicy.content.allowOriginForAll('cdnjs.cloudflare.com');
BrowserPolicy.content.allowOriginForAll('maxcdn.bootstrapcdn.com');
BrowserPolicy.content.allowOriginForAll('cdn.jsdelivr.net');

// Allow imgur images
BrowserPolicy.content.allowOriginForAll('i.imgur.com');

import '../../api/deck.js';
import '../../api/account.js';
import '../../api/admin.js';

if (allCards.find().count() === 0) {
  var apiKey = 'cf156a2e4b5296b5a184e53ab14dd99f';
  HTTP.get('http://listlyst.com/api/v1/cards?apikey=' + apiKey, {}, function(err, res) {
    if (err) {
      console.log("Something's gone wrong!");
    }
    else {
      var cards = res.data;
      cards.forEach(function(card) {
        allCards.insert(card);
      })
    }
  })
}
