// @ts-check

// import { jest } from '@jest/globals';
import { describe } from '@jest/globals';
import { execSync } from 'child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  mergeKeys, indent, mergeDiffKeys, createDiff,
} from '../src/utils.js';
import pathFile from '../src/index.js';
import { parseJSONData, parseYAMLData, parseData } from '../src/parsers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = { encoding: 'utf8', cwd: path.join(__dirname, '..') };
const result1 = execSync(
  'bin/gendiff.js --format stylish __fixtures__/file1.json __fixtures__/file2.json',
  // @ts-ignore
  options,
);

const result2 = execSync(
  'bin/gendiff.js --format plain __fixtures__/file1.json __fixtures__/file2.json',
  // @ts-ignore
  options,
);

const result3 = execSync(
  'bin/gendiff.js --format json __fixtures__/file1.json __fixtures__/file2.json',
  // @ts-ignore
  options,
);

const rows1 = result1.trim().split('\n');
const rows2 = result2.trim().split('\n');
const rows3 = result3.trim().split('\n');

describe('mergeKeys', () => {
  it('совмещает два массива и сортирует их', () => {
    const keys1 = ['a', 'b', 'c'];
    const keys2 = ['b', 'c', 'd', 'e'];
    const result = mergeKeys(keys1, keys2);
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('работает с пустыми массивами', () => {
    expect(mergeKeys([], ['a', 'b'])).toEqual(['a', 'b']);
    expect(mergeKeys(['a', 'b'], [])).toEqual(['a', 'b']);
    expect(mergeKeys([], [])).toEqual([]);
  });

  it('не содержит одинаковых элементов', () => {
    const keys1 = ['a', 'b'];
    const keys2 = ['b', 'c', 'd'];
    const result = mergeKeys(keys1, keys2);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('indent', () => {
  it('возвращает правильное количество отступов', () => {
    expect(indent(1)).toBe('    ');
    expect(indent(2)).toBe('        ');
    expect(indent(1, 2)).toBe('  ');
    expect(indent(1, 0, 2)).toBe('  ');
    expect(indent(1, 1, 2)).toBe(' ');
  });

  it('выводит пустую строку при значении сдвига влево больше чем количество оступов', () => {
    expect(indent(1, 10)).toBe('');
  });
});

describe('mergeDiffKeys', () => {
  it('совмещает три ключа объекта и сортирует их', () => {
    const obj = {
      added: {
        a: 1,
        b: 2,
      },
      removed: {
        b: 3,
        c: 4,
      },
      common: {
        d: 5,
      },
    };
    expect(mergeDiffKeys(obj)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('createDiff', () => {
  it('вычисляет отличия двух объектов и выводит их в новый объект', () => {
    const obj1 = {
      b: false,
      c: {
        d: 'fff',
        e: {
          f: 4,
          g: null,
        },
      },
      h: '',
    };
    const obj2 = {
      a: 2,
      b: false,
      c: {
        d: 'fff',
        e: {
          f: 2,
        },
      },
      h: 'yay',
    };
    const result = {
      added: {
        a: 2,
        h: 'yay',
      },
      removed: {
        h: '',
      },
      common: {
        b: false,
        c: {
          added: {},
          removed: {},
          common: {
            d: 'fff',
            e: {
              added: {
                f: 2,
              },
              removed: {
                f: 4,
                g: null,
              },
              common: {},
            },
          },
        },
      },
    };
    expect(createDiff(obj1, obj2)).toEqual(result);
  });
});

describe('pathFile', () => {
  it('Выводит false в случае неправильного расширения файла', () => {
    const diff1 = pathFile('__fixtures__/file1.json', '__fixtures__/file2.json', 'stylish');
    expect(diff1).toBeTruthy();
    const diff2 = pathFile('__fixtures__/file1.yml', '__fixtures__/file2.yml', 'json');
    expect(diff2).toBeTruthy();
    const diff3 = pathFile('__fixtures__/file1.csgo', '__fixtures__/file2.csgo', 'plain');
    expect(diff3).toBeFalsy();
    const diff4 = pathFile('__fixtures__/file1.json', '__fixtures__/file2.json', 'plain');
    expect(diff4).toBeTruthy();
  });
});

describe('parseJSONData', () => {
  it('Успешно парсит JSON файлы', () => {
    const filepath1 = path.resolve('__fixtures__/file1.json');
    const data1 = {
      common: {
        setting1: 'Value 1',
        setting2: 200,
        setting3: true,
        setting6: {
          key: 'value',
          doge: {
            wow: '',
          },
        },
      },
      group1: {
        baz: 'bas',
        foo: 'bar',
        nest: {
          key: 'value',
        },
      },
      group2: {
        abc: 12345,
        deep: {
          id: 45,
        },
      },
    };
    expect(parseJSONData(filepath1)).toEqual(data1);
    const filepath2 = path.resolve('__fixtures__/file2.json');
    const data2 = {
      common: {
        follow: false,
        setting1: 'Value 1',
        setting3: null,
        setting4: 'blah blah',
        setting5: {
          key5: 'value5',
        },
        setting6: {
          key: 'value',
          ops: 'vops',
          doge: {
            wow: 'so much',
          },
        },
      },
      group1: {
        foo: 'bar',
        baz: 'bars',
        nest: 'str',
      },
      group3: {
        deep: {
          id: {
            number: 45,
          },
        },
        fee: 100500,
      },
    };
    expect(parseJSONData(filepath2)).toEqual(data2);
  });
});

describe('parseYAMLData', () => {
  it('Успешно парсит YAML файлы', () => {
    const filepath1 = path.resolve('__fixtures__/file1.yml');
    const data1 = {
      host: 'hexlet.io',
      timeout: 50,
      proxy: '123.234.53.22',
      follow: false,
    };
    expect(parseYAMLData(filepath1)).toEqual(data1);
    const filepath2 = path.resolve('__fixtures__/file2.yml');
    const data2 = {
      timeout: 20,
      verbose: true,
      host: 'hexlet.io',
    };
    expect(parseYAMLData(filepath2)).toEqual(data2);
  });
});

describe('parseData', () => {
  it('Успешно парсит файлы и определяет их тип', () => {
    const filepath1 = '__fixtures__/file1.json';
    const data1 = {
      common: {
        setting1: 'Value 1',
        setting2: 200,
        setting3: true,
        setting6: {
          key: 'value',
          doge: {
            wow: '',
          },
        },
      },
      group1: {
        baz: 'bas',
        foo: 'bar',
        nest: {
          key: 'value',
        },
      },
      group2: {
        abc: 12345,
        deep: {
          id: 45,
        },
      },
    };
    expect(parseData(filepath1)).toEqual(data1);
    const filepath2 = '__fixtures__/file2.yml';
    const data2 = {
      timeout: 20,
      verbose: true,
      host: 'hexlet.io',
    };
    expect(parseData(filepath2)).toEqual(data2);
  });
});

describe('formatter stylish', () => {
  it('выводит отличия в stylish формате', () => {
    expect(rows1[0]).toStrictEqual('{');
    expect(rows1[1]).toStrictEqual('    common: {');
    expect(rows1[2]).toStrictEqual('      + follow: false');
    expect(rows1[3]).toStrictEqual('        setting1: Value 1');
    expect(rows1[4]).toStrictEqual('      - setting2: 200');
    expect(rows1[5]).toStrictEqual('      - setting3: true');
    expect(rows1[6]).toStrictEqual('      + setting3: null');
    expect(rows1[7]).toStrictEqual('      + setting4: blah blah');
    expect(rows1[8]).toStrictEqual('      + setting5: {');
    expect(rows1[9]).toStrictEqual('            key5: value5');
    expect(rows1[10]).toStrictEqual('        }');
    expect(rows1[11]).toStrictEqual('        setting6: {');
    expect(rows1[12]).toStrictEqual('            doge: {');
    expect(rows1[13]).toStrictEqual('              - wow: ');
    expect(rows1[14]).toStrictEqual('              + wow: so much');
    expect(rows1[15]).toStrictEqual('            }');
    expect(rows1[16]).toStrictEqual('            key: value');
    expect(rows1[17]).toStrictEqual('          + ops: vops');
    expect(rows1[18]).toStrictEqual('        }');
    expect(rows1[19]).toStrictEqual('    }');
    expect(rows1[20]).toStrictEqual('    group1: {');
    expect(rows1[21]).toStrictEqual('      - baz: bas');
    expect(rows1[22]).toStrictEqual('      + baz: bars');
    expect(rows1[23]).toStrictEqual('        foo: bar');
    expect(rows1[24]).toStrictEqual('      - nest: {');
    expect(rows1[25]).toStrictEqual('            key: value');
    expect(rows1[26]).toStrictEqual('        }');
    expect(rows1[27]).toStrictEqual('      + nest: str');
    expect(rows1[28]).toStrictEqual('    }');
    expect(rows1[29]).toStrictEqual('  - group2: {');
    expect(rows1[30]).toStrictEqual('        abc: 12345');
    expect(rows1[31]).toStrictEqual('        deep: {');
    expect(rows1[32]).toStrictEqual('            id: 45');
    expect(rows1[33]).toStrictEqual('        }');
    expect(rows1[34]).toStrictEqual('    }');
    expect(rows1[35]).toStrictEqual('  + group3: {');
    expect(rows1[36]).toStrictEqual('        deep: {');
    expect(rows1[37]).toStrictEqual('            id: {');
    expect(rows1[38]).toStrictEqual('                number: 45');
    expect(rows1[39]).toStrictEqual('            }');
    expect(rows1[40]).toStrictEqual('        }');
    expect(rows1[41]).toStrictEqual('        fee: 100500');
    expect(rows1[42]).toStrictEqual('    }');
    expect(rows1[43]).toStrictEqual('}');
  });
});

describe('formatter plain', () => {
  it('выводит отличия в plain формате', () => {
    expect(rows2[0]).toStrictEqual("Property 'common.follow' was added with value: false");
    expect(rows2[1]).toStrictEqual("Property 'common.setting2' was removed");
    expect(rows2[2]).toStrictEqual("Property 'common.setting3' was updated. From true to null");
    expect(rows2[3]).toStrictEqual("Property 'common.setting4' was added with value: 'blah blah'");
    expect(rows2[4]).toStrictEqual("Property 'common.setting5' was added with value: [complex value]");
    expect(rows2[5]).toStrictEqual("Property 'common.setting6.doge.wow' was updated. From '' to 'so much'");
    expect(rows2[6]).toStrictEqual("Property 'common.setting6.ops' was added with value: 'vops'");
    expect(rows2[7]).toStrictEqual("Property 'group1.baz' was updated. From 'bas' to 'bars'");
    expect(rows2[8]).toStrictEqual("Property 'group1.nest' was updated. From [complex value] to 'str'");
    expect(rows2[9]).toStrictEqual("Property 'group2' was removed");
    expect(rows2[10]).toStrictEqual("Property 'group3' was added with value: [complex value]");
  });
});

describe('formatter json', () => {
  it('выводит отличия в JSON формате', () => {
    expect(rows3[0]).toStrictEqual('{');
    expect(rows3[1]).toStrictEqual('  "added": {');
    expect(rows3[2]).toStrictEqual('    "group3": {');
    expect(rows3[3]).toStrictEqual('      "deep": {');
    expect(rows3[4]).toStrictEqual('        "id": {');
    expect(rows3[5]).toStrictEqual('          "number": 45');
    expect(rows3[6]).toStrictEqual('        }');
    expect(rows3[7]).toStrictEqual('      },');
    expect(rows3[8]).toStrictEqual('      "fee": 100500');
    expect(rows3[9]).toStrictEqual('    }');
    expect(rows3[10]).toStrictEqual('  },');
    expect(rows3[11]).toStrictEqual('  "removed": {');
    expect(rows3[12]).toStrictEqual('    "group2": {');
    expect(rows3[13]).toStrictEqual('      "abc": 12345,');
    expect(rows3[14]).toStrictEqual('      "deep": {');
    expect(rows3[15]).toStrictEqual('        "id": 45');
    expect(rows3[16]).toStrictEqual('      }');
    expect(rows3[17]).toStrictEqual('    }');
    expect(rows3[18]).toStrictEqual('  },');
    expect(rows3[19]).toStrictEqual('  "common": {');
    expect(rows3[20]).toStrictEqual('    "common": {');
    expect(rows3[21]).toStrictEqual('      "added": {');
    expect(rows3[22]).toStrictEqual('        "follow": false,');
    expect(rows3[23]).toStrictEqual('        "setting3": null,');
    expect(rows3[24]).toStrictEqual('        "setting4": "blah blah",');
    expect(rows3[25]).toStrictEqual('        "setting5": {');
    expect(rows3[26]).toStrictEqual('          "key5": "value5"');
    expect(rows3[27]).toStrictEqual('        }');
    expect(rows3[28]).toStrictEqual('      },');
    expect(rows3[29]).toStrictEqual('      "removed": {');
    expect(rows3[30]).toStrictEqual('        "setting2": 200,');
    expect(rows3[31]).toStrictEqual('        "setting3": true');
    expect(rows3[32]).toStrictEqual('      },');
    expect(rows3[33]).toStrictEqual('      "common": {');
    expect(rows3[34]).toStrictEqual('        "setting1": "Value 1",');
    expect(rows3[35]).toStrictEqual('        "setting6": {');
    expect(rows3[36]).toStrictEqual('          "added": {');
    expect(rows3[37]).toStrictEqual('            "ops": "vops"');
    expect(rows3[38]).toStrictEqual('          },');
    expect(rows3[39]).toStrictEqual('          "removed": {},');
    expect(rows3[40]).toStrictEqual('          "common": {');
    expect(rows3[41]).toStrictEqual('            "doge": {');
    expect(rows3[42]).toStrictEqual('              "added": {');
    expect(rows3[43]).toStrictEqual('                "wow": "so much"');
    expect(rows3[44]).toStrictEqual('              },');
    expect(rows3[45]).toStrictEqual('              "removed": {');
    expect(rows3[46]).toStrictEqual('                "wow": ""');
    expect(rows3[47]).toStrictEqual('              },');
    expect(rows3[48]).toStrictEqual('              "common": {}');
    expect(rows3[49]).toStrictEqual('            },');
    expect(rows3[50]).toStrictEqual('            "key": "value"');
    expect(rows3[51]).toStrictEqual('          }');
    expect(rows3[52]).toStrictEqual('        }');
    expect(rows3[53]).toStrictEqual('      }');
    expect(rows3[54]).toStrictEqual('    },');
    expect(rows3[55]).toStrictEqual('    "group1": {');
    expect(rows3[56]).toStrictEqual('      "added": {');
    expect(rows3[57]).toStrictEqual('        "baz": "bars",');
    expect(rows3[58]).toStrictEqual('        "nest": "str"');
    expect(rows3[59]).toStrictEqual('      },');
    expect(rows3[60]).toStrictEqual('      "removed": {');
    expect(rows3[61]).toStrictEqual('        "baz": "bas",');
    expect(rows3[62]).toStrictEqual('        "nest": {');
    expect(rows3[63]).toStrictEqual('          "key": "value"');
    expect(rows3[64]).toStrictEqual('        }');
    expect(rows3[65]).toStrictEqual('      },');
    expect(rows3[66]).toStrictEqual('      "common": {');
    expect(rows3[67]).toStrictEqual('        "foo": "bar"');
    expect(rows3[68]).toStrictEqual('      }');
    expect(rows3[69]).toStrictEqual('    }');
    expect(rows3[70]).toStrictEqual('  }');
    expect(rows3[71]).toStrictEqual('}');
  });
});
