// Generated by CoffeeScript 1.4.0
(function() {
  var Range, applyToShareJS, cursorToRange, rangeToCursor,
    __hasProp = {}.hasOwnProperty;

  Range = require("ace/range").Range;

  rangeToCursor = function(editorDoc, range) {
    var end, i, line, lines, offset, start, _i, _j, _len, _len1;
    lines = editorDoc.$lines;
    offset = 0;
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      line = lines[i];
      offset += i < range.start.row ? line.length : range.start.column;
      if (range.start.row === i) {
        break;
      }
    }
    start = offset + range.start.row;
    offset = 0;
    for (i = _j = 0, _len1 = lines.length; _j < _len1; i = ++_j) {
      line = lines[i];
      offset += i < range.end.row ? line.length : range.end.column;
      if (range.end.row === i) {
        break;
      }
    }
    end = offset + range.end.row;
    return [start, end];
  };

  cursorToRange = function(editorDoc, cursor) {
    var column, i, line, lines, offset, range, row, _i, _len;
    if (cursor instanceof Array) {
      cursor = cursor[1];
    }
    lines = editorDoc.$lines;
    offset = 0;
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      line = lines[i];
      if (offset + line.length < cursor) {
        offset += line.length + 1;
      } else {
        row = i;
        column = cursor - offset;
        range = new Range();
        range.cursor = {
          row: row,
          column: column
        };
        return range;
      }
    }
  };

  applyToShareJS = function(editorDoc, delta, doc) {
    var pos, text;
    pos = rangeToCursor(editorDoc, delta.range)[0];
    switch (delta.action) {
      case 'insertText':
        doc.insert(pos, delta.text);
        break;
      case 'removeText':
        doc.del(pos, delta.text.length);
        break;
      case 'insertLines':
        text = delta.lines.join('\n') + '\n';
        doc.insert(pos, text);
        break;
      case 'removeLines':
        text = delta.lines.join('\n') + '\n';
        doc.del(pos, text.length);
        break;
      default:
        throw new Error("unknown action: " + delta.action);
    }
  };

  window.sharejs.extendDoc('attach_ace', function(editor, keepEditorContents) {
    var check, cursorListener, doc, docListener, editorDoc, editorListener, offsetToPos, suppress, updateCursors;
    this.editorAttached = true;
    if (!this.provides['text']) {
      throw new Error('Only text documents can be attached to ace');
    }
    doc = this;
    editorDoc = editor.getSession().getDocument();
    editorDoc.setNewLineMode('unix');
    check = function() {
      return window.setTimeout(function() {
        var editorText, otText;
        editorText = editorDoc.getValue();
        otText = doc.getText();
        if (editorText !== otText) {
          console.error("Text does not match!");
          console.error("editor: " + editorText);
          return console.error("ot:     " + otText);
        }
      }, 0);
    };
    if (keepEditorContents) {
      doc.del(0, doc.getText().length);
      doc.insert(0, editorDoc.getValue());
    } else {
      editorDoc.setValue(doc.getText());
    }
    check();
    suppress = false;
    updateCursors = function() {
      var colors, cursor, cursorElement, cursorLayer, i, ranges, sessionId, _i, _len, _ref, _ref1, _results;
      ranges = [];
      _ref = this.cursors;
      for (sessionId in _ref) {
        if (!__hasProp.call(_ref, sessionId)) continue;
        cursor = _ref[sessionId];
        ranges.push(cursorToRange(editorDoc, cursor));
      }
      ranges.push({
        cursor: null
      });
      editor.session.$selectionMarkers = ranges;
      cursorLayer = editor.renderer.$cursorLayer;
      cursorLayer.update(editor.renderer.layerConfig);
      colors = ["Brown", "DarkCyan", "DarkGreen", "DarkRed", "DarkSeaGreen", "MediumSlateBlue"];
      _ref1 = cursorLayer.cursors.slice(1);
      _results = [];
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        cursorElement = _ref1[i];
        _results.push(cursorElement.style.borderColor = colors[i % 6]);
      }
      return _results;
    };
    this.on("cursors", updateCursors);
    editorListener = function(change) {
      if (suppress) {
        return;
      }
      applyToShareJS(editorDoc, change.data, doc);
      updateCursors.call(doc);
      return check();
    };
    cursorListener = function(change) {
      var currentSelection, selectionRange;
      currentSelection = editor.getSelectionRange();
      selectionRange = rangeToCursor(editorDoc, currentSelection);
      return doc.setCursor(selectionRange);
    };
    editorDoc.on('change', editorListener);
    editor.on("changeSelection", cursorListener);
    docListener = function(op) {
      suppress = true;
      applyToDoc(editorDoc, op);
      suppress = false;
      return check();
    };
    offsetToPos = function(offset) {
      var line, lines, row, _i, _len;
      lines = editorDoc.getAllLines();
      row = 0;
      for (row = _i = 0, _len = lines.length; _i < _len; row = ++_i) {
        line = lines[row];
        if (offset <= line.length) {
          break;
        }
        offset -= lines[row].length + 1;
      }
      return {
        row: row,
        column: offset
      };
    };
    doc.on('insert', function(pos, text) {
      suppress = true;
      editorDoc.insert(offsetToPos(pos), text);
      suppress = false;
      return check();
    });
    doc.on('delete', function(pos, text) {
      var range;
      suppress = true;
      range = Range.fromPoints(offsetToPos(pos), offsetToPos(pos + text.length));
      editorDoc.remove(range);
      suppress = false;
      return check();
    });
    doc.detach_ace = function() {
      this.editorAttached = false;
      doc.removeListener('remoteop', docListener);
      editorDoc.removeListener('change', editorListener);
      return delete doc.detach_ace;
    };
  });

}).call(this);
