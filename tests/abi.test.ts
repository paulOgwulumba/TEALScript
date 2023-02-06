/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import { AbiTest } from './contracts/clients/abitest_client';

let appClient: AbiTest;

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

  it('setMultiNestedArray runtime', async function () {
    const ret = await appClient.setMultiNestedArray();
    expect(ret.returnValue).to.equal(BigInt(88));
  });

  it('accountArray runtime', async function () {
    const [a, b, c] = (await sandbox.getAccounts()).map((acct) => acct.addr);
    const ret = await appClient.accountArray({ a, b, c });
    expect(ret.returnValue).to.equal(b);
  });

  it('assetArray runtime', async function () {
    const [a, b, c] = [BigInt(1), BigInt(2), BigInt(3)];
    const ret = await appClient.assetArray({ a, b, c });
    expect(ret.returnValue).to.equal(b);
  });

  it('appArray runtime', async function () {
    const [a, b, c] = [BigInt(1), BigInt(2), BigInt(3)];
    const ret = await appClient.appArray({ a, b, c });
    expect(ret.returnValue).to.equal(b);
  });

  it('uint256Array runtime', async function () {
    const [a, b, c] = [BigInt(1), BigInt(2), BigInt(3)];
    const ret = await appClient.uint256Array({ a, b, c });
    expect(ret.returnValue).to.equal(b);
  });

  it('nestedArrayVariable runtime', async function () {
    const ret = await appClient.nestedArrayVariable();
    expect(ret.returnValue).to.equal(BigInt(4));
  });

  it('simpleTuple runtime', async function () {
    const ret = await appClient.simpleTuple();
    expect(ret.returnValue).to.equal(BigInt(33));
  });

  it('stringInTuple runtime', async function () {
    const ret = await appClient.stringInTuple();
    expect(ret.returnValue).to.equal('hello world');
  });
});
