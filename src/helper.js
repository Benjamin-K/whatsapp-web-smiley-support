/**
 * @author : Benjamin Klix
 */
(function(){

  var config = {
    icons: {},
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

    replaceSmiley: function(node, smiley, start) {
      var icon = config.icons[smiley],
          img = document.createElement('img');
      img.className = icon['class'];
      img.src = config.additionalAttributes.src;
      img.alt = icon.alt;
      img.setAttribute('draggable', config.additionalAttributes.draggable);
      helpers.range = helpers.selection.getRangeAt(0);
      helpers.range.setStart(node, start);
      helpers.range.setEnd(node, start + smiley.length);
      helpers.range.deleteContents();
      helpers.range.insertNode(img);
      helpers.range.setStartAfter(img);
      helpers.range.setEndAfter(img);
      helpers.selection.removeAllRanges();
      helpers.selection.addRange(helpers.range);
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
        console.log(icons, icons.length, icons[smileyStart]);
        if (icons.hasOwnProperty(smileyStart)) {
          helpers.replaceSmiley(helpers.selection.anchorNode, smileyStart, smileyOffset);
          return;
        }
      }
    }
  });

  helpers.loadConfig('icons');

})();
