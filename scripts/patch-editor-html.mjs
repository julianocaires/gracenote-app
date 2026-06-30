/**
 * Patch editorHtml.js files in @10play/tentap-editor to inject
 * custom bridge support (TextAlign, FontFamily).
 *
 * Run after npm install to patch src/ and lib/commonjs/ builds.
 * The lib/module/ build is already patched via patch-package.
 */
import { readFileSync, writeFileSync } from 'fs'

const BRIDGE_SCRIPT = `(function() {
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
})();`

// Base64 encode the bridge script
function b64e(s) {
  return Buffer.from(s, 'utf-8').toString('base64')
}

const ENCODED_SCRIPT = b64e(BRIDGE_SCRIPT)

// The injection code that replaces the original export
function makeInjectionCode(exportPattern) {
  return `function b64d(s){var c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',o=0,l=0,b=0,e=0,r='';s=s.replace(/[^A-Za-z0-9+\\/=]/g,'');while(o<s.length){e=c.indexOf(s.charAt(o));b=(b<<6)+e;l+=6;while(l>=8){r+=String.fromCharCode((b>>>(l-8))&255);l-=8}o++}return r}
const __bridgeScript = b64d('${ENCODED_SCRIPT}');
const __ehInjected = __ehb.replace('</head>', '<script>'+__bridgeScript+'</script></head>');
${exportPattern}`
}

// Helper: create an ESM transform that replaces the editorHtml export
function createEsmTransform(exportStmt) {
  return (content) => {
    // IDEMPOTENCY CHECK: if all patches already applied, skip
    if (content.includes('textAlign"||') && content.includes('Lora')) {
      return content;
    }
    // Fix yA array to include __EXTRA_BRIDGES__ (idempotent: only replaces if not already patched)
    content = content.replace(/gA\];(?![\s\S]*?__EXTRA_BRIDGES__)/g, 'gA,...(window.__EXTRA_BRIDGES__||[])];')
    // CRITICAL: Patch whitelist filter to always include our bridges
    content = content.replace(
      /window\.whiteListBridgeExtensions\.includes\(([a-z])\.name\)/g,
      function(match, varName) {
        return '(window.whiteListBridgeExtensions.includes(' + varName + '.name)||' + varName + '.name===`textAlign`||' + varName + '.name===`fontFamily`)';
      }
    )
    // Inject Google Fonts <link> into the HTML head (before </head>)
    // This ensures fonts load reliably in the WebView
    if (!content.includes('googleapis.com/css2')) {
      content = content.replace('</head>', '<link rel=\\"stylesheet\\" href=\\"https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Permanent+Marker&family=Pacifico&family=Nunito:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&display=swap\\"></head>');
    }
    return content;
  }
}

const esmExport = 'export const editorHtml = __ehInjected;'

const files = [
  {
    path: 'node_modules/@10play/tentap-editor/src/simpleWebEditor/build/editorHtml.js',
    transform: createEsmTransform(esmExport),
  },
  {
    path: 'node_modules/@10play/tentap-editor/lib/module/simpleWebEditor/build/editorHtml.js',
    transform: createEsmTransform(esmExport),
  },
  {
    path: 'node_modules/@10play/tentap-editor/lib/commonjs/simpleWebEditor/build/editorHtml.js',
    transform: (content) => {
      // IDEMPOTENCY CHECK
      if (content.includes('textAlign"||')) {
        return content;
      }
      // Fix yA array (idempotent)
      content = content.replace(/gA\];(?![\s\S]*?__EXTRA_BRIDGES__)/g, 'gA,...(window.__EXTRA_BRIDGES__||[])];')
      // Patch whitelist filter (same as ESM transform)
      content = content.replace(
        /window\.whiteListBridgeExtensions\.includes\(([a-z])\.name\)/g,
        function(match, varName) {
          return '(window.whiteListBridgeExtensions.includes(' + varName + '.name)||' + varName + '.name===`textAlign`||' + varName + '.name===`fontFamily`)';
        }
      )
      return content;
    },
  }
]

// Also patch useTenTap to expose editor globally
const useTenTapFiles = [
  'node_modules/@10play/tentap-editor/src/webEditorUtils/useTenTap.tsx',
  'node_modules/@10play/tentap-editor/lib/module/webEditorUtils/useTenTap.js',
  'node_modules/@10play/tentap-editor/lib/commonjs/webEditorUtils/useTenTap.js',
];
if(false)for(const file of useTenTapFiles) {
  try {
    let content = readFileSync(file, 'utf-8');
    if (content.includes('__tentap_editor__')) {
      console.log(`✅ Already patched: ${file}`);
      continue;
    }
    // Insert after the editor is created: add window.__tentap_editor__ = editor;
    // Pattern in TSX: useEffect(() => {\n    if (!editor) return;
    // Pattern in JS: useEffect(()=>{if(!editor)return;
    content = content.replace(
      /(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*)(if\s*\(\s*!editor\s*\)\s*return)/,
      function(match, prefix, suffix) {
        return '(window.__tentap_editor__=editor||null),' + prefix + suffix;
      }
    );
    writeFileSync(file, content, 'utf-8');
    console.log(`✅ Patched useTenTap: ${file}`);
  } catch (err) {
    console.error(`❌ Error patching useTenTap ${file}:`, err.message);
  }
}

// Inject bridge script into utils.ts (gets run before WebView content loads)
const utilsFiles = [
  'node_modules/@10play/tentap-editor/src/RichText/utils.ts',
  'node_modules/@10play/tentap-editor/lib/module/RichText/utils.js',
  'node_modules/@10play/tentap-editor/lib/commonjs/RichText/utils.js',
];
for (const file of utilsFiles) {
  try {
    let content = readFileSync(file, 'utf-8');
    if (content.includes("__EXTRA_BRIDGES__") || content.includes("_fontLink")) {
      console.log(`✅ Already patched utils: ${file}`);
      continue;
    }
    // Inject bridge script (MUST be single-line, semicolons required)
    const bridgeInjection = `try{(function() {var TEXT_ALIGN_TYPES = ['heading', 'paragraph'];var TEXT_ALIGN_ALIGNMENTS = ['left', 'center', 'right'];var TextAlign = {name: 'textAlign',type: 'extension',priority: 100,config: {name: 'textAlign',type: 'extension',priority: 100,addOptions: function() {return { types: TEXT_ALIGN_TYPES, alignments: TEXT_ALIGN_ALIGNMENTS, defaultAlignment: null };},addGlobalAttributes: function() {return [{types: TEXT_ALIGN_TYPES,attributes: {textAlign: {default: null,parseHTML: function(element) {var a = element.style.textAlign || element.getAttribute('align');return TEXT_ALIGN_ALIGNMENTS.indexOf(a) >= 0 ? a : null;},renderHTML: function(attrs) {return attrs.textAlign ? { style: 'text-align: ' + attrs.textAlign } : {};},},},}];},addCommands: function() {return {setTextAlign: function(alignment) {return function(props) {return TEXT_ALIGN_TYPES.some(function(type) {return props.commands.updateAttributes(type, { textAlign: alignment });});};},unsetTextAlign: function() {return function(props) {return TEXT_ALIGN_TYPES.some(function(type) {return props.commands.resetAttributes(type, 'textAlign');});};},};},},};var FontFamily = {name: 'fontFamily',type: 'extension',priority: 101,config: {name: 'fontFamily',type: 'extension',priority: 101,addOptions: function() {return { types: ['textStyle'] };},addGlobalAttributes: function() {return [{types: ['textStyle'],attributes: {fontFamily: {default: null,parseHTML: function(element) {return element.style.fontFamily || null;},renderHTML: function(attrs) {return attrs.fontFamily ? { style: 'font-family: ' + attrs.fontFamily } : {};},},},}];},addCommands: function() {return {setFontFamily: function(fontFamily) {return function(props) {return props.chain().setMark('textStyle', { fontFamily: fontFamily }).run();};},unsetFontFamily: function() {return function(props) {return props.chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run();};},};},},};window.__EXTRA_BRIDGES__ = [{name: 'textAlign', tiptapExtension: TextAlign, tiptapExtensionDeps: [],configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []); },onBridgeMessage: function(editor, message, sendMessageBack) {try {if (!message || typeof message.type !== 'string') return false;if (message.type === 'setTextAlign') {editor.commands.setTextAlign(message.payload);return true;}if (message.type === 'unsetTextAlign') {editor.commands.unsetTextAlign();return true;}} catch(e) {}return false;},extendEditorInstance: function(sendBridgeMessage) { return { setCustomTextAlign: function(alignment) { sendBridgeMessage({ type: 'setTextAlign', payload: alignment }); } }; },extendEditorState: function(editor) {try { var a = editor.getAttributes('paragraph'); return { activeCustomTextAlign: a.textAlign || undefined }; } catch(e) { return {}; }}},{name: 'fontFamily', tiptapExtension: FontFamily, tiptapExtensionDeps: [],configureTiptapExtensionsOnRunTime: function() { return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []); },onBridgeMessage: function(editor, message, sendMessageBack) {try {if (!message || typeof message.type !== 'string') return false;if (message.type === 'setFontFamily') {editor.commands.setFontFamily(message.payload);return true;}if (message.type === 'unsetFontFamily') {editor.commands.unsetFontFamily();return true;}} catch(e) {}return false;},extendEditorInstance: function(sendBridgeMessage) { return { setCustomFontFamily: function(fontFamily) { sendBridgeMessage({ type: 'setFontFamily', payload: fontFamily }); }, unsetCustomFontFamily: function() { sendBridgeMessage({ type: 'unsetFontFamily' }); } }; },extendEditorState: function(editor) {try { var a = editor.getAttributes('textStyle'); return { activeFontFamily: a.fontFamily || undefined }; } catch(e) { return {}; }}}];})();}catch(e){window.__EXTRA_BRIDGES__=[]}`;
    content = content.replace('window.contentInjected = true', bridgeInjection + ';window.contentInjected = true');
    writeFileSync(file, content, 'utf-8');
    console.log(`✅ Patched utils: ${file}`);
  } catch (err) {
    console.error(`❌ Error patching utils ${file}:`, err.message);
  }
}

for (const file of files) {
  try {
    const content = readFileSync(file.path, 'utf-8')
    const patched = file.transform(content)
    writeFileSync(file.path, patched, 'utf-8')
    console.log(`✅ Patched: ${file.path}`)
  } catch (err) {
    console.error(`❌ Error patching ${file.path}:`, err.message)
  }
}
