export function preOrder(data: any, callback: (data: any, rank: number) => void, rank = 0) {
  if (!data) {
    return;
  }
  callback(data, rank);
  const children = data.children;
  if (children && !data.collapsed) {
    children.forEach((node: any) => {
      preOrder(node, callback, rank + 1);
    });
  }
}

export function postOrder(data: any, callback: (data: any, rank: number) => void, rank = 0) {
  if (!data) {
    return;
  }
  const children = data.children;
  if (children && !data.collapsed) {
    children.forEach((node: any) => {
      postOrder(node, callback, rank + 1);
    });
  }
  callback(data, rank);
}