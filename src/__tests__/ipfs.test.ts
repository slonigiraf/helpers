import { create } from 'ipfs-core'
import { getIPFSDataFromContentID, digestFromCIDv1 as getDigestFromCIDv1, getIPFSContentID, getCIDFromBytes as getCIDv1FromDigest} from "../index";

describe('Working with IPFS', () => {

  let ipfs;
  let cid;
  const testData = "Test data";
  const expectedCIDString = "bafyreig5xwgka745wuaoeuabj73xopldonllfim23z2oj3xyxdpctx23ky";
  const expectedU8Data = new Uint8Array([
    221,189,140,160,127,157,181,0,226,80,1,79,247,119,61,99,115,86,178,161,154,222,116,228,238,248,184,222,41,223,91,86
  ]);

  beforeAll(async () => {
    jest.setTimeout(60000);
    ipfs = await create()

    // Add sample data to IPFS and get the CID for testing
    const newCid = await ipfs.dag.put(testData, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' });
    cid = newCid.toString();
  });

  afterAll(async () => {
    await ipfs.stop();
  });
  it('getIPFSContentID', async () => {
    const result = await getIPFSContentID(ipfs, testData);
    expect(result.toString()).toBe(expectedCIDString);
  });
  it('getIPFSDataFromContentID', async () => {
    const result = await getIPFSDataFromContentID(ipfs, expectedCIDString);
    expect(result).toBe(testData);
  });
  it('getDigestFromCIDv1', async () => {
    const result = await getDigestFromCIDv1(expectedCIDString);
    expect(result).toStrictEqual(expectedU8Data);
  });
  it('getCIDv1FromDigest', async () => {
    const result = await getCIDv1FromDigest(expectedU8Data);
    expect(result).toStrictEqual(expectedCIDString);
  });
});
