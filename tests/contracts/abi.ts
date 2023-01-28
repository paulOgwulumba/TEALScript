/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AbiTest extends Contract {
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
}
