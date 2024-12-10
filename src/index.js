import { parseData } from './parsers.js';
import format from './formatters/slindex.js';

const pathFile = (filepath1, filepath2, formatter) => {
  const data1 = parseData(filepath1);
  const data2 = parseData(filepath2);
  if (data1 === null || data2 === null) {
    console.log('wrong extension of files');
    return false;
  }
  return format(data1, data2, formatter);
};

export default pathFile;
