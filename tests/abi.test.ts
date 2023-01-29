/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import { getMethodTeal } from './common';
import { AbiTest } from './contracts/clients/abitest_client';

let appClient: AbiTest;
async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/abi.ts', 'AbiTest', methodName);
}

describe('ABI', function () {
  before(async function () {
    const acct = (await sandbox.getAccounts()).pop();

    appClient = new AbiTest({
      client: clients.sandboxAlgod(),
      signer: acct!.signer,
      sender: acct!.addr,
    });

    await appClient.create();
  });

  it('variableArray TEAL', async function () {
    const teal = await getTeal('variableArray');
    expect(teal).to.deep.equal(
      [
        '// c: uint64[] = [11, 22, 33]',
        'int 11',
        'itob',
        'int 22',
        'itob',
        'concat',
        'int 33',
        'itob',
        'concat',
        'store 0',
        'byte 0x00',
        'frame_bury -128 // c: uint64[]',
        '// assert(c[1] === 22)',
        'frame_dig -128 // c: uint64[]',
        'btoi',
        'loads',
        'extract 8 8',
        'btoi',
        'int 22',
        '==',
        'assert',
      ],
    );
  });

  it('threeDimensionalArray TEAL', async function () {
    const teal = await getTeal('threeDimensionalArray');
    expect(teal).to.deep.equal(
      [
        '// c: uint64[][][] = [[[11, 22], [33, 44]], [[55, 66], [77, 88]]]',
        'int 11',
        'itob',
        'int 22',
        'itob',
        'concat',
        'store 1',
        'byte 0x01',
        'int 33',
        'itob',
        'int 44',
        'itob',
        'concat',
        'store 2',
        'byte 0x02',
        'concat',
        'store 3',
        'byte 0x03',
        'int 55',
        'itob',
        'int 66',
        'itob',
        'concat',
        'store 4',
        'byte 0x04',
        'int 77',
        'itob',
        'int 88',
        'itob',
        'concat',
        'store 5',
        'byte 0x05',
        'concat',
        'store 6',
        'byte 0x06',
        'concat',
        'store 7',
        'byte 0x07',
        'frame_bury -128 // c: uint64[][][]',
        '// assert(c[1][1][1] === 88)',
        'frame_dig -128 // c: uint64[][][]',
        'btoi',
        'loads',
        'extract 1 1',
        'btoi',
        'loads',
        'extract 1 1',
        'btoi',
        'loads',
        'extract 8 8',
        'btoi',
        'int 88',
        '==',
        'assert',
      ],
    );
  });

  it('nonLiteralAccess TEAL', async function () {
    const teal = await getTeal('nonLiteralAccess');
    expect(teal).to.deep.equal(
      [
        '// c: uint64[][][] = [[[11, 22], [33, 44]], [[55, 66], [77, 88]]]',
        'int 11',
        'itob',
        'int 22',
        'itob',
        'concat',
        'store 8',
        'byte 0x08',
        'int 33',
        'itob',
        'int 44',
        'itob',
        'concat',
        'store 9',
        'byte 0x09',
        'concat',
        'store 10',
        'byte 0x0a',
        'int 55',
        'itob',
        'int 66',
        'itob',
        'concat',
        'store 11',
        'byte 0x0b',
        'int 77',
        'itob',
        'int 88',
        'itob',
        'concat',
        'store 12',
        'byte 0x0c',
        'concat',
        'store 13',
        'byte 0x0d',
        'concat',
        'store 14',
        'byte 0x0e',
        'frame_bury -128 // c: uint64[][][]',
        '// i = 1 + 0',
        'int 1',
        'int 0',
        '+',
        'frame_bury -127 // i: uint64',
        '// assert(c[i][i][i] === 88)',
        'frame_dig -128 // c: uint64[][][]',
        'btoi',
        'loads',
        'frame_dig -127 // i: uint64',
        'int 1',
        'extract3',
        'btoi',
        'loads',
        'frame_dig -127 // i: uint64',
        'int 1',
        'extract3',
        'btoi',
        'loads',
        'int 8',
        'frame_dig -127 // i: uint64',
        '*',
        'int 8',
        'extract3',
        'btoi',
        'int 88',
        '==',
        'assert',
      ],
    );
  });

  it('setArrayValue TEAL', async function () {
    const teal = await getTeal('setArrayValue');
    expect(teal).to.deep.equal(
      [
        '// c: uint64[] = [1, 2, 3, 4, 5]',
        'int 1',
        'itob',
        'int 2',
        'itob',
        'concat',
        'int 3',
        'itob',
        'concat',
        'int 4',
        'itob',
        'concat',
        'int 5',
        'itob',
        'concat',
        'store 15',
        'byte 0x0f',
        'frame_bury -128 // c: uint64[]',
        '// c[1] = 22',
        'frame_dig -128 // c: uint64[]',
        'btoi',
        'dup',
        'loads',
        'int 1',
        'int 8',
        '*',
        'int 22',
        'itob',
        'replace3',
        'stores',
        '// assert(c[1] === 22)',
        'frame_dig -128 // c: uint64[]',
        'btoi',
        'loads',
        'extract 8 8',
        'btoi',
        'int 22',
        '==',
        'assert',
      ],
    );
  });

  it('setNestedArrayValue TEAL', async function () {
    const teal = await getTeal('setNestedArrayValue');
    expect(teal).to.deep.equal(
      [
        '// c: uint64[][] = [[1, 2], [3, 4]]',
        'int 1',
        'itob',
        'int 2',
        'itob',
        'concat',
        'store 16',
        'byte 0x10',
        'int 3',
        'itob',
        'int 4',
        'itob',
        'concat',
        'store 17',
        'byte 0x11',
        'concat',
        'store 18',
        'byte 0x12',
        'frame_bury -128 // c: uint64[][]',
        '// i = 1',
        'int 1',
        'frame_bury -127 // i: uint64',
        '// c[i][i] = 44',
        'frame_dig -128 // c: uint64[][]',
        'btoi',
        'loads',
        'frame_dig -127 // i: uint64',
        'int 1',
        'extract3',
        'btoi',
        'dup',
        'loads',
        'frame_dig -127 // i: uint64',
        'int 8',
        '*',
        'int 44',
        'itob',
        'replace3',
        'stores',
        '// assert(c[i][i] === 44)',
        'frame_dig -128 // c: uint64[][]',
        'btoi',
        'loads',
        'frame_dig -127 // i: uint64',
        'int 1',
        'extract3',
        'btoi',
        'loads',
        'int 8',
        'frame_dig -127 // i: uint64',
        '*',
        'int 8',
        'extract3',
        'btoi',
        'int 44',
        '==',
        'assert',
      ],
    );
  });

  it('variableArray runtime', async function () {
    await appClient.variableArray();
  });

  it('threeDimensionalArray runtime', async function () {
    await appClient.threeDimensionalArray();
  });

  it('nonLiteralAccess runtime', async function () {
    await appClient.nonLiteralAccess();
  });

  it('setArrayValue runtime', async function () {
    await appClient.setArrayValue();
  });

  it('setNestedArrayValue runtime', async function () {
    await appClient.setNestedArrayValue();
  });

  it('stringArray runtime', async function () {
    const ret = await appClient.stringArray();
    expect(ret.returnValue).to.equal('test');
  });

  it('setNestedArray runtime', async function () {
    const ret = await appClient.setNestedArray();
    expect(ret.returnValue).to.equal(BigInt(44));
  });
});
