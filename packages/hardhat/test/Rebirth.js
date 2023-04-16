const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Rebirth", function () {

  const SaltValue = "Test";

  async function deployRebirthFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Rebirth = await ethers.getContractFactory("Rebirth");
    const rebirth = await Rebirth.deploy(SaltValue);

    return { rebirth, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Check salt", async function () {
      const { rebirth } = await loadFixture(deployRebirthFixture);

      const expectedSalt = ethers.utils.formatBytes32String(SaltValue);

      expect(await rebirth.SALT()).to.equal(expectedSalt);
    });

    it("Check address", async function () {
      const { rebirth } = await loadFixture(deployRebirthFixture);

      // console.log(`calculateContractAddress: ${await rebirth.calculateContractAddress()}`);;

      const deployTx = await rebirth.deploy();
      const deployReceipt = await deployTx.wait();
      const contractDeployerAddress = deployReceipt.events[0].args.contractAddress;

      expect(await rebirth.calculateContractAddress()).to.equal(contractDeployerAddress);
    });
  });

  describe("ContractDeployer", function () {

    it("Check address", async function () {
      const { rebirth } = await loadFixture(deployRebirthFixture);

      const deployTx = await rebirth.deploy();
      const deployReceipt = await deployTx.wait();
      const contractDeployerAddress = deployReceipt.events[0].args.contractAddress;
      console.log(`Deployed ContractDeployer address: ${contractDeployerAddress}`);

      const contractDeployer = await ethers.getContractAt(
        "ContractDeployer",
        contractDeployerAddress
      );

      const deployContractATx = await contractDeployer.deployContractA();
      const deployContractAReceipt = await deployContractATx.wait();
      const contractAAddress = deployContractAReceipt.events[0].args.contractAddress;
      console.log(`Deployed ContractA address: ${contractAAddress}`);

      const contractA = await ethers.getContractAt(
        "ContractA",
        contractAAddress
      );

      await contractA.destroy();
      await contractDeployer.destroy();

      const deploy2Tx = await rebirth.deploy();
      const deploy2Receipt = await deploy2Tx.wait();
      const contractDeployer2Address = deploy2Receipt.events[0].args.contractAddress;
      console.log(`Deployed ContractDeployer2 address: ${contractDeployer2Address}`);

      const contractDeployer2 = await ethers.getContractAt(
        "ContractDeployer",
        contractDeployer2Address
      );

      const deployContractBTx = await contractDeployer2.deployContractB();
      const deployContractBReceipt = await deployContractBTx.wait();
      const contractBAddress = deployContractBReceipt.events[0].args.contractAddress;
      console.log(`DeployedContractB address: ${contractBAddress}`);

      expect(contractAAddress).to.equal(contractBAddress);

      const contractB = await ethers.getContractAt(
        "ContractB",
        contractBAddress
      );

      await contractB.destroy();
      await contractDeployer2.destroy();

      const deploy3Tx = await rebirth.deploy();
      const deploy3Receipt = await deploy3Tx.wait();
      const contractDeployer3Address = deploy3Receipt.events[0].args.contractAddress;
      console.log(`Deployed ContractDeployer3 address: ${contractDeployer3Address}`);

      const contractDeployer3 = await ethers.getContractAt(
        "ContractDeployer",
        contractDeployer3Address
      );

      const contractByteCode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506101c1806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806317d7de7c1461003b57806383197ef014610059575b600080fd5b610043610063565b6040516100509190610169565b60405180910390f35b6100616100a0565b005b60606040518060400160405280601b81526020017f4d79206e616d652069732042797465436f6465436f6e74726163740000000000815250905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b600081519050919050565b600082825260208201905092915050565b60005b838110156101135780820151818401526020810190506100f8565b60008484015250505050565b6000601f19601f8301169050919050565b600061013b826100d9565b61014581856100e4565b93506101558185602086016100f5565b61015e8161011f565b840191505092915050565b600060208201905081810360008301526101838184610130565b90509291505056fea2646970667358221220aeb8bfbd7cca8b7d98814f094b487ae7b971a70e0676b83e383cdf3298fec7f864736f6c63430008130033";

      // const ContractDeployer = await ethers.getContractRebirth("ContractDeployer");
      // const contractByteCode = ContractDeployer.bytecode;
      // console.log(contractByteCode );

      const deployContractByteCodeTx = await contractDeployer3.deployContractFromByteCode(contractByteCode);
      const deployContractByteCodeReceipt = await deployContractByteCodeTx.wait();
      const contractByteCodeAddress = deployContractByteCodeReceipt.events[0].args.contractAddress;
      console.log(`Deployed Contract bytecode address: ${contractByteCodeAddress}`);

      expect(contractAAddress).to.equal(contractByteCodeAddress);

    });

  });

});
