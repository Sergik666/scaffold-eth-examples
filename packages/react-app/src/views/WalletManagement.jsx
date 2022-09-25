import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Spin, List, Button } from "antd";
import QR from "qrcode.react";
import axios from "axios";
import { useExternalContractLoader, useContractReader } from "../hooks";
import { Address, Balance, AddOwnerWalletModal } from "../components";
import MetaMultiSigWalletABI from "../contracts/MetaMultiSigWallet.abi";
import './WalletManagement.css';

export default function WalletManagement({
  userProvider,
  userAddress,
  mainnetProvider,
  localProvider,
  poolServerUrl,
  blockExplorer,
  price,
}) {

  const [owners, setOwners] = useState([]);
  const [isAddOwnerWalletModalVisible, setIsAddOwnerWalletModalVisible] = useState(false);

  const { value: address } = useParams();

  const walletContract = useExternalContractLoader(localProvider, address, MetaMultiSigWalletABI);

  const showAddOwnerModal = () => {
    setIsAddOwnerWalletModalVisible(true);
  };

  const addOwnerAddress = async (newAddress, signaturesRequired) => {
    const nonce = await walletContract.nonce();
    const to = walletContract.address;
    const value = 0;
    const callData = walletContract.interface.encodeFunctionData("addSigner",[newAddress, signaturesRequired]);
    const hash = await walletContract.getTransactionHash(nonce, to, value, callData);
    const signature = await userProvider.send("personal_sign", [hash, userAddress]);
    const recover = await walletContract.recover(hash, signature);
    const isOwner = await walletContract.isOwner(recover);
    if (isOwner) {
      const res = await axios.post(poolServerUrl, {
        chainId: localProvider._network.chainId,
        address: walletContract.address,
        nonce: nonce.toNumber(),
        to,
        amount: value,
        data: callData,
        hash,
        signatures: [signature],
        signers: [recover],
      });
      console.log(res.data.hash);
    }
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

  const signaturesRequired = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "signaturesRequired", 1000);

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

      </div>
    </>
  )
}
