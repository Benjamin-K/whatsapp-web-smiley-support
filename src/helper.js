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

    selection: window.getSelection(),
    range: null
  };

  document.addEventListener('keyup', function(e) {
    if (e.target.isContentEditable && helpers.selection.anchorNode.nodeType === 3) {
      var message = helpers.selection.anchorNode.nodeValue,
          position = helpers.selection.anchorOffset,
          messagePart = message.substr(0, helpers.selection.anchorOffset - 1),
          smileyOffset = messagePart.lastIndexOf(':'),
          icons = {};

      if (smileyOffset > -1) {
        var smileyStart = messagePart.substr(smileyOffset) + message.substr(helpers.selection.anchorOffset - 1, 1);
        icons = helpers.filterIcons(smileyStart);
        if (icons.hasOwnProperty(smileyStart)) {
          helpers.replaceSmiley(helpers.selection.anchorNode, config.icons[smileyStart], smileyOffset, smileyOffset + smileyStart.length);
          return;
        }
      }

      for (var smiley in config.shortIcons) {
        console.log(smiley, config.shortIcons[smiley]);
        if (position - smiley.length > -1 &&
          message.substr(position - smiley.length, smiley.length) === smiley) {
          helpers.replaceSmiley(helpers.selection.anchorNode, config.shortIcons[smiley], position - smiley.length, position);
        }
      }
    }
  });

  helpers.loadConfig('icons');
  helpers.loadConfig('shortIcons');
})();
