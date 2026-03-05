import { Layout, Menu } from '@arco-design/web-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './header';
import { useContext, useEffect, useState } from 'react';
import { LanguageContext, LanguageEnum } from './i18n';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { transform as bubleTransform } from 'buble';

import 'highlight.js/styles/atom-one-light.css';

const markdownParser = MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

let globalContainerId = 0;

interface IMenuItem {
  path: string;
  fullPath: string;
  title: { [language: string]: string };
  children?: IMenuItem[];
}

interface IOutlineProps {
  menuItems: IMenuItem[];
  assetDirectory: string;
}

interface IContentProps {
  content: string;
}

interface IRunningItem {
  code: string;
  id: string;
  template: string;
}

function normalizeVirtualPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.?\//, '');
}

function stripTypeAnnotations(sourceCode: string): string {
  let code = sourceCode;
  code = code.replace(/useState\s*<[^>\n]+>\s*\(/g, 'useState(');
  code = code.replace(
    /(\(\s*\{[\s\S]*?\}\s*)\:\s*\{[\s\S]*?\}(\s*\))/g,
    '$1$2'
  );
  const stripParamListTypes = (paramsText: string) => {
    let params = paramsText;
    params = params.replace(
      /([A-Za-z0-9_$]+)\s*:\s*([^,\)=\n]+)(\s*=\s*[^,)]*)?/g,
      '$1$3'
    );
    params = params.replace(
      /(\.\.\.\s*[A-Za-z0-9_$]+)\s*:\s*([^,\)=\n]+)(\s*=\s*[^,)]*)?/g,
      '$1$3'
    );
    return params;
  };
  code = code.replace(/(\([^()\n]*\))(\s*=>)/g, (_, params, arrow) => {
    return `${stripParamListTypes(params)}${arrow}`;
  });
  code = code.replace(
    /(function\s+[A-Za-z0-9_$]+\s*)(\([^()\n]*\))/g,
    (_, prefix, params) => `${prefix}${stripParamListTypes(params)}`
  );
  code = code.replace(
    /([A-Za-z0-9_$]+\s*)(\([^()\n]*\))(\s*\{)/g,
    (_, name, params, tail) => `${name}${stripParamListTypes(params)}${tail}`
  );
  code = code.replace(/\s+as\s+[A-Za-z0-9_<>\[\]\|\s,\.]+(?=[,;\)\n])/g, '');
  code = code.replace(
    /(\b(?:const|let|var)\s+[A-Za-z0-9_$]+)\s*:\s*([^=;]+)(?==)/g,
    '$1'
  );
  code = code.replace(
    /([A-Za-z0-9_$.[\]'"`()]+)\s*\?\?\s*([^,\n;]+)/g,
    '((($1) != null) ? ($1) : ($2))'
  );
  code = code.replace(
    /([A-Za-z0-9_$.]+)\?\.\s*([A-Za-z0-9_$]+)\s*\(/g,
    '$1 && $1.$2('
  );
  code = code.replace(/\)\s*:\s*([^=\{\n]+)(\s*(?:=>|\{))/g, ')$2');
  return code;
}

function rewriteImports(code: string): string {
  let importIndex = 0;
  const withImports = code.replace(
    /^\s*import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm,
    (_matched, importClause: string, source: string) => {
      const moduleVar = `__mod_${importIndex++}`;
      const lines: string[] = [`const ${moduleVar} = __require('${source}');`];
      const clause = importClause.trim();
      if (clause.startsWith('{')) {
        lines.push(`const ${clause} = ${moduleVar};`);
        return lines.join('\n');
      }
      if (clause.startsWith('* as ')) {
        const namespaceVar = clause.replace('* as', '').trim();
        lines.push(`const ${namespaceVar} = ${moduleVar};`);
        return lines.join('\n');
      }
      if (clause.includes(',')) {
        const splitIndex = clause.indexOf(',');
        const defaultImport = clause.slice(0, splitIndex).trim();
        const namedImport = clause.slice(splitIndex + 1).trim();
        lines.push(
          `const ${defaultImport} = typeof ${moduleVar}.default !== 'undefined' ? ${moduleVar}.default : ${moduleVar};`
        );
        if (namedImport.startsWith('{')) {
          lines.push(`const ${namedImport} = ${moduleVar};`);
        } else if (namedImport.startsWith('* as ')) {
          const namespaceVar = namedImport.replace('* as', '').trim();
          lines.push(`const ${namespaceVar} = ${moduleVar};`);
        }
        return lines.join('\n');
      }
      lines.push(
        `const ${clause} = typeof ${moduleVar}.default !== 'undefined' ? ${moduleVar}.default : ${moduleVar};`
      );
      return lines.join('\n');
    }
  );
  return withImports.replace(/^\s*import\s+['"]([^'"]+)['"]\s*;?\s*$/gm, "__require('$1');");
}

function rewriteExports(code: string): string {
  const namedExports: string[] = [];
  const exportEntries: Array<{ local: string; exported: string }> = [];
  let transformed = code.replace(
    /^\s*export\s+default\s+/gm,
    'module.exports.default = '
  );
  transformed = transformed.replace(
    /^\s*export\s+(const|let|var|function|class)\s+([A-Za-z0-9_$]+)/gm,
    (_, declarationType: string, name: string) => {
      namedExports.push(name);
      return `${declarationType} ${name}`;
    }
  );
  transformed = transformed.replace(
    /^\s*export\s*\{\s*([^}]+)\s*\}\s*;?\s*$/gm,
    (_, exportsText: string) => {
      exportsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
          if (item.includes(' as ')) {
            const [local, exported] = item.split(/\s+as\s+/);
            exportEntries.push({ local: local.trim(), exported: exported.trim() });
          } else {
            exportEntries.push({ local: item, exported: item });
          }
        });
      return '';
    }
  );
  const appendedExports: string[] = [];
  Array.from(new Set(namedExports)).forEach((name) => {
    appendedExports.push(`exports.${name} = ${name};`);
  });
  exportEntries.forEach((entry) => {
    appendedExports.push(`exports.${entry.exported} = ${entry.local};`);
  });
  if (appendedExports.length) {
    transformed += `\n${appendedExports.join('\n')}\n`;
  }
  return transformed;
}

function parseMultiFileBody(body: string): { entry: string; files: Record<string, string> } | null {
  const fileRegex = /^>>>\s+([^\n\r]+)\r?\n/gm;
  const matches = Array.from(body.matchAll(fileRegex));
  if (!matches.length) {
    return null;
  }
  const files: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const filePath = normalizeVirtualPath((current[1] || '').trim());
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? body.length;
    const content = body.slice(start, end).replace(/\s+$/, '');
    if (filePath) {
      files[filePath] = content;
    }
  }
  const firstFile = Object.keys(files)[0];
  if (!firstFile) {
    return null;
  }
  const entry = files['app.tsx'] !== undefined ? 'app.tsx' : firstFile;
  return { entry, files };
}

function buildMultiFileBundle(entry: string, files: Record<string, string>): string {
  const transformedModules: Record<string, string> = {};
  Object.keys(files).forEach(filePath => {
    const originalCode = files[filePath] ?? '';
    const strippedCode = stripTypeAnnotations(originalCode);
    const cjsCode = rewriteExports(rewriteImports(strippedCode));
    try {
      transformedModules[filePath] =
        bubleTransform(cjsCode, {
          transforms: {
            templateString: false,
            classes: false,
          },
          jsx: 'React.createElement'
        }).code ?? cjsCode;
    } catch (error) {
      console.error(`[vgraph docs] transform fail in ${filePath}:`, error);
      transformedModules[filePath] = cjsCode;
    }
  });
  const serializedModuleTexts = JSON.stringify(transformedModules);
  return `
const __VG_MODULE_TEXTS__ = ${serializedModuleTexts};
const __VG_MODULES__ = {};
Object.keys(__VG_MODULE_TEXTS__).forEach((modulePath) => {
  __VG_MODULES__[modulePath] = new Function(
    'module',
    'exports',
    '__require',
    __VG_MODULE_TEXTS__[modulePath]
  );
});
const __VG_CACHE__ = {};
const __VG_EXTERNALS__ = {
  react: "window.React",
  "react-dom": "window.ReactDOM || window.ReactDom",
  "react-dom/client": "window.ReactDOM || window.ReactDom",
  "@visactor/vgraph": "window.VGraph",
  "@visactor/react-vgraph": "window.ReactVGraph",
  "@visactor/react-vgraph-ui": "window.ReactVGraphUI",
  "@arco-design/web-react": "window.ArcoDesign",
  "@arco-design/web-react/icon": "window.ArcoDesignIcon"
};
const __VG_NORMALIZE__ = function(path){
  return (path || '').replace(/\\\\/g, '/').replace(/^\\.\\//, '');
};
const __VG_DIRNAME__ = function(path){
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(0, idx) : '';
};
const __VG_PICK_FILE__ = function(path){
  if (__VG_MODULES__[path]) return path;
  if (__VG_MODULES__[path + ".ts"]) return path + ".ts";
  if (__VG_MODULES__[path + ".tsx"]) return path + ".tsx";
  if (__VG_MODULES__[path + ".js"]) return path + ".js";
  if (__VG_MODULES__[path + ".jsx"]) return path + ".jsx";
  if (__VG_MODULES__[path + "/index.ts"]) return path + "/index.ts";
  if (__VG_MODULES__[path + "/index.tsx"]) return path + "/index.tsx";
  if (__VG_MODULES__[path + "/index.js"]) return path + "/index.js";
  if (__VG_MODULES__[path + "/index.jsx"]) return path + "/index.jsx";
  return path;
};
const __VG_RESOLVE__ = function(from, request){
  if (!request) return "";
  if (request[0] !== '.') return __VG_NORMALIZE__(request);
  const fromDir = __VG_DIRNAME__(from);
  const segments = (fromDir + '/' + request).split('/');
  const resolved = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (resolved.length) resolved.pop();
      continue;
    }
    resolved.push(seg);
  }
  return resolved.join('/');
};
const __VG_REQUIRE__ = function(from, request){
  if (!request) return {};
  const tryInternal = function(){
    const normalizedRequest = __VG_NORMALIZE__(request);
    if (__VG_MODULES__[normalizedRequest]) return normalizedRequest;
    const pickedRequest = __VG_PICK_FILE__(normalizedRequest);
    if (__VG_MODULES__[pickedRequest]) return pickedRequest;
    return "";
  };
  if (request[0] !== '.') {
    const internalResolved = tryInternal();
    if (internalResolved) {
      if (__VG_CACHE__[internalResolved]) return __VG_CACHE__[internalResolved].exports;
      const internalFactory = __VG_MODULES__[internalResolved];
      const internalModule = { exports: {} };
      __VG_CACHE__[internalResolved] = internalModule;
      internalFactory(internalModule, internalModule.exports, function(req){ return __VG_REQUIRE__(internalResolved, req); });
      return internalModule.exports;
    }
    if (/\\.(css|less|scss)$/.test(request)) return {};
    const externalExpr = __VG_EXTERNALS__[request];
    if (externalExpr) return (0, eval)(externalExpr);
    throw new Error('[vgraph docs] unsupported external module: ' + request);
  }
  const resolved = __VG_PICK_FILE__(__VG_RESOLVE__(from, request));
  if (__VG_CACHE__[resolved]) return __VG_CACHE__[resolved].exports;
  const factory = __VG_MODULES__[resolved];
  if (!factory) throw new Error('[vgraph docs] cannot resolve module: ' + request + ' from ' + from);
  const module = { exports: {} };
  __VG_CACHE__[resolved] = module;
  factory(module, module.exports, function(req){ return __VG_REQUIRE__(resolved, req); });
  return module.exports;
};
__VG_REQUIRE__("", "${entry}");
`;
}

function preprocessLivedemoFiles(markdownText: string): string {
  return markdownText.replace(
    /```livedemo-files(?:\s+template=([a-zA-Z0-9-]+))?\s*\n([\s\S]*?)```/g,
    (_matched, template: string | undefined, body: string) => {
      const parsed = parseMultiFileBody(body);
      if (!parsed) {
        return _matched;
      }
      const bundle = buildMultiFileBundle(parsed.entry, parsed.files);
      const target = template ? `livedemo-${template}` : 'livedemo';
      return `\`\`\`${target}\n${bundle}\n\`\`\``;
    }
  );
}

function htmlRestore(str: string) {
  let result = '';
  result = str.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&nbsp;/g, ' ');
  result = result.replace(/&#39;/g, "'");
  result = result.replace(/&quot;/g, '"');
  return result;
}

function transformCode(str: string) {
  let transformedCode = str;
  try {
    transformedCode =
      bubleTransform(transformedCode, {
        transforms: {
          templateString: false,
          classes: false,
        }
      }).code ?? '';
  } catch (e) {
    transformedCode = str;
  }
  return transformedCode;
}

function generateMenuItem(node: IMenuItem, assetDirectory: string, language: LanguageEnum, navigate: any) {
  return node.children ? (
    <SubMenu key={node.fullPath} title={<>{node.title[language] ?? node.title.zh ?? node.path}</>}>
      <div style={{ marginLeft: 10 }}>
        {node.children.map((subNode: IMenuItem) => generateMenuItem(subNode, assetDirectory, language, navigate))}
      </div>
    </SubMenu>
  ) : (
    <MenuItem
      key={node.fullPath}
      onClick={() => {
        document.getElementById('markdownDocumentContainer')?.scrollTo?.({
          top: 0
        });
        navigate(`/vgraph/${assetDirectory}${node.fullPath}`, { replace: true });
      }}
    >
      {node.title[language] ?? node.title.zh ?? node.path}
    </MenuItem>
  );
}

function Outline(props: IOutlineProps) {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname: pathName } = location;
  const fullPath = '/' + pathName.split('/').slice(2).join('/');

  return (
    <div
      className="menu-demo-round"
      style={{
        paddingTop: 20,
        paddingBottom: 20
      }}
    >
      <Menu selectedKeys={[fullPath]} autoOpen>
        {(props.menuItems ?? []).map((node: IMenuItem) => generateMenuItem(node, props.assetDirectory, language, navigate))}
      </Menu>
    </div>
  );
}

function Content(props: IContentProps) {
  const demos = [...props.content.matchAll(/<pre><code class=\"language-livedemo(?:-([a-zA-Z0-9-]+))?\">((.|\n)*?)<\/code><\/pre>/g)];
  let content = props.content;

  const runnings: IRunningItem[] = demos.map(demo => {
    const pre = demo[0];
    const template = demo[1] ?? 'default';
    const code = demo[2];
    const containerId = `markdown-demo-${globalContainerId++}`;
    content = content.replace(
      pre,
      `<div style=\"position: relative\"><div id=\"${containerId}\" class=\"markdown-demo\"></div><div id=\"live-demo-additional-container\" style=\"position: absolute; left: 0; top: 0\"></div></div>`
    );
    const containerInitCode = `
const __LIVE_DEMO_CONTAINER_ID__ = "${containerId}";
window.CONTAINER_ID = __LIVE_DEMO_CONTAINER_ID__;
const CONTAINER_ID = __LIVE_DEMO_CONTAINER_ID__;
const __CONTAINER_ID__ = __LIVE_DEMO_CONTAINER_ID__;
`;
    const evaluateCode = `${containerInitCode}\n${code}`
      .concat(`\nif(typeof tableInstance !== 'undefined'){window['${containerId}'] = tableInstance;}`);
    return {
      code: transformCode(htmlRestore(evaluateCode)),
      id: containerId,
      template
    };
  });

  useEffect(() => {
    runnings.forEach(async running => {
      try {
        await Object.getPrototypeOf(async function () {}).constructor(running.code)();
      } catch (err) {
        console.error(err);
      }
    });
    return () => {
      runnings.forEach(running => {
        (window as any)[running.id]?.release?.();
        (window as any).customRelease?.();
      });
    };
  }, [props.content]);

  return <div className="markdown-container" style={{ padding: '20px 40px' }} dangerouslySetInnerHTML={{ __html: content }} />;
}

export function Markdown() {
  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const { pathname: pathName } = location;
  const assetDirectory = pathName.split('/')[2];

  const [outline, setOutline] = useState<IMenuItem[]>([]);
  const [content, setContent] = useState<string>('');
  const [siderWidth, setSiderWidth] = useState<number>(280);

  const handleMoving = (_event: any, { width }: any) => {
    setSiderWidth(Math.max(width, 120));
  };

  useEffect(() => {
    const menuPath = `/assets/${assetDirectory}/menu.json`;
    fetch(menuPath)
      .then(response => response.json())
      .then(menu => {
        const menuItems = (menu.children ?? []) as IMenuItem[];
        function traverse(menuItem: IMenuItem, path: string) {
          menuItem.fullPath = `${path}/${menuItem.path}`;
          (menuItem.children ?? []).forEach(subItem => {
            traverse(subItem, menuItem.fullPath);
          });
        }
        menuItems.forEach(menuItem => traverse(menuItem, ''));
        setOutline(menuItems);
      });
  }, [language, assetDirectory]);

  useEffect(() => {
    const docFullPath = pathName.split(`/${assetDirectory}/`)[1];
    if (!docFullPath) {
      setContent('');
      return;
    }
    const docPath = `/assets/${assetDirectory}/${language}/${docFullPath}.md`;
    fetch(docPath)
      .then(response => response.text())
      .then(text => {
        let processedText = text;
        if (assetDirectory === 'demo') {
          processedText = processedText.replace(/---(.|\n)*---/, '').trim();
        }
        processedText = preprocessLivedemoFiles(processedText);
        processedText = processedText.replace(
          /```[^\n]*livedemo(?:\s+template=([a-zA-Z0-9-]+))?/g,
          (_matched, template?: string) => (template ? `\`\`\`livedemo-${template}` : '```livedemo')
        );
        setContent(markdownParser.render(processedText));
      });
  }, [language, pathName, assetDirectory]);

  return (
    <Layout>
      <Layout.Header>
        <Header />
      </Layout.Header>
      <Layout style={{ marginTop: 48 }}>
        <Layout.Sider
          style={{ height: 'calc(100vh - 48px)', width: siderWidth }}
          resizeBoxProps={{
            directions: ['right'],
            onMoving: handleMoving
          }}
        >
          <Outline menuItems={outline} assetDirectory={assetDirectory} />
        </Layout.Sider>
        <Layout.Content style={{ height: 'calc(100vh - 48px)' }}>
          <Content content={content} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
