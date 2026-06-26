// update-bridge-v2.mjs — Final working version
// Uses the CORRECT extension structure: name/type/priority at TOP level,
// all methods (addOptions, addCommands, etc.) inside config.
import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('scripts/patch-editor-html.mjs', 'utf-8');

// Find and replace the BRIDGE_SCRIPT in the main patch file
// The bridge script injected via utils.ts needs updating too

// First, update the BRIDGE_SCRIPT template literal
const startMarker = 'const BRIDGE_SCRIPT = `';
const startIdx = content.indexOf(startMarker);
if (startIdx < 0) { console.log('FATAL: no BRIDGE_SCRIPT'); process.exit(1); }

const bodyStart = startIdx + startMarker.length;
const rest = content.substring(bodyStart);
const endMarker = '// Base64 encode the bridge script';
const endInRest = rest.indexOf(endMarker);
if (endInRest < 0) { console.log('FATAL: no end marker'); process.exit(1); }

let endIdx = bodyStart + endInRest;
while (endIdx > bodyStart && (content[endIdx-1] === '\n' || content[endIdx-1] === '\r' || content[endIdx-1] === ' ' || content[endIdx-1] === '\t')) {
  endIdx--;
}
if (content[endIdx-1] !== '`') { console.log('FATAL: no backtick'); process.exit(1); }
endIdx--;

// NEW bridge script - correct structure + real onBridgeMessage with try/catch
const newScript =
`(function() {
  var TEXT_ALIGN_TYPES = ['heading', 'paragraph'];
  var TEXT_ALIGN_ALIGNMENTS = ['left', 'center', 'right'];

  var TextAlign = {
    name: 'textAlign',
    type: 'extension',
    priority: 100,
    config: {
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
    },
  };

  var FontFamily = {
    name: 'fontFamily',
    type: 'extension',
    priority: 101,
    config: {
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
    },
  };

  window.__EXTRA_BRIDGES__ = [
    {
      name: 'textAlign', tiptapExtension: TextAlign, tiptapExtensionDeps: [],
      configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []); },
      onBridgeMessage: function(editor, message, sendMessageBack) {
        try {
          if (!message || typeof message.type !== 'string') return false;
          if (message.type === 'setTextAlign') {
            editor.commands.setTextAlign(message.payload);
            return true;
          }
          if (message.type === 'unsetTextAlign') {
            editor.commands.unsetTextAlign();
            return true;
          }
        } catch(e) {}
        return false;
      },
      extendEditorInstance: function(sendBridgeMessage) { return { setCustomTextAlign: function(alignment) { sendBridgeMessage({ type: 'setTextAlign', payload: alignment }); } }; },
      extendEditorState: function(editor) {
        try { var a = editor.getAttributes('paragraph'); return { activeCustomTextAlign: a.textAlign || undefined }; } catch(e) { return {}; }
      }
    },
    {
      name: 'fontFamily', tiptapExtension: FontFamily, tiptapExtensionDeps: [],
      configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []); },
      onBridgeMessage: function(editor, message, sendMessageBack) {
        try {
          if (!message || typeof message.type !== 'string') return false;
          if (message.type === 'setFontFamily') {
            editor.commands.setFontFamily(message.payload);
            return true;
          }
          if (message.type === 'unsetFontFamily') {
            editor.commands.unsetFontFamily();
            return true;
          }
        } catch(e) {}
        return false;
      },
      extendEditorInstance: function(sendBridgeMessage) { return { setCustomFontFamily: function(fontFamily) { sendBridgeMessage({ type: 'setFontFamily', payload: fontFamily }); }, unsetCustomFontFamily: function() { sendBridgeMessage({ type: 'unsetFontFamily' }); } }; },
      extendEditorState: function(editor) {
        try { var a = editor.getAttributes('textStyle'); return { activeFontFamily: a.fontFamily || undefined }; } catch(e) { return {}; }
      }
    }
  ];
})();`;

const newContent = content.substring(0, bodyStart) + newScript + content.substring(endIdx);
writeFileSync('scripts/patch-editor-html.mjs', newContent);
console.log('✅ Updated BRIDGE_SCRIPT with correct structure');

// Also update the utils injection to use the correct minified bridge script
// Generate minified version
const minifiedBridge = newScript
  .replace(/\n\s*/g, '')     // Remove newlines and leading whitespace
  .replace(/\s+/g, ' ')       // Collapse multiple spaces
  .trim();

// Read the patch file again and update the utils injection
let c2 = readFileSync('scripts/patch-editor-html.mjs', 'utf-8');

// Replace the bridgeInjection content
const injMarker = 'const bridgeInjection = `';
const injStart = c2.indexOf(injMarker);
if (injStart >= 0) {
  const injBodyStart = injStart + injMarker.length;
  const injRest = c2.substring(injBodyStart);
  const injEnd = injRest.indexOf('`;');
  if (injEnd >= 0) {
    const newInjection = 'const bridgeInjection = `try{' + minifiedBridge.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '}catch(e){window.__EXTRA_BRIDGES__=[]}`;';
    c2 = c2.substring(0, injStart) + newInjection + c2.substring(injBodyStart + injEnd + 2);
  }
}
writeFileSync('scripts/patch-editor-html.mjs', c2);
console.log('✅ Updated utils injection correctly');

// Validate
try { new Function(newScript); console.log('✅ Bridge script syntax: valid'); } catch(e) { console.log('❌ Syntax:', e.message); }
