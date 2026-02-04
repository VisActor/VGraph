import { uuid } from '../common';


export function isRepeatedId(id: string | number, type: string, entityMap: { node: any; group: any; edge: any; } ) {
  if (type === 'edge'){
    return !!entityMap.edge[id];
  } else {
    return !!(entityMap.node[id] || entityMap.group[id]);
  }
}
export function getNonRepetitiveId(type: string, entityMap: { node: any; group: any; edge: any; } ) {
  let uid = uuid(10);
  if (type === 'edge') {
    while ( entityMap.edge[uid] ) { 
      uid = uuid(10);
    }
  } else {
    while ( entityMap.node[uid] || entityMap.group[uid] ) { // node 和 group 之间也不应该重复。
      uid = uuid(10);
    }
  }
  return uid;
}