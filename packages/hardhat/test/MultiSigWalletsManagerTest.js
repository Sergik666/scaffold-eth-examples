const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MultiSigWalletsManager", () => {
  let multiSigWalletsManager;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  let provider;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    provider = owner.provider;
  });

  describe("Deployment", () => {

    beforeEach(async function () {
      const multiSigWalletsManagerFactory = await ethers.getContractFactory("MultiSigWalletsManager");

      multiSigWalletsManager = await multiSigWalletsManagerFactory.deploy();
    });

    it("check is address exist", async () => {
      expect(multiSigWalletsManager.address).to.not.equal(0x0);
    });
  });

  describe("Basic create wallet", () => {

    it("Check no wallets", async () => {
      expect(await multiSigWalletsManager.getWalletsCount()).to.equal(0);
    });

    let walletAddress;

    it("Create wallet", async () => {

      const { chainId } = await provider.getNetwork();
      const transaction = await multiSigWalletsManager.createWallet(chainId, [owner.address], 1);
      const txReceipt = await transaction.wait();

      const logDescription = multiSigWalletsManager.interface.parseLog(
        txReceipt.logs.find(log => log.address === multiSigWalletsManager.address)
      );

      const args = logDescription.args;
      expect(args.length).to.equal(4);
      expect(args[0]).to.equal(0);
      expect(args[1]).to.not.equal(0x0);
      expect(args[2]).to.deep.equal([owner.address]);
      expect(args[3]).to.equal(1);

      walletAddress = logDescription.args[1];
    });

    it("Check wallet count", async () => {
      expect(await multiSigWalletsManager.getWalletsCount()).to.equal(1);
    });

    it("Check get wallet", async () => {
      expect(await multiSigWalletsManager.getWallet(0)).to.equal(walletAddress);
    });

    it("Create wallet 2 owners", async () => {

      const { chainId } = await provider.getNetwork();
      const transaction = await multiSigWalletsManager.createWallet(
        chainId,
        [owner.address, addr1.address],
        2,
      );

      const txReceipt = await transaction.wait();

      const logDescription = multiSigWalletsManager.interface.parseLog(
        txReceipt.logs.find(log => log.address === multiSigWalletsManager.address)
      );

      const args = logDescription.args;
      expect(args.length).to.equal(4);
      expect(args[0]).to.equal("1");
      expect(args[1]).to.not.equal(0x0);
      expect(args[2]).to.deep.equal([owner.address, addr1.address]);
      expect(args[3]).to.equal(2);

      walletAddress = logDescription.args[1];
    });

    it("Check wallet 2 owners", async () => {
      const metaMultiSigWallet = await ethers.getContractFactory("MetaMultiSigWallet");
      const contract = await metaMultiSigWallet.attach(walletAddress);

      expect(await contract.isOwner(owner.address)).to.equal(true);
      expect(await contract.isOwner(addr1.address)).to.equal(true);
      expect(await contract.isOwner(addr2.address)).to.equal(false);
    });

  });
});
