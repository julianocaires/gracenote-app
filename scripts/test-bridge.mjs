/**
 * Automated test: Verify that our plain-object FontFamily extension works correctly
 * in TipTap for PER-SELECTION font application.
 *
 * Run: node scripts/test-bridge.mjs
 */
import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';

// Simulate browser DOM for TipTap
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="editor"></div></body></html>');
Object.defineProperty(global, 'window', { value: dom.window, writable: true });
Object.defineProperty(global, 'document', { value: dom.window.document, writable: true });
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, writable: true });
Object.defineProperty(global, 'Node', { value: dom.window.Node, writable: true });
Object.defineProperty(global, 'Element', { value: dom.window.Element, writable: true });
Object.defineProperty(global, 'MutationObserver', { value: dom.window.MutationObserver, writable: true });

// ------------- OUR INJECTED EXTENSION (exact copy from BRIDGE_SCRIPT) -------------

// FontFamily extension — our plain-object version
const FontFamilyExt = {
  name: 'fontFamily',
  type: 'extension',
  priority: 101,
  config: {
    name: 'fontFamily',
    type: 'extension',
    priority: 101,
    addOptions() {
      return { types: ['textStyle'] };
    },
    addGlobalAttributes() {
      return [{
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML(element) {
              return element.style.fontFamily || null;
            },
            renderHTML(attrs) {
              return attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {};
            },
          },
        },
      }];
    },
    addCommands() {
      return {
        setFontFamily: (fontFamily) => (props) => {
          return props.chain().setMark('textStyle', { fontFamily }).run();
        },
        unsetFontFamily: () => (props) => {
          return props.chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run();
        },
      };
    },
  },
};

// TextAlign extension — our plain-object version (from BRIDGE_SCRIPT)
const TextAlignExt = {
  name: 'textAlign',
  type: 'extension',
  priority: 100,
  config: {
    name: 'textAlign',
    type: 'extension',
    priority: 100,
    addOptions() {
      return { types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right'], defaultAlignment: null };
    },
    addGlobalAttributes() {
      return [{
        types: ['heading', 'paragraph'],
        attributes: {
          textAlign: {
            default: null,
            parseHTML(element) {
              const a = element.style.textAlign || element.getAttribute('align');
              return ['left', 'center', 'right'].indexOf(a) >= 0 ? a : null;
            },
            renderHTML(attrs) {
              return attrs.textAlign ? { style: 'text-align: ' + attrs.textAlign } : {};
            },
          },
        },
      }];
    },
    addCommands() {
      return {
        setTextAlign: (alignment) => (props) => {
          return ['heading', 'paragraph'].some((type) => {
            return props.commands.updateAttributes(type, { textAlign: alignment });
          });
        },
        unsetTextAlign: () => (props) => {
          return ['heading', 'paragraph'].some((type) => {
            return props.commands.resetAttributes(type, 'textAlign');
          });
        },
      };
    },
  },
};

// ------------- TESTS -------------
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// Test 1: Editor initializes with our extensions
console.log('\n📋 Test 1: Editor initialization');
test('Editor creates with FontFamily and TextStyle extensions', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [
      Document,
      Paragraph,
      Text,
      TextStyle,
      FontFamilyExt,
    ],
    content: '<p>Olá mundo! Este é um teste de fonte.</p>',
  });
  assert(editor, 'Editor should be created');
  assert(editor.commands.setFontFamily, 'setFontFamily command should exist');
  assert(editor.commands.unsetFontFamily, 'unsetFontFamily command should exist');
  editor.destroy();
});

// Test 2: setFontFamily applies mark to selected range
console.log('\n📋 Test 2: Per-selection font application');
test('setFontFamily applies mark only to selected text', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Primeiro parágrafo com texto.</p><p>Segundo parágrafo.</p>',
  });

  const docSize = editor.state.doc.content.size;

  // Select only "Primeiro" (positions 0 to 8 in ProseMirror)
  // In ProseMirror, the selection is relative to the document
  // <p> starts at 0, "Primeiro" starts at 1 (after <p> tag opening... wait no)
  // Actually let me use text position directly
  editor.commands.setTextSelection({ from: 1, to: 9 }); // "Primeiro" is ~8 chars

  const result = editor.commands.setFontFamily('Caveat');
  assert(result === true, `setFontFamily should return true, got: ${result}`);

  // Check that the mark is applied at position 5 (middle of "Primeiro")
  const marksAt5 = editor.state.doc.resolve(5).marks();
  const textStyleMark = marksAt5.find(m => m.type.name === 'textStyle');
  assert(textStyleMark, 'textStyle mark should exist at selected position (5)');
  assert(textStyleMark.attrs.fontFamily === 'Caveat',
    `fontFamily should be Caveat, got: ${textStyleMark.attrs.fontFamily}`);

  // Check that the mark is NOT applied at position 25 (in "Segundo")
  const marksAt25 = editor.state.doc.resolve(25).marks();
  const textStyleMark2 = marksAt25.find(m => m.type.name === 'textStyle');
  assert(!textStyleMark2,
    'textStyle mark should NOT exist at non-selected position (25)');

  // Verify HTML output
  const html = editor.getHTML();
  assert(html.includes('font-family: Caveat'),
    `HTML should contain font-family: Caveat, got: ${html}`);
  assert(html.includes('Primeiro'),
    'HTML should contain "Primeiro"');
  assert(html.includes('Segundo'),
    'HTML should contain "Segundo"');

  editor.destroy();
});

// Test 3: unsetFontFamily removes the mark
console.log('\n📋 Test 3: Unset font');
test('unsetFontFamily removes fontFamily mark', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Texto de teste para remover fonte.</p>',
  });

  // Apply font to entire text
  editor.commands.selectAll();
  editor.commands.setFontFamily('Merriweather');

  // Verify it was applied
  let marks = editor.state.doc.resolve(5).marks();
  assert(marks.some(m => m.type.name === 'textStyle' && m.attrs.fontFamily === 'Merriweather'),
    'Merriweather should be applied');

  // Remove
  editor.commands.selectAll();
  const result = editor.commands.unsetFontFamily();
  assert(result === true, `unsetFontFamily should return true, got: ${result}`);

  // Verify it was removed
  marks = editor.state.doc.resolve(5).marks();
  const tsMark = marks.find(m => m.type.name === 'textStyle');
  assert(!tsMark || !tsMark.attrs.fontFamily,
    'fontFamily should be removed from textStyle mark');

  editor.destroy();
});

// Test 4: Different font on different selections
console.log('\n📋 Test 4: Multiple fonts on different selections');
test('Different fonts can be applied to different text ranges', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>AAA BBB CCC</p>',
  });

  // Apply Caveat to "AAA" (positions 1-4)
  editor.commands.setTextSelection({ from: 1, to: 4 });
  editor.commands.setFontFamily('Caveat');

  // Apply Merriweather to "CCC" (positions 9-12)
  editor.commands.setTextSelection({ from: 9, to: 12 });
  editor.commands.setFontFamily('Merriweather');

  // Verify "AAA" has Caveat
  const marksAAA = editor.state.doc.resolve(2).marks();
  const tsAAA = marksAAA.find(m => m.type.name === 'textStyle');
  assert(tsAAA && tsAAA.attrs.fontFamily === 'Caveat',
    `AAA should have Caveat, got: ${tsAAA?.attrs.fontFamily}`);

  // Verify "BBB" has no font (positions 5-8)
  const marksBBB = editor.state.doc.resolve(6).marks();
  const tsBBB = marksBBB.find(m => m.type.name === 'textStyle');
  assert(!tsBBB || !tsBBB.attrs.fontFamily,
    `BBB should NOT have fontFamily, got: ${tsBBB?.attrs.fontFamily}`);

  // Verify "CCC" has Merriweather
  const marksCCC = editor.state.doc.resolve(10).marks();
  const tsCCC = marksCCC.find(m => m.type.name === 'textStyle');
  assert(tsCCC && tsCCC.attrs.fontFamily === 'Merriweather',
    `CCC should have Merriweather, got: ${tsCCC?.attrs.fontFamily}`);

  editor.destroy();
});

// Test 5: Command via editor.commands (no chain/focus)
console.log('\n📋 Test 5: Command execution via editor.commands (simulating bridge)');
test('editor.commands.setFontFamily works directly', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Teste direto de comando.</p>',
  });

  // Select "direto" (positions 6-12)
  editor.commands.setTextSelection({ from: 6, to: 12 });

  // Call exactly like the bridge does
  const result = editor.commands.setFontFamily('Caveat');
  assert(result === true, `Command should return true, got: ${result}`);

  // Verify the mark was applied at the selected position
  const marks = editor.state.doc.resolve(8).marks();
  const tsMark = marks.find(m => m.type.name === 'textStyle');
  assert(tsMark, 'textStyle mark should exist');
  assert(tsMark.attrs.fontFamily === 'Caveat',
    `fontFamily should be Caveat, got: ${tsMark?.attrs.fontFamily}`);

  // Verify position OUTSIDE selection does NOT have the mark
  const marksOut = editor.state.doc.resolve(2).marks();
  assert(!marksOut.some(m => m.type.name === 'textStyle' && m.attrs.fontFamily),
    'Text outside selection should NOT have fontFamily');

  editor.destroy();
});

// Test 6: Verify the command does NOT affect all content
console.log('\n📋 Test 6: Command does NOT affect all content');
test('setFontFamily on selection does not change other content', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Texto antes SELECAO texto depois</p>',
  });

  // Select only "SELECAO"
  // In ProseMirror, the paragraph starts at position 1 (after <p> open)
  // "Texto antes " = 12 chars → "SELECAO" starts at 13
  editor.commands.setTextSelection({ from: 13, to: 20 });
  editor.commands.setFontFamily('Inter');

  const html = editor.getHTML();

  // The HTML should have the font-family span ONLY around "SELECAO"
  // Count occurrences of 'font-family: Inter'
  const matches = html.match(/font-family:\s*Inter/g);
  const count = matches ? matches.length : 0;
  assert(count >= 1 && count <= 3,
    `Should have 1-3 font-family occurrences (not entire doc), got: ${count}. HTML: ${html}`);

  assert(html.includes('font-family: Inter'),
    `HTML should contain font-family: Inter. Got: ${html}`);

  editor.destroy();
});

// Test 7: Empty selection adds to stored marks (cursor position, not all content)
console.log('\n📋 Test 7: Empty selection behavior');
test('setFontFamily on cursor adds to storedMarks, not all content', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Texto existente.</p>',
  });

  // Place cursor at position 5 (no selection)
  editor.commands.setTextSelection(5);
  assert(editor.state.selection.empty === true,
    'Selection should be empty (cursor)');

  // Apply font
  editor.commands.setFontFamily('Caveat');

  // Existing text should NOT have the mark
  const marks = editor.state.doc.resolve(2).marks();
  assert(!marks.some(m => m.type.name === 'textStyle' && m.attrs.fontFamily),
    'Existing text should NOT have fontFamily when applied to cursor');

  // Stored marks should contain the font
  const storedMarks = editor.state.storedMarks;
  assert(storedMarks && storedMarks.some(m => m.type.name === 'textStyle' && m.attrs.fontFamily === 'Caveat'),
    `Stored marks should include Caveat, got: ${JSON.stringify(storedMarks?.map(m => ({ type: m.type.name, attrs: m.attrs })))}`);

  editor.destroy();
});

// Test 8: Verify the renderHTML produces correct inline style
console.log('\n📋 Test 8: HTML rendering');
test('getHTML produces valid font-family inline styles', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Font test</p>',
  });

  editor.commands.selectAll();
  editor.commands.setFontFamily('Merriweather');

  const html = editor.getHTML();
  assert(html.includes('font-family: Merriweather'),
    `HTML should contain font-family: Merriweather. Got: ${html}`);
  assert(html.startsWith('<p>'),
    `HTML should start with <p>. Got: ${html}`);

  editor.destroy();
});

// ==================== ALIGNMENT TESTS ====================

// Test A1: Alignment extension registration
console.log('\n📋 Test A1: Alignment extension registration');
test('Editor creates with TextAlign extension', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextAlignExt],
    content: '<p>Test alignment</p>',
  });
  assert(editor.commands.setTextAlign, 'setTextAlign command should exist');
  assert(editor.commands.unsetTextAlign, 'unsetTextAlign command should exist');
  editor.destroy();
});

// Test A2: setTextAlign applies center to paragraph
console.log('\n📋 Test A2: TextAlign applies to paragraph');
test('setTextAlign center works and getHTML produces inline style', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextAlignExt],
    content: '<p>Centered text</p>',
  });
  editor.commands.setTextAlign('center');
  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('text-align') || html.includes('text-align: center'),
    `HTML should contain text-align style. Got: ${html}`);
  // Check state
  const attrs = editor.getAttributes('paragraph');
  assert(attrs.textAlign === 'center',
    `Paragraph should have textAlign=center, got: ${JSON.stringify(attrs)}`);
  editor.destroy();
});

// Test A3: Different alignments
console.log('\n📋 Test A3: Different alignments on different paragraphs');
test('Left, center, right on separate paragraphs', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextAlignExt],
    content: '<p>Para 1</p><p>Para 2</p><p>Para 3</p>',
  });
  // Align para 1 left
  editor.commands.setTextSelection({ from: 1, to: 7 });
  editor.commands.setTextAlign('left');
  // Align para 2 center
  editor.commands.setTextSelection({ from: 8, to: 14 });
  editor.commands.setTextAlign('center');
  // Align para 3 right
  editor.commands.setTextSelection({ from: 15, to: 21 });
  editor.commands.setTextAlign('right');

  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('text-align: left') || html.includes('text-align:left'),
    `HTML should contain left alignment. Got: ${html}`);
  assert(html.includes('text-align: center') || html.includes('text-align:center'),
    `HTML should contain center alignment. Got: ${html}`);
  assert(html.includes('text-align: right') || html.includes('text-align:right'),
    `HTML should contain right alignment. Got: ${html}`);
  editor.destroy();
});

// Test A4: getHTML with alignment AND font together
console.log('\n📋 Test A4: Alignment and font together');
test('Combined alignment and font-family in HTML', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextAlignExt, TextStyle, FontFamilyExt],
    content: '<p>Styled text</p>',
  });
  editor.commands.selectAll();
  editor.commands.setTextAlign('center');
  editor.commands.setFontFamily('Merriweather');
  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('text-align'),
    `HTML should contain text-align. Got: ${html}`);
  assert(html.includes('font-family'),
    `HTML should contain font-family. Got: ${html}`);
  editor.destroy();
});

// ==================== USE TEN TAP EXACT FLOW SIMULATION ====================

// Test C1: Replicate useTenTap extension-building logic
console.log('\n📋 Test C1: useTenTap extension building flow');
test('useTenTap bridge processing works for fontFamily + textAlign', () => {
  // Step 1: Build bridges array (like tenTapExtensions = TenTapStartKit + __EXTRA_BRIDGES__)
  // Simulate: our injected bridges are in the array
  const bridges = [
    {
      name: 'textAlign',
      configureTiptapExtensionsOnRunTime: function() {
        return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []);
      },
      tiptapExtension: TextAlignExt,
      tiptapExtensionDeps: [],
      onBridgeMessage: function(editor, message, sendMessageBack) {
        if (message.type === 'setTextAlign') {
          editor.commands.setTextAlign(message.payload);
          return true;
        }
        return false;
      },
    },
    {
      name: 'fontFamily',
      configureTiptapExtensionsOnRunTime: function() {
        return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []);
      },
      tiptapExtension: FontFamilyExt,
      tiptapExtensionDeps: [],
      onBridgeMessage: function(editor, message, sendMessageBack) {
        if (message.type === 'setFontFamily') {
          editor.commands.setFontFamily(message.payload);
          return true;
        }
        return false;
      },
    },
  ];

  // Step 2: Build bridgeExtensionConfigMap (like native side serialization)
  const bridgeExtensionConfigMap = {
    textAlign: { optionsConfig: undefined, extendConfig: undefined },
    fontFamily: { optionsConfig: undefined, extendConfig: undefined },
  };

  // Step 3: Process bridges exactly like useTenTap does
  const extensions = bridges
    .map((e) => {
      const extensionConfig = bridgeExtensionConfigMap[e.name];
      if (!extensionConfig) return null;
      const { optionsConfig, extendConfig } = extensionConfig;
      return e.configureTiptapExtensionsOnRunTime(optionsConfig, extendConfig);
    })
    .filter((object) => object !== null && object !== undefined)
    .flat();

  console.log('   Extensions built:', extensions.map(e => e.name || (e.config && e.config.name)).join(', '));

  // Step 4: Create editor with these extensions (like useEditor)
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [
      Document,
      Paragraph,
      Text,
      TextStyle, // This would come from ColorBridge's configureTiptapExtensionsOnRunTime
      ...extensions,
    ],
    content: '<p>Full useTenTap simulation test</p>',
  });

  // Check commands exist
  assert(editor.commands.setTextAlign, 'setTextAlign command should exist after useTenTap flow');
  assert(editor.commands.setFontFamily, 'setFontFamily command should exist after useTenTap flow');

  // Test alignment
  editor.commands.selectAll();
  editor.commands.setTextAlign('center');
  let html = editor.getHTML();
  console.log('   Alignment HTML:', html);
  assert(html.includes('text-align'),
    `Alignment HTML should contain text-align. Got: ${html}`);

  // Test font per-selection
  editor.commands.setTextSelection({ from: 1, to: 5 });
  const cmdResult = editor.commands.setFontFamily('Merriweather');
  assert(cmdResult === true, `setFontFamily should return true, got: ${cmdResult}`);

  // Verify mark at selection
  const marks = editor.state.doc.resolve(3).marks();
  const tsMark = marks.find(m => m.type.name === 'textStyle');
  assert(tsMark && tsMark.attrs.fontFamily === 'Merriweather',
    `fontFamily should be Merriweather at selected position, got: ${tsMark?.attrs.fontFamily}`);

  html = editor.getHTML();
  console.log('   Font HTML:', html);
  assert(html.includes('font-family'),
    `Font HTML should contain font-family. Got: ${html}`);

  editor.destroy();
});

// Test C2: Bridge message handling via onBridgeMessage
console.log('\n📋 Test C2: Bridge message handler flow');
test('onBridgeMessage handlers are called and execute commands', () => {
  // Build the same setup as C1
  const bridge = {
    name: 'fontFamily',
    configureTiptapExtensionsOnRunTime: function() {
      return [this.tiptapExtension].concat(this.tiptapExtensionDeps || []);
    },
    tiptapExtension: FontFamilyExt,
    tiptapExtensionDeps: [],
    onBridgeMessage: function(editor, message, sendMessageBack) {
      if (message.type === 'setFontFamily') {
        editor.commands.setFontFamily(message.payload);
        return true;
      }
      return false;
    },
  };

  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, ...bridge.configureTiptapExtensionsOnRunTime()],
    content: '<p>Message handler test</p>',
  });

  // Simulate message from native side
  const message = { type: 'setFontFamily', payload: 'Caveat' };
  editor.commands.setTextSelection({ from: 1, to: 8 }); // "Message"

  let handled = false;
  const dummySendBack = () => {};
  // Call exactly like useTenTap does
  handled = bridge.onBridgeMessage(editor, message, dummySendBack);

  assert(handled === true, `onBridgeMessage should return true, got: ${handled}`);

  const marks = editor.state.doc.resolve(5).marks();
  const tsMark = marks.find(m => m.type.name === 'textStyle');
  assert(tsMark, 'textStyle mark should exist after bridge message');
  assert(tsMark.attrs.fontFamily === 'Caveat',
    `fontFamily should be Caveat after bridge message, got: ${tsMark?.attrs.fontFamily}`);

  const html = editor.getHTML();
  console.log('   HTML:', html);
  assert(html.includes('font-family: Caveat'),
    `HTML should contain font-family: Caveat. Got: ${html}`);

  editor.destroy();
});

// ==================== BRIDGE MESSAGE SIMULATION ====================

// Test B1: Simulate onBridgeMessage for fontFamily
console.log('\n📋 Test B1: Bridge message simulation');
test('onBridgeMessage style handler works', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, FontFamilyExt],
    content: '<p>Bridge test text here</p>',
  });

  // Simulate what the bridge does: select text, receive message, call command
  editor.commands.setTextSelection({ from: 1, to: 6 }); // "Bridge"
  const sel = editor.state.selection;
  assert(!sel.empty, 'Selection should not be empty');
  assert(sel.from === 1 && sel.to === 6, `Expected [1,6], got [${sel.from},${sel.to}]`);

  // This is exactly what onBridgeMessage does
  const result = editor.commands.setFontFamily('Caveat');
  assert(result === true, `Command should return true, got: ${result}`);

  // Verify mark applied at selection
  const marks = editor.state.doc.resolve(3).marks();
  const tsMark = marks.find(m => m.type.name === 'textStyle');
  assert(tsMark, 'textStyle mark should exist at selected position');
  assert(tsMark.attrs.fontFamily === 'Caveat',
    `fontFamily should be Caveat, got: ${tsMark?.attrs.fontFamily}`);

  // Verify mark NOT applied outside selection
  const marksOut = editor.state.doc.resolve(10).marks();
  assert(!marksOut.some(m => m.type.name === 'textStyle' && m.attrs.fontFamily),
    'fontFamily should NOT exist outside selection');

  // Verify getHTML
  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('font-family: Caveat'),
    `HTML should contain font-family: Caveat. Got: ${html}`);

  editor.destroy();
});

// Test B2: Simulate onBridgeMessage for textAlign
console.log('\n📋 Test B2: Alignment bridge message simulation');
test('onBridgeMessage for setTextAlign works', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextAlignExt],
    content: '<p>Align me please</p>',
  });

  // Exactly what the injected bridge's onBridgeMessage does
  editor.commands.setTextAlign('right');

  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('text-align: right') || html.includes('text-align:right'),
    `HTML should contain text-align: right. Got: ${html}`);
  editor.destroy();
});

// Test B3: Both bridges together (realistic scenario)
console.log('\n📋 Test B3: Both bridges together');
test('TextAlign and FontFamily bridges coexist and work', () => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    extensions: [Document, Paragraph, Text, TextStyle, TextAlignExt, FontFamilyExt],
    content: '<p>Full test paragraph</p>',
  });

  // Apply alignment
  editor.commands.selectAll();
  editor.commands.setTextAlign('center');

  // Apply font to selection
  editor.commands.setTextSelection({ from: 1, to: 5 });
  editor.commands.setFontFamily('Inter');

  const html = editor.getHTML();
  console.log('   HTML output:', html);
  assert(html.includes('text-align'),
    `HTML should contain text-align. Got: ${html}`);
  assert(html.includes('font-family'),
    `HTML should contain font-family. Got: ${html}`);

  editor.destroy();
});

// ------------- SUMMARY -------------
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All tests passed! The extension works correctly in TipTap.');
}
