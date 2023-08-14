import { create } from 'ipfs-core'
import { getIPFSDataFromContentID } from "../index";

describe('getIPFSDataFromContentID with real IPFS', () => {
  
  let ipfs;
  let cid;

  beforeAll(async () => {
    jest.setTimeout(60000);
    ipfs = await create()

    // Add sample data to IPFS and get the CID for testing
    const { cid: newCid } = await ipfs.add('Hello World');
    cid = newCid.toString();
  });

  afterAll(async () => {
    await ipfs.stop();
  });

  it('should fetch and return correct data from IPFS based on CID', async () => {
    const result = await getIPFSDataFromContentID(ipfs, cid);

    expect(result).toBe('Hello World');
  });
});
