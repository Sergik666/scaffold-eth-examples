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
import { Contract } from "@ethersproject/contracts";

export default function RebirthUI(props) {

  const {
    address,
    readContracts,
    writeContracts,
    localProvider,
    mainnetProvider,
    blockExplorer,
    tx,
  } = props;

  const rebirthDeployedEvents = useEventListener(readContracts, "Rebirth", "Deployed", localProvider, 1);
  console.log("📟 Rebirth Transfer Deployed:", rebirthDeployedEvents);

  const [contractDeployerDeployedEvents, setContractDeployerDeployedEvents] = useState([]);
  console.log("📟 Contract Deployer Transfer Deployed:", contractDeployerDeployedEvents);

  const loadContractByAddress = (address, contractName, signer, abi) => {
    const newContract = new Contract(
      address,
      abi ? abi : require(`../contracts/${contractName}.abi.js`),
      signer,
    );
    try {
      newContract.bytecode = require(`../contracts/${contractName}.bytecode.js`);
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

      const signer = localProvider.getSigner();
      const loadedContractDeployer = loadContractByAddress(contractAddress, "ContractDeployer", signer);
      setContractDeployer(loadedContractDeployer);
      setContractDeployerExist(await checkContractExistence(localProvider, contractAddress));
      loadedContractDeployer.on("Deployed", (...args) => {
        const blockNumber = args[args.length - 1].blockNumber;
        //setContractDeployerDeployedEvents(messages => [{ blockNumber, ...args.pop().args }, ...messages]);
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

      const signer = localProvider.getSigner();
      let loadedContractMain = ""
      if (contractMainName) {
        loadedContractMain = loadContractByAddress(contractMainAddress, contractMainName, signer);
      } else {
        // const abi = `[{"inputs": [],"name": "destroy","outputs": [],"stateMutability": "nonpayable","type": "function"}]`;
        // setContractDeployer(loadContractByAddress(contractMainAddress, "", signer, abi));
      }

      setContractMain(loadedContractMain);

      let loadedContractMainName = "";
      if (loadedContractMain) {
        loadedContractMainName = await loadedContractMain.getName();
      }
      setContractMainNameFromMethod(loadedContractMainName);
      // const isContractMainExist = await checkContractExistence(localProvider, contractMainAddress);
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
        gap: "10px"
      }}>
        <span>Deploy contract deployer</span>
        <Button
          type="primary"
          disabled={contractDeployerExist}
          onClick={() => {
            tx(writeContracts.Rebirth.deploy());
            setMainContractCreated(false);
          }}
        >
          Deploy
        </Button>
      </div>

      <h2>Deploy Contract</h2>
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
        gap: "10px"
      }}>
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist || mainContractCreated}
          onClick={async () => {
            setContractMainName("ContractA");
            await tx(contractDeployer.deployContractA());
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
            await tx(contractDeployer.deployContractB());
            setMainContractCreated(true);
          }}
        >
          Deploy Contract B
        </Button>
        <Button
          type="primary"
          disabled={!contractDeployerExist || contractMainExist}
          onClick={async () => {
            await tx(contractDeployer.destroy());
            setContractDeployerExist(await checkContractExistence(localProvider, contractDeployer.address));
          }}
        >
          Destroy
        </Button>
      </div>

      <h2>Contract Main</h2>
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
            await tx(contractMain.destroy());
            if (contractMainAddress) {
              setContractMainExist(await checkContractExistence(localProvider, contractMainAddress));
            }
          }}
        >
          Destroy
        </Button>
      </div>
    </div>

  );
}
