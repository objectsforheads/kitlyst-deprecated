import './card.html';

import scrollMonitor from 'scrollmonitor';

Template.databaseCard.helpers({
  cardResult() {
    if (this.layout === 'cardResult') { return true; }
    return false;
  },
  pageModal() {
    if (this.layout === 'pageModal') { return true; }
    return false;
  },
  currentCard() {
    if (this.layout === 'currentCard') { return true; }
    return false;
  },
  historicalCard() {
    if (this.layout === 'historicalCard') { return true; }
    return false;
  },
  aSprite() {
    if (this.layout === 'aSprite') { return true; }
  },
  dynamicCard() {
    if (this.layout === 'dynamicCard') { return true; }
  },
  blankCard() {
    if (this.layout === 'blankCard') { return true; }
  },
  blankUnit() {
    if (this.info === 'Unit') { return true; }
  },
  slugifiedName() {
    return this.info.name.replace(/['"]+/g, "").replace(/[^a-zA-Z0-9]+/g,"-").replace("/--/g", "-").toLowerCase();
  },
  parsedDescription: function() {
    return Spacebars.SafeString(boldKeywords(this.info.description));
  }
})

Template.databaseCard.onRendered(function(e) {
  if ($('.lazyLoad').length > 0) {
    $('.lazyLoad').each(function() {
      var watcher = scrollMonitor.create($(this)[0], 500);
      watcher.stateChange(lazyLoad);
      lazyLoad.call(watcher);
      $(this).removeClass('lazyLoad');
    })
  }

  function lazyLoad() {
    if (this.isInViewport) {
      var id = $(this.watchItem).attr('data-id');
      $(this.watchItem).addClass('id_' + id);
      if ( $('head').find('link[href*="css/sprites/id/' + id + '\.min.css"]').length === 0 ) {
        $('head').append('<link href="/css/sprites/id/' + id + '.min.css" rel="stylesheet">')
      }

      this.destroy();
    }
  }
})


Template.highlightQuery.helpers({
  highlighted() {
    var text = this.text;

    if (this.keywords === true) {
      text = boldKeywords(text);
    }

    // Escape the query
    var escapedQuery = this.query.replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
    // Esscape the text
    text = text.replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
    // Run the highlighter
    var regex = new RegExp(escapedQuery, 'gi');
    text = text.replace(regex, '<span class="highlighted">$&</span>');
    // unescape the text
    text = text.replace(/\\/g,'')

    return Spacebars.SafeString(text);
  }
})

boldKeywords = function(str) {
  var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback'];

  keywords.forEach(function(keyword) {
    var regex = new RegExp(keyword, 'g');
    str = str.replace(regex, "<b>$&</b>");
  })

  return str;
}
