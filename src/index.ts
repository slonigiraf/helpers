import { IKeyringPair } from '@polkadot/types/types';
import { numberToU8a, stringToU8a, bnToU8a } from '@polkadot/util';
import { IPFS } from 'ipfs-core';
import BN from 'bn.js';
import { CID } from 'multiformats/cid';

// ------
export const CODEC = 0x71;
// 1 is v1, 113 is 0x71, 18 is 0x12 the multihash code for sha2-256, 32 is length of digest
const prefix = new Uint8Array([1, 113, 18, 32]);
// ------

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
  genesisU8: Uint8Array,
  letterId: number,
  blockNumber: BN,
  refereeU8: Uint8Array,
  workerU8: Uint8Array,
  amount: BN,
) {
  return new Uint8Array([
    ...genesisU8,
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
  genesisU8: Uint8Array,
  letterId: number,
  blockNumber: BN,
  refereeU8: Uint8Array,
  workerU8: Uint8Array,
  amount: BN,
) {
  return new Uint8Array([
    ...stringToU8a(textHash),
    ...genesisU8,
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
  // const { cid: newCid } = await ipfs.add(content, {
  //   cidVersion: 1,
  //   hashAlg: 'sha2-256'
  // });
  // return newCid.toString();
  const cid = await ipfs.dag.put(content, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' });
  return cid.toString();
}
// A helper wrapper to get a text from IPFS CID
export async function getIPFSDataFromContentID(ipfs: IPFS, cid: string) {
  const text = [];
  for await (const chunk of ipfs.cat(cid)) {
    text.push(chunk);
  }
  return text.toString();
}

export async function digestFromCIDv1(cidStr: string) {
  const cid = CID.parse(cidStr);
  if (cid.version !== 1) {
    throw new Error('The provided CID is not a CIDv1.');
  }
  const multihash = cid.multihash;
  if (multihash.code !== 0x12) {
    throw new Error('The provided CID does not use the SHA-256 hash function.');
  }
  return cid.multihash.digest;
}

export async function getCIDFromBytes(digest: Uint8Array) {
  const cidBytes = new Uint8Array([...prefix, ...digest]);
  const cid = CID.decode(cidBytes);
  return cid.toString();
}