/**
 * @author : Benjamin Klix
 */
(function(){

  var config = {
    icons: {},
    shortIcons: {},
    additionalAttributes: {
      draggable: false,
      src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }
  };

  var helpers = {
    loadConfig: function(type) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          config[type] = JSON.parse(xhr.response);
        }
      };
      xhr.open("GET", chrome.extension.getURL('/config/'+type+'.json'), true);
      xhr.send();
    },

    replaceSmiley: function(node, icon, start, end) {
      var smileyPannelIsOpen = document.querySelector('.icon-hide') !== null,
          iconClass = icon['class'].substr(6),
          pannels = [
            '.icon-emoji-people',
            '.icon-emoji-nature',
            '.icon-emoji-things',
            '.icon-emoji-places',
            '.icon-emoji-symbols'
          ],
          smileyInPannel;

      helpers.range = helpers.selection.getRangeAt(0);
      helpers.range.setStart(node, start);
      helpers.range.setEnd(node, end);
      helpers.range.deleteContents();
      helpers.selection.removeAllRanges();
      helpers.selection.addRange(helpers.range);

      if (!smileyPannelIsOpen) {
        document.querySelector('.icon-smiley').click();
        document.querySelector('.emoji-panel').style.display = 'none';
      }
      for (var i=0; i<pannels.length; i++) {
        document.querySelector(pannels[i]).click();
        smileyInPannel = document.querySelector('.emoji-panel-body .' + iconClass);
        if (smileyInPannel !== null) {
          smileyInPannel.click();
          break;
        }
      }
      if (!smileyPannelIsOpen) {
        document.querySelector('.icon-hide').click();
        setTimeout(function() {
          document.querySelector('.emoji-panel').style.display = '';
        }, 600);
      }
    },

    filterIcons: function(smileyStart) {
      var icons = {};
      if (config.icons[smileyStart] !== undefined) {
        icons[smileyStart] = config.icons[smileyStart];
        return icons;
      }
      for (var smiley in config.icons) {
        if (smiley.indexOf(smileyStart) === 0) {
          icons[smiley] = config.icons[smiley];
        }
      }
      return icons;
    },

    buildSmileyList: function(icons, smileyStart) {
      var smileyList = '',
          isFirst = true;
      for (var smiley in icons) {
        smileyList += '<li' + (isFirst ? ' class="wawss-autocomplete-selected"' : '') + '>';
        smileyList += '<img src="' + config.additionalAttributes.src + '" draggable="' + (config.additionalAttributes.draggable ? 'true' : 'false') + '" class="' + icons[smiley]['class'] + '" alt="' + icons[smiley].alt + '"> ';
        if (smileyStart) {
          smileyList += '<strong>' + smileyStart + '</strong>' + smiley.substr(smileyStart.length);
        } else {
          smileyList += smiley;
        }
        isFirst = false;
      }
      return smileyList;
    },

    initAutocomplete: function() {
      helpers.autocomplete.classList.add('wawss-autocomplete-list');
      helpers.autocomplete.classList.add('wawss-hidden');
      var autocompleteWrapper = document.createElement('div');
      autocompleteWrapper.classList.add('wawss-autocomplete-wrapper');
      autocompleteWrapper.appendChild(helpers.autocomplete);
      document.body.appendChild(autocompleteWrapper);
    },

    isAutocompleteVisible: function() {
      return !helpers.autocomplete.classList.contains('wawss-hidden');
    },

    selectPreviousListitem: function() {
      var selected = document.querySelector('.wawss-autocomplete-selected');
      if (selected !== null) {
        selected.classList.remove('wawss-autocomplete-selected');
        if (selected === helpers.autocomplete.firstChild) {
          helpers.autocomplete.lastChild.classList.add('wawss-autocomplete-selected');
        } else {
          selected.previousElementSibling.classList.add('wawss-autocomplete-selected');
        }
      }
    },

    selectNextListitem: function() {
      var selected = document.querySelector('.wawss-autocomplete-selected');
      if (selected !== null) {
        selected.classList.remove('wawss-autocomplete-selected');
        if (selected === helpers.autocomplete.lastChild) {
          helpers.autocomplete.firstChild.classList.add('wawss-autocomplete-selected');
        } else {
          selected.nextElementSibling.classList.add('wawss-autocomplete-selected');
        }
      }
    },

    selection: window.getSelection(),
    range: null,
    autocomplete: document.createElement('ul'),

    checkSmileys: true
  };

  document.addEventListener('keydown', function(e) {
    if (helpers.isAutocompleteVisible()) {
      if (e.which === 37 || e.which === 38 || (e.which === 9 && e.shiftKey === true)) {
        e.preventDefault();
        helpers.selectPreviousListitem();
        helpers.checkSmileys = false;
      } else if (e.which === 39 || e.which === 40 || (e.which === 9 && e.shiftKey === false)) {
        e.preventDefault();
        helpers.selectNextListitem();
        helpers.checkSmileys = false;
      }
    }
  });

  document.addEventListener('keyup', function(e) {
    if (e.target.isContentEditable && helpers.selection.anchorNode.nodeType === 3 && e.which !== 9 && helpers.checkSmileys) {
      var message = helpers.selection.anchorNode.nodeValue,
          position = helpers.selection.anchorOffset,
          messagePart = message.substr(0, helpers.selection.anchorOffset - 1),
          smileyOffset = messagePart.lastIndexOf(':'),
          icons = {};

      for (var smiley in config.shortIcons) {
        if (position - smiley.length > -1 &&
          message.substr(position - smiley.length, smiley.length) === smiley) {
          helpers.replaceSmiley(helpers.selection.anchorNode, config.shortIcons[smiley], position - smiley.length, position);
          helpers.autocomplete.classList.add('wawss-hidden');
          return;
        }
      }

      if (smileyOffset > -1) {
        var smileyStart = messagePart.substr(smileyOffset) + message.substr(helpers.selection.anchorOffset - 1, 1);
        icons = helpers.filterIcons(smileyStart);
        if (icons.hasOwnProperty(smileyStart)) {
          helpers.replaceSmiley(helpers.selection.anchorNode, config.icons[smileyStart], smileyOffset, smileyOffset + smileyStart.length);
        } else {
          var listItems = helpers.buildSmileyList(icons, smileyStart);
          if (listItems.length > 0) {
            helpers.autocomplete.innerHTML = listItems;
            helpers.autocomplete.classList.remove('wawss-hidden');
            return;
          }
        }
      }
      helpers.autocomplete.classList.add('wawss-hidden');
    }
    helpers.checkSmileys = true;
  });

  helpers.loadConfig('icons');
  helpers.loadConfig('shortIcons');
  helpers.initAutocomplete();
})();
