import './card.html';

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
  slugifiedName() {
    return this.info.name.replace(/['"]+/g, "").replace(/[^a-zA-Z0-9]+/g,"-").replace("/--/g", "-").toLowerCase();
  },
  parsedDescription: function() {
    return Spacebars.SafeString(boldKeywords(this.info.description));
  }
})


Template.highlightQuery.helpers({
  highlighted() {
    var text = this.text;

    if (this.keywords === true) {
      var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback']
      keywords.forEach(function(keyword) {
        var regex = new RegExp(keyword, 'g');
        text = text.replace(regex, "<b>$&</b>");
      })
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

Template.registerHelper('loadSprites', function() {
  allCards.find({}).fetch().forEach(function(card) {
    if ( $('head').find('link[href*="css/sprites/id/' + card.id + '"]').length === 0 ) {
      $('head').append('<link href="/css/sprites/id/' + card.id + '.min.css" rel="stylesheet">')
    }
  })
})
