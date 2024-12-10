import _ from 'lodash';
import { mergeDiffKeys, indent } from '../utils.js';

export const printDiff = (key, value, sign, it) => {
  if (_.isObject(value)) {
    const keys = Object.keys(value);
    return `${indent(it, 2)}${sign} ${key}: {\n${
      keys.map((key1) => {
        if (_.isObject(value[key1])) {
          return printDiff(key1, value[key], ' ', it + 1);
        }
        return `${indent(it + 1, 2)}  ${key1}: ${value[key1]}`;
      }).join('')
    }\n${indent(it)}}`;
  }
  return `${indent(it, 2)}${sign} ${key}: ${value}`;
};

export const isDiffObject = (obj) => {
  const keys = Object.keys(obj);
  if (keys.length === 3) {
    if (keys.includes('added') && keys.includes('removed') && keys.includes('common')) {
      return true;
    } return false;
  } return false;
};

export const printObjDeep = (obj, it = 0) => {
  const keys = Object.keys(obj);
  return keys.map((key) => {
    if (_.isObject(obj[key])) {
      return `${indent(it)}${key}: {\n${printObjDeep(obj[key], it + 1)}${indent(it)}}\n`;
    }
    return `${indent(it)}${key}: ${obj[key]}\n`;
  }).join('');
};

const printIfObject = (obj, key, sign, it) => (_.isObject(obj[key])
  ? `${indent(it, 2)}${sign} ${key}: {\n${printObjDeep(obj[key], it + 1)}${indent(it)}}`
  : printDiff(key, obj[key], sign, it));

export const stylish = (diff, it = 1) => mergeDiffKeys(diff).reduce((accumulator, key) => (
  accumulator
      + ((Object.keys(diff.common).includes(key)
          && (_.isObject(diff.common[key])
            ? `${printDiff(key, '{', ' ', it)}\n${stylish(diff.common[key], it + 1)}${indent(it)}}\n`
            : `${printDiff(key, diff.common[key], ' ', it)}\n`
          )) || '')
      + (Object.keys(diff.removed).includes(key)
        ? `${printIfObject(diff.removed, key, '-', it)}\n`
        : '')
      + (Object.keys(diff.added).includes(key)
        ? `${printIfObject(diff.added, key, '+', it)}\n`
        : '')
), it === 1 ? '{\n' : '') + (it === 1 ? '}' : '');
