import { numberToU8ArrayOfLength, bnToU8ArrayOfLength } from '../index';
import BN from 'bn.js';

test('numberToU8ArrayOfLength: 1', () => {
  expect(numberToU8ArrayOfLength(1, 4)).toStrictEqual(new Uint8Array([0, 0, 0, 1]));
});
test('numberToU8ArrayOfLength: 1000000', () => {
  expect(numberToU8ArrayOfLength(1000000, 8)).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 15, 66, 64]));
});
test('numberToU8ArrayOfLength: 1000000000000000000', () => {
  expect(numberToU8ArrayOfLength(1000000000000000000, 16)).toStrictEqual(new Uint8Array([
    0, 0, 0, 0, 0, 0,
    0, 0, 13, 224, 182, 179,
    167, 100, 0, 0
  ]));
});
test('bnToU8ArrayOfLength: 1', () => {
  expect(bnToU8ArrayOfLength(new BN('1'), 4)).toStrictEqual(new Uint8Array([0, 0, 0, 1]));
});
test('bnToU8ArrayOfLength: 1000000', () => {
  expect(bnToU8ArrayOfLength(new BN('1000000'), 8)).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 15, 66, 64]));
});
test('bnToU8ArrayOfLength: 1000000000000000000', () => {
  expect(bnToU8ArrayOfLength(new BN('1000000000000000000'), 16)).toStrictEqual(new Uint8Array([
    0, 0, 0, 0, 0, 0,
    0, 0, 13, 224, 182, 179,
    167, 100, 0, 0
  ]));
});