import { uuid } from "../common";

const cache: Record<string, any> = {};

export function insertStyles(styles: string, id?: string) {
  id = id || uuid(8);
  const element = cache[id!] || createElement(id!);
  if (element.styleSheet) {
    element.styleSheet.cssText = styles;
  } else {
    element.appendChild(document.createTextNode(styles));
  }
  cache[id!] = element;
}

function createElement(id: string) {
  let element = document.getElementById(id);
  if (element) {
    return element;
  }
  element = document.createElement("style");
  element.setAttribute("id", id);
  element.setAttribute("type", "text/css");
  document.head.appendChild(element);
  return element;
}

export function applyCss(dom: HTMLElement, css: { [key: string]: unknown }) {
  Object.keys(css).forEach((k: string) => {
    dom.style[k] = css[k];
  });
}
