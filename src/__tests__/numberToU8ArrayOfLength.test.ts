import { numberToU8ArrayOfLength } from '../index';
test('Short array', () => {
  expect(numberToU8ArrayOfLength(1, 4)).toStrictEqual(new Uint8Array([0, 0, 0, 1]));
});