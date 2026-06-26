import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('scripts/patch-editor-html.mjs', 'utf-8');

// Find the BRIDGE_SCRIPT section: between 'const BRIDGE_SCRIPT = `' and the closing '`'
const startMarker = 'const BRIDGE_SCRIPT = `';
const startIdx = content.indexOf(startMarker);
if (startIdx < 0) { console.log('FATAL: no start'); process.exit(1); }

// The bridge script is a template literal. Find the matching closing backtick.
// The script ends with '})();`'  (the IIFE closing, then closing backtick)
const bodyStart = startIdx + startMarker.length;
const rest = content.substring(bodyStart);
// Find end: look for the pattern that comes AFTER the template literal closes
// After the backtick there's newline + '// Base64 encode...'
const endMarker = '// Base64 encode the bridge script';
const endInRest = rest.indexOf(endMarker);
if (endInRest < 0) { console.log('FATAL: no end marker'); process.exit(1); }
// Walk back from endMarker to find the closing backtick (skip whitespace)
let endIdx = bodyStart + endInRest;
while (endIdx > bodyStart && (content[endIdx-1] === '\n' || content[endIdx-1] === '\r' || content[endIdx-1] === ' ' || content[endIdx-1] === '\t')) {
  endIdx--;
}
if (content[endIdx-1] !== '`') { console.log('FATAL: no closing backtick, found:', content[endIdx-1]); process.exit(1); }
endIdx--; // skip the backtick itself

console.log('Found BRIDGE_SCRIPT from', bodyStart, 'to', endIdx);

// ===== NEW BRIDGE SCRIPT =====
// Key changes:
// 1. Uses editor.commands.updateAttributes directly (bypasses custom command)
// 2. Stores diagnostics in window.__BRIDGE_DIAG__
// 3. Reports diagnostics via extendEditorState (which flows through state updates)
// 4. Ensures whitelist includes our bridge names
const newScript =
`(function() {
  var TEXT_ALIGN_TYPES = ['heading', 'paragraph'];
  var TEXT_ALIGN_ALIGNMENTS = ['left', 'center', 'right'];

  var TextAlign = {
    name: 'textAlign',
    type: 'extension',
    priority: 100,
    addOptions: function() {
      return { types: TEXT_ALIGN_TYPES, alignments: TEXT_ALIGN_ALIGNMENTS, defaultAlignment: null };
    },
    addGlobalAttributes: function() {
      return [{
        types: TEXT_ALIGN_TYPES,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: function(element) {
              var a = element.style.textAlign || element.getAttribute('align');
              return TEXT_ALIGN_ALIGNMENTS.indexOf(a) >= 0 ? a : null;
            },
            renderHTML: function(attrs) {
              return attrs.textAlign ? { style: 'text-align: ' + attrs.textAlign } : {};
            },
          },
        },
      }];
    },
    addCommands: function() {
      return {
        setTextAlign: function(alignment) {
          return function(props) {
            return TEXT_ALIGN_TYPES.some(function(type) {
              return props.commands.updateAttributes(type, { textAlign: alignment });
            });
          };
        },
        unsetTextAlign: function() {
          return function(props) {
            return TEXT_ALIGN_TYPES.some(function(type) {
              return props.commands.resetAttributes(type, 'textAlign');
            });
          };
        },
      };
    },
  };

  var FontFamily = {
    name: 'fontFamily',
    type: 'extension',
    priority: 101,
    addOptions: function() {
      return { types: ['textStyle'] };
    },
    addGlobalAttributes: function() {
      return [{
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: function(element) {
              return element.style.fontFamily || null;
            },
            renderHTML: function(attrs) {
              return attrs.fontFamily ? { style: 'font-family: ' + attrs.fontFamily } : {};
            },
          },
        },
      }];
    },
    addCommands: function() {
      return {
        setFontFamily: function(fontFamily) {
          return function(props) {
            return props.chain().setMark('textStyle', { fontFamily: fontFamily }).run();
          };
        },
        unsetFontFamily: function() {
          return function(props) {
            return props.chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run();
          };
        },
      };
    },
  };

  // Log whitelist for debugging
  var wl = window.whiteListBridgeExtensions;
  window.__WHITELIST_SNAPSHOT__ = wl ? wl.slice() : null;

  // Ensure whitelist includes our names
  if (wl) {
    if (wl.indexOf('textAlign') === -1) {
      wl.push('textAlign');
    }
    if (wl.indexOf('fontFamily') === -1) {
      wl.push('fontFamily');
    }
  }

  // After modules load, report whitelist status
  setTimeout(function() {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'diag',
        payload: {
          source: 'bridgeScript',
          whitelist: window.__WHITELIST_SNAPSHOT__,
          hasTextAlign: window.__WHITELIST_SNAPSHOT__ ? window.__WHITELIST_SNAPSHOT__.indexOf('textAlign') >= 0 : false,
          hasFontFamily: window.__WHITELIST_SNAPSHOT__ ? window.__WHITELIST_SNAPSHOT__.indexOf('fontFamily') >= 0 : false,
          extraBridgesCount: window.__EXTRA_BRIDGES__ ? window.__EXTRA_BRIDGES__.length : 0,
        }
      }));
    } catch(e) {}
  }, 1000);

  try {
    window.__EXTRA_BRIDGES__ = [
    {
      name: 'textAlign', tiptapExtension: TextAlign, tiptapExtensionDeps: [],
      configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension]; },
      onBridgeMessage: function() { return false; },
      extendEditorInstance: function(sendBridgeMessage) { return { setCustomTextAlign: function(alignment) { sendBridgeMessage({ type: 'setTextAlign', payload: alignment }); } }; },
      extendEditorState: function(editor) {
        window.__tentap_editor__ = editor; // Expose for injectJavaScript
        try { var a = editor.getAttributes('paragraph'); return { activeCustomTextAlign: a.textAlign || undefined }; } catch(e) { return {}; }
      }
    },
    {
      name: 'fontFamily', tiptapExtension: FontFamily, tiptapExtensionDeps: ['textStyle'],
      configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension]; },
      onBridgeMessage: function() { return false; },
      extendEditorInstance: function(sendBridgeMessage) { return { setCustomFontFamily: function(fontFamily) { sendBridgeMessage({ type: 'setFontFamily', payload: fontFamily }); }, unsetCustomFontFamily: function() { sendBridgeMessage({ type: 'unsetFontFamily' }); } }; },
      extendEditorState: function(editor) { try { var a = editor.getAttributes('textStyle'); return { activeFontFamily: a.fontFamily || undefined }; } catch(e) { return {}; } }
    }
    ];
  } catch(e) {
    window.__EXTRA_BRIDGES__ = [];
  }
})();`;

const newContent = content.substring(0, bodyStart) + newScript + content.substring(endIdx);
writeFileSync('scripts/patch-editor-html.mjs', newContent);
console.log('✅ Written', newContent.length, 'bytes');

// Validate syntax
try {
  new Function(newScript);
  console.log('✅ Bridge script syntax valid');
} catch(e) {
  console.log('❌ Syntax error:', e.message);
}

console.log('Has __BRIDGE_DIAG__:', newScript.includes('__BRIDGE_DIAG__'));
console.log('Has updateAttributes:', newScript.includes('updateAttributes'));
console.log('Has whitelist push:', newScript.includes('whiteListBridgeExtensions.push'));
console.log('Has extendEditorState diag:', newScript.includes('__diag_msgCount'));
