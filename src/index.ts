import { IKeyringPair } from '@polkadot/types/types';
import { numberToU8a, stringToU8a, bnToU8a } from '@polkadot/util';
import BN from 'bn.js';
import { IPFSHTTPClient, CID } from 'kubo-rpc-client'
import crypto from 'crypto';

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
export async function getIPFSContentID(ipfs: IPFSHTTPClient, content: string) {
  const cid = await ipfs.dag.put(content, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' });
  return cid.toString();
}
// A helper wrapper to get a text from IPFS CID
export async function getIPFSDataFromContentID(ipfs: IPFSHTTPClient, cidStr: string): Promise<string | null> {
  const cid = CID.parse(cidStr);
  const result = await ipfs.dag.get(cid);
  // Check if result.value is a string and return it, else return null
  if (typeof result.value === 'string') {
    return result.value;
  }
  return null;
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


function encryptText(text: string, password: string, salt: string) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32); // Using the provided salt for encryption
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;  // IV concatenated with encrypted text
}

function decryptText(encryptedText: string, password: string, salt: string) {
  const iv = Buffer.from(encryptedText.substring(0, 32), 'hex');
  const encrypted = encryptedText.substring(32);
  const key = crypto.scryptSync(password, salt, 32); // Using the provided salt for decryption
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function storeEncryptedTextOnIPFS(ipfs: any, text: string, password: string, salt: string) {
  const encryptedText = encryptText(text, password, salt);
  const cid = await getIPFSContentID(ipfs, encryptedText);
  return cid;
}

export async function retrieveDecryptedDataFromIPFS(ipfs: any, cid: string, password: string, salt: string) {
  const encryptedData = await getIPFSDataFromContentID(ipfs, cid);
  return decryptText(encryptedData, password, salt);
}

export function parseJson (input: string): any | null {
  try {
    const result = JSON.parse(input);
    return result;
  } catch (e) {
    console.error("Error parsing JSON: ", e.message);
    return null;
  }
}