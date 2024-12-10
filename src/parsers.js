import * as fs from 'node:fs';
import yaml from 'js-yaml';
import * as path from 'node:path';

export const parseJSONData = (pathToFile) => JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));

export const parseYAMLData = (pathToFile) => yaml.load(fs.readFileSync(pathToFile, 'utf-8'));

export const parseData = (pathToFile) => {
  const absPath = path.resolve(pathToFile);
  if (absPath.includes('.json')) {
    return parseJSONData(absPath);
  } if (absPath.includes('.yml') || absPath.includes('.yaml')) {
    return parseYAMLData(absPath);
  }
  return null;
};
