import { IKeyringPair } from '@polkadot/types/types';
import { numberToU8a, stringToU8a, bnToU8a } from '@polkadot/util';
import { IPFS } from 'ipfs-core';
import BN from 'bn.js';

// Converts a JS number to a byte array of specified length
export function numberToU8ArrayOfLength(value: number, length: number) {
  const shortResult = numberToU8a(value);
  if (shortResult.length < length) {
    const firstZeros = new Array(length - shortResult.length).fill(0);
    const concatArray = new Uint8Array([...firstZeros, ...shortResult]);
    return concatArray;
  } else {
    return shortResult;
  }
}
// Converts a BN to a byte array of specified length
export function bnToU8ArrayOfLength(value: BN, length: number) {
  const shortResult = bnToU8a(value).reverse();
  if (shortResult.length < length) {
    const firstZeros = new Array(length - shortResult.length).fill(0);
    const concatArray = new Uint8Array([...firstZeros, ...shortResult]);
    return concatArray;
  } else {
    return shortResult;
  }
}
// Converts a recommendation letter public info to a byte array to be signed by a referee
export function getPublicDataToSignByReferee(
  letterId: number,
  blockNumber: BN,
  refereeU8: Uint8Array,
  workerU8: Uint8Array,
  amount: BN,
) {
  return new Uint8Array([
    ...numberToU8ArrayOfLength(letterId, 4),
    ...bnToU8ArrayOfLength(blockNumber, 8),
    ...refereeU8,
    ...workerU8,
    ...bnToU8ArrayOfLength(amount, 16),
  ]);
}
// Converts a recommendation letter private info to a byte array to be signed by a referee
export function getPrivateDataToSignByReferee(
  textHash: string,
  letterId: number,
  blockNumber: BN,
  refereeU8: Uint8Array,
  workerU8: Uint8Array,
  amount: BN,
) {
  return new Uint8Array([
    ...stringToU8a(textHash),
    ...numberToU8ArrayOfLength(letterId, 4),
    ...bnToU8ArrayOfLength(blockNumber, 8),
    ...refereeU8,
    ...workerU8,
    ...bnToU8ArrayOfLength(amount, 16),
  ]);
}
// Converts a recommendation letter info to a byte array to be signed by worker to enable employer to penalize a referee
export function getDataToSignByWorker(
  letterId: number,
  blockNumber: BN,
  refereeU8: Uint8Array,
  workerU8: Uint8Array,
  amount: BN,
  refereeSignatureU8: Uint8Array,
  employerU8: Uint8Array,
) {
  return new Uint8Array([
    ...numberToU8ArrayOfLength(letterId, 4),
    ...bnToU8ArrayOfLength(blockNumber, 8),
    ...refereeU8,
    ...workerU8,
    ...bnToU8ArrayOfLength(amount, 16),
    ...refereeSignatureU8,
    ...employerU8,
  ]);
}
// Just signs data
export function sign(signer: IKeyringPair, data: Uint8Array) {
  return signer.sign(data);
}
// A helper wrapper to get IPFS CID from a text
export async function getIPFSContentID(ipfs: IPFS, content: string) {
  const file = await ipfs.add(content);
  return file.cid;
}
// A helper wrapper to get a text from IPFS CID
export async function getIPFSDataFromContentID(ipfs: IPFS, cid: string) {
  const text = [];
  for await (const chunk of ipfs.cat(cid)) {
    text.push(chunk);
  }
  return text.toString();
}
