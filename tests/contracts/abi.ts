/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AbiTest extends Contract {
  @createApplication
  create(): void {}

  variableArray(): void {
    const c: uint64[] = [11, 22, 33];

    assert(c[1] === 22);
  }

  threeDimensionalArray(): void {
    const c: uint64[][][] = [[[11, 22], [33, 44]], [[55, 66], [77, 88]]];

    assert(c[1][1][1] === 88);
  }

  nonLiteralAccess(): void {
    const c: uint64[][][] = [[[11, 22], [33, 44]], [[55, 66], [77, 88]]];
    const i = 1 + 0;

    assert(c[i][i][i] === 88);
  }

  setArrayValue(): void {
    const c: uint64[] = [1, 2, 3, 4, 5];

    c[1] = 22;

    assert(c[1] === 22);
  }

  setNestedArrayValue(): void {
    const c: uint64[][] = [[1, 2], [3, 4]];
    const i = 1;

    c[i][i] = 44;

    assert(c[i][i] === 44);
  }

  stringArray(): string {
    const c: string[] = ['hello', 'world', 'test', '123'];

    return c[2];
  }

  setNestedArray(): uint64 {
    const c: uint64[][] = [[1, 2], [3, 4]];

    c[1] = [33, 44];

    return c[1][1];
  }

  setMultiNestedArray(): uint64 {
    const c: uint64[][][] = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];

    c[1] = [[55, 66], [77, 88]];

    return c[1][1][1];
  }

  accountArray(a: Account, b: Account, c: Account): Account {
    const arr = [a, b, c];

    return arr[1];
  }

  assetArray(a: Asset, b: Asset, c: Asset): Asset {
    const arr = [a, b, c];

    return arr[1];
  }

  appArray(a: Application, b: Application, c: Application): Application {
    const arr = [a, b, c];

    return arr[1];
  }

  uint256Array(a: uint256, b: uint256, c: uint256): uint256 {
    const arr = [a, b, c];

    return arr[1];
  }
}
