import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Spin, List, Button } from "antd";
import QR from "qrcode.react";
import axios from "axios";
import { useExternalContractLoader, useContractReader } from "../hooks";
import { Address, Balance, AddOwnerWalletModal } from "../components";
import Transactions from "./Transactions";
import MetaMultiSigWalletABI from "../contracts/MetaMultiSigWallet.abi";
import './WalletManagement.css';

export default function WalletManagement({
  userProvider,
  userAddress,
  mainnetProvider,
  localProvider,
  poolServerUrl,
  blockExplorer,
  tx,
  price,
}) {

  const [owners, setOwners] = useState([]);
  const [isAddOwnerWalletModalVisible, setIsAddOwnerWalletModalVisible] = useState(false);

  const { value: address } = useParams();

  const walletContract = useExternalContractLoader(userProvider, address, MetaMultiSigWalletABI);

  const signaturesRequired = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "signaturesRequired", 1000);
  const nonce = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "nonce", 1000);

  const showAddOwnerModal = () => {
    setIsAddOwnerWalletModalVisible(true);
  };

  const createTransaction = async (methodName, args, amount) => {
    const to = walletContract.address;
    const callData = walletContract.interface.encodeFunctionData(methodName, args);
    const hash = await walletContract.getTransactionHash(nonce, to, amount, callData);
    const signature = await userProvider.send("personal_sign", [hash, userAddress]);
    const recover = await walletContract.recover(hash, signature);
    const isOwner = await walletContract.isOwner(recover);
    if (isOwner) {
      const res = await axios.post(poolServerUrl, {
        chainId: localProvider._network.chainId,
        address: walletContract.address,
        nonce: nonce.toNumber(),
        to,
        amount,
        data: callData,
        hash,
        signatures: [signature],
        signers: [recover],
      });
      console.log(res.data.hash);
    }
  };

  const addOwnerAddress = async (newAddress, signaturesRequiredCount) => {
    await createTransaction("addSigner", [newAddress, signaturesRequiredCount], 0);
  };

  const removeOwnerAddress = async (ownerAddress, signaturesRequiredCount) => {
    await createTransaction("removeSigner", [ownerAddress, signaturesRequiredCount], 0);
  };

  const updateOwners = (ownerAddress, add) => {
    const index = owners.indexOf(ownerAddress)
    if (index !== -1 && !add) {
      owners.splice(index, 1);
      setOwners(owners);
    }
    if (index === -1 && add) {
      owners.push(ownerAddress);
      setOwners(owners);
    }
  }

  useEffect(() => {

    const ownerEvent = (...[ownerAddress, add]) => {
      updateOwners(ownerAddress, add);
    };

    if (walletContract) {
      if (typeof localProvider !== "undefined") {
        localProvider.resetEventsBlock(1);
      }

      walletContract.on("Owner", ownerEvent);
    }

    return () => {
      if (walletContract) {
        walletContract.off("Owner", ownerEvent);
      }
    }

  }, [walletContract]);


  return (
    <>
      <AddOwnerWalletModal
        visible={isAddOwnerWalletModalVisible}
        handleOk={() => { setIsAddOwnerWalletModalVisible(false); }}
        mainnetProvider={mainnetProvider}
        signaturesRequired={signaturesRequired}
        owners={owners}
        addOwnerAddress={addOwnerAddress}
      />
      <div className="wallet-management">
        <div className="wallet-information">
          <div>
            <Address
              address={address}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={32}
            />
          </div>

          <div>
            <QR
              value={address}
              size={180}
              level="H"
              includeMargin
              renderAs="svg"
            />
          </div>

          <div>
            <Balance
              address={address}
              provider={localProvider}
              dollarMultiplier={price}
              fontSize={32}
            />
          </div>

        </div>

        <div className="wallet-owners">

          <h2 className="owners">Owners:</h2>

          <List
            style={{ maxWidth: 400, margin: "auto" }}
            bordered
            dataSource={[...owners, '']}
            renderItem={(item) => {
              return (
                item ?
                  <List.Item key={"owner_" + item}>
                    <Address
                      address={item}
                      ensProvider={mainnetProvider}
                      blockExplorer={blockExplorer}
                      size="short"
                      fontSize={16}
                    />
                    <Button
                      disabled="true"
                      onClick={() => {
                        console.log('del');
                      }}
                    >x</Button>
                  </List.Item>
                  :
                  <List.Item key={"owner_" + item}>
                    <Button
                      style={{ flexGrow: 1 }}
                      onClick={() => {
                        showAddOwnerModal();
                      }}
                    >+</Button>
                  </List.Item>
              )
            }}
          />

          <h2 className="signatures-required">
            Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin />}
          </h2>

        </div>

        <div>
          <Transactions
            poolServerUrl={poolServerUrl}
            contractName="MetaMultiSigWallet"
            address={userAddress}
            userProvider={userProvider}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            price={price}
            tx={tx}
            writeContracts={walletContract ? { MetaMultiSigWallet: walletContract } : null}
            readContracts={walletContract ? { MetaMultiSigWallet: walletContract } : null}
            blockExplorer={blockExplorer}
            nonce={nonce}
            signaturesRequired={signaturesRequired}
          />
        </div>

      </div>
    </>
  )
}
