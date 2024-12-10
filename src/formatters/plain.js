import _ from 'lodash';
import { mergeDiffKeys } from '../utils.js';

const complexValue = (value) => {
  if (_.isObject(value)) {
    return '[complex value]';
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  return `${value}`;
};

export const plain = (diff, path = '') => {
  const keys = mergeDiffKeys(diff);
  return keys.reduce((result, key) => {
    const currentPath = `${path}${path.length === 0 ? '' : '.'}${key}`;
    if (Object.keys(diff.added).includes(key) && Object.keys(diff.removed).includes(key)) {
      return `${result
      }Property '${currentPath}' was updated. From ${complexValue(diff.removed[key])} to ${complexValue(diff.added[key])}\n`;
    }
    if (Object.keys(diff.common).includes(key) && _.isObject(diff.common[key])) {
      return result + plain(diff.common[key], currentPath);
    }
    if (Object.keys(diff.removed).includes(key)) {
      return `${result}Property '${currentPath}' was removed\n`;
    }
    if (Object.keys(diff.added).includes(key)) {
      return `${result}Property '${currentPath}' was added with value: ${complexValue(diff.added[key])}\n`;
    }

    return result;
  }, '');
};

export default plain;
