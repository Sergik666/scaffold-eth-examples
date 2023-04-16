import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,
} from "../hooks";
import Address from "./Address";
import AddressInput from "./AddressInput";
import { Contract } from "@ethersproject/contracts";

export default function RebirthUI(props) {

  const {
    address,
    readContracts,
    writeContracts,
    localProvider,
    userProvider,
    mainnetProvider,
    blockExplorer,
    tx,
    debug,
  } = props;

  const rebirthDeployedEvents = useEventListener(readContracts, "Rebirth", "Deployed", localProvider, 1);
  if (debug) {
    console.log("📟 Rebirth Transfer Deployed:", rebirthDeployedEvents);
  }

  const [contractDeployerDeployedEvents, setContractDeployerDeployedEvents] = useState([]);
  if (debug) {
    console.log("📟 Contract Deployer Transfer Deployed:", contractDeployerDeployedEvents);
  }

  const loadContractByAddress = (address, contractName, signer, abi, bytecode) => {
    const newContract = new Contract(
      address,
      abi ? abi : require(`../contracts/${contractName}.abi.js`),
      signer,
    );
    try {
      newContract.bytecode = bytecode ? bytecode : require(`../contracts/${contractName}.bytecode.js`);
    } catch (e) {
      console.log(e);
    }
    return newContract;
  };

  const checkContractExistence = async (localProvider, contractAddress) => {
    const code = await localProvider.getCode(contractAddress);
    return code !== '0x';
  }

  const [contractRebirthAddress, setContractRebirthAddress] = useState();

  const [contractDeployer, setContractDeployer] = useState();
  const [contractDeployerAddress, setContractDeployerAddress] = useState();
  const [contractDeployerExist, setContractDeployerExist] = useState();

  const [contractMainName, setContractMainName] = useState();
  const [contractMain, setContractMain] = useState();
  const [contractMainAddress, setContractMainAddress] = useState();
  const [contractMainExist, setContractMainExist] = useState();

  const [contractMainNameFromMethod, setContractMainNameFromMethod] = useState();

  const [mainContractCreated, setMainContractCreated] = useState();

  const [bytecode, setBytecode] = useState("0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506101c1806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806317d7de7c1461003b57806383197ef014610059575b600080fd5b610043610063565b6040516100509190610169565b60405180910390f35b6100616100a0565b005b60606040518060400160405280601b81526020017f4d79206e616d652069732042797465436f6465436f6e74726163740000000000815250905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b600081519050919050565b600082825260208201905092915050565b60005b838110156101135780820151818401526020810190506100f8565b60008484015250505050565b6000601f19601f8301169050919050565b600061013b826100d9565b61014581856100e4565b93506101558185602086016100f5565b61015e8161011f565b840191505092915050565b600060208201905081810360008301526101838184610130565b90509291505056fea2646970667358221220aeb8bfbd7cca8b7d98814f094b487ae7b971a70e0676b83e383cdf3298fec7f864736f6c63430008130033");
  /*
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract ByteCodeContract {
    address parent;

    constructor() {
        parent = msg.sender;
    }
    
    function getName() external pure returns (string memory) {
        return "My name is ByteCodeContract";
    }

    function destroy() external {
        selfdestruct(payable(parent));
    }
}
  */

  const [destroyAddress, setDestroyAddress] = useState();

  useEffect(() => {
    const updateRebirth = async () => {
      if (readContracts == null) {
        return;
      }
      setContractRebirthAddress(readContracts.Rebirth.address)

      const contractAddress = await readContracts.Rebirth.calculateContractAddress();
      setContractDeployerAddress(contractAddress);

      if (contractDeployer) {
        contractDeployer.removeListener("Deployed");
      }

      const signer = userProvider.getSigner();
      const loadedContractDeployer = loadContractByAddress(contractAddress, "ContractDeployer", signer);
      setContractDeployer(loadedContractDeployer);
      setContractDeployerExist(await checkContractExistence(localProvider, contractAddress));
      loadedContractDeployer.on("Deployed", (...args) => {
        const blockNumber = args[args.length - 1].blockNumber;
        setContractDeployerDeployedEvents([{ blockNumber, ...args.pop().args }]);
      });
    };
    updateRebirth();
  }, [address, readContracts, rebirthDeployedEvents]);

  useEffect(() => {
    const updateContractDeployer = async () => {
      if (contractDeployerDeployedEvents == null || contractDeployerDeployedEvents.length == 0) {
        return;
      }

      const lastEvent = contractDeployerDeployedEvents[contractDeployerDeployedEvents.length - 1];
      if (lastEvent == null) {
        return;
      }

      const contractMainAddress = lastEvent[0];
      setContractMainAddress(contractMainAddress);

      const signer = userProvider.getSigner();
      let loadedContractMain = ""
      if (contractMainName) {
        loadedContractMain = loadContractByAddress(contractMainAddress, contractMainName, signer);
      } else {
        const abi = `[{"inputs": [],"name": "destroy","outputs": [],"stateMutability": "nonpayable","type": "function"}, {"inputs": [],"name": "getName","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "pure","type": "function"}]`;
        loadedContractMain = loadContractByAddress(contractMainAddress, "", signer, abi, bytecode);
      }

      setContractMain(loadedContractMain);

      let loadedContractMainName = "";
      if (loadedContractMain) {
        try {
          loadedContractMainName = await loadedContractMain.getName();
        }
        catch (error) {
          console.error(error);
        }
      }

      setContractMainNameFromMethod(loadedContractMainName);
      setContractMainExist(await checkContractExistence(localProvider, contractMainAddress));
    };
    updateContractDeployer();
  }, [address, contractDeployerDeployedEvents]);

  return (
    <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Rebirth Contract</h2>
      <Address
        address={contractRebirthAddress}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={16}
      />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        paddingTop: "10px",
      }}>
        <span>Deploy contract deployer</span>
        <Button
          type="primary"
          disabled={contractDeployerExist}
          onClick={async () => {
            const resultTx = await tx(writeContracts.Rebirth.deploy());
            const result = await resultTx.wait();
            setMainContractCreated(false);
          }}
        >
          Deploy
        </Button>
      </div>

      <h2 style={{
        paddingTop: "20px",
      }}>Deploy Contract</h2>
      <Address
        address={contractDeployerAddress}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={16}
      />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        paddingTop: "10px",
      }}>
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist || mainContractCreated}
          onClick={async () => {
            setContractMainName("ContractA");
            const resultTx = await tx(contractDeployer.deployContractA());
            const result = await resultTx.wait();
            setMainContractCreated(true);
          }}
        >
          Deploy Contract A
        </Button>
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist || mainContractCreated}
          onClick={async () => {
            setContractMainName("ContractB");
            const resultTx = await tx(contractDeployer.deployContractB());
            const result = await resultTx.wait();
            setMainContractCreated(true);
          }}
        >
          Deploy Contract B
        </Button>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        paddingTop: "10px",
      }}>
        <span
          style={{
            whiteSpace: "nowrap",
          }}
        >Contract bytecode: </span>
        <Input
          placeholder="Bytecode"
          value={bytecode}
          onChange={(event) => {
            setBytecode(event.target.value);
          }}
        />
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist || mainContractCreated || !bytecode}
          onClick={async () => {
            setContractMainName("");
            const resultTx = await tx(contractDeployer.deployContractFromByteCode(bytecode, { gasLimit: 3000000 }));
            const result = await resultTx.wait();
            setMainContractCreated(true);
          }}
        >
          Deploy Bytecode
        </Button>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        paddingTop: "10px",
      }}>
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist}
          onClick={async () => {
            const resultTx = await tx(contractDeployer.destroy());
            const result = await resultTx.wait();
            setContractDeployerExist(await checkContractExistence(localProvider, contractDeployer.address));
          }}
        >
          Destroy
        </Button>
      </div>
      <h2 style={{
        paddingTop: "20px",
      }}
      >Main Contract</h2>
      <Address
        address={contractMainAddress}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={16}
      />
      <p>Contract name: {contractMainNameFromMethod}</p>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px"
      }}>
        <Button
          type="primary"
          disabled={!contractMainExist}
          onClick={async () => {
            const resultTx = await tx(contractMain.destroy());
            const result = await resultTx.wait();
            if (contractMainAddress) {
              setContractMainExist(await checkContractExistence(localProvider, contractMainAddress));
            }
          }}
        >
          Destroy
        </Button>
      </div>

      <h2 style={{
        paddingTop: "20px",
      }}
      >Debug</h2>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px"
      }}>
        <AddressInput
          placeholder="Destroy address"
          address={destroyAddress}
          onChange={setDestroyAddress}
        />
        <Button
          type="primary"
          disabled={!destroyAddress}
          onClick={async () => {
            const signer = userProvider.getSigner();
            const abi = `[{"inputs": [],"name": "destroy","outputs": [],"stateMutability": "nonpayable","type": "function"}]`;
            const contract = loadContractByAddress(destroyAddress, "", signer, abi, bytecode);
            const resultTx = await tx(contract.destroy());
            const result = await resultTx.wait();
          }}
        >
          Destroy
        </Button>
      </div>
    </div>

  );
}
