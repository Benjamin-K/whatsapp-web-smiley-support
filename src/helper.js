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

    replaceSmiley: function(node, smiley) {
      var icon = config.icons[smiley],
          img = document.createElement('img');
      img.className = icon['class'];
      img.src = config.additionalAttributes.src;
      img.alt = icon.alt;
      img.setAttribute('draggable', config.additionalAttributes.draggable);
      helpers.range = helpers.selection.getRangeAt(0);
      helpers.range.setStart(node, helpers.selection.anchorOffset - smiley.length);
      helpers.range.setEnd(node, helpers.selection.anchorOffset);
      helpers.range.deleteContents();
      helpers.range.insertNode(img);
      helpers.range.setStartAfter(img);
      helpers.range.setEndAfter(img);
      helpers.selection.removeAllRanges();
      helpers.selection.addRange(helpers.range);
    },

    selection: window.getSelection(),
    range: null
  };

  document.addEventListener('keyup', function(e) {
    if (e.target.isContentEditable && helpers.selection.anchorNode.nodeType === 3) {
      var message = helpers.selection.anchorNode.nodeValue;

      for (var string in config.icons) {
        if (helpers.selection.anchorOffset - string.length > -1 &&
            message.substr(helpers.selection.anchorOffset - string.length, helpers.selection.anchorOffset) === string) {
          helpers.replaceSmiley(helpers.selection.anchorNode, string);
          break;
        }
      }
    }
  });

  helpers.loadConfig('icons');

})();
