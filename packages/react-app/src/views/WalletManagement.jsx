import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { parseEther } from "@ethersproject/units";
import { Spin, List, Button } from "antd";
import QR from "qrcode.react";
import axios from "axios";
import { useExternalContractLoader, useContractReader } from "../hooks";
import { Address, Balance, CreateWalletTransactionModal } from "../components";
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
  const [modalCreateTransactionMethodData, setCreateTransactionModalMethodData] = useState();

  const { value: address } = useParams();

  const walletContract = useExternalContractLoader(userProvider, address, MetaMultiSigWalletABI);

  const signaturesRequired = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "signaturesRequired", 1000);
  const nonce = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "nonce", 1000);

  const showCreateTransactionModal = (methodName, removeOwnerAddress = null, amount = 0) => {
    setCreateTransactionModalMethodData({
      methodName,
      removeOwnerAddress,
      amount,
    });
  };

  const hideCreateTransactionModal = () => {
    setCreateTransactionModalMethodData(null);
  };

  const createTransaction = async (methodName, args, amount, toAddress) => {
    const to = toAddress != null ? toAddress : walletContract.address;
    const callData = methodName === "transfer" ? "0x00" : walletContract.interface.encodeFunctionData(methodName, args);
    const hash = await walletContract.getTransactionHash(nonce, to, parseEther("" + parseFloat(amount).toFixed(12)), callData);
    const signature = await userProvider.send("personal_sign", [hash, userAddress]);
    const recover = await walletContract.recover(hash, signature);
    const isOwner = await walletContract.isOwner(recover);
    if (isOwner) {
      const res = await axios.post(poolServerUrl, {
        // eslint-disable-next-line no-underscore-dangle
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

  const createTransactionCallback = async (methodName, args, amount, toAddress) => {
    await createTransaction(methodName, args, amount, toAddress);
    hideCreateTransactionModal();
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
      if (typeof userProvider !== "undefined") {
        userProvider.resetEventsBlock(1);
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
      <CreateWalletTransactionModal
        visible={modalCreateTransactionMethodData != null}
        handleOk={() => { hideCreateTransactionModal(); }}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        price={price}
        signaturesRequired={signaturesRequired}
        owners={owners}
        modalMethodData={modalCreateTransactionMethodData}
        createTransactionCallback={createTransactionCallback}
      />
      <div className="wallet-management">
        <div className="wallet-information">
          <h2 className="owners">Wallet</h2>
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
          <Button
            className="transfer-amount"
            style={{ flexGrow: 1 }}
            onClick={() => {
              showCreateTransactionModal('transfer');
            }}
          >
            Transfer Amount
          </Button>

        </div>

        <div className="wallet-owners">

          <h2 className="owners">Owners</h2>

          <List
            style={{ maxWidth: 550, marginLeft: 20 }}
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
                      disabled={!owners || owners.length <= 1}
                      onClick={() => {
                        showCreateTransactionModal('removeSigner', item);
                      }}
                    >x</Button>
                  </List.Item>
                  :
                  <List.Item key={"owner_" + item}>
                    <Button
                      style={{ flexGrow: 1 }}
                      onClick={() => {
                        showCreateTransactionModal('addSigner');
                      }}
                    >+</Button>
                  </List.Item>
              )
            }}
          />

          <Button
            className="signatures-required"
            style={{ flexGrow: 1 }}
            onClick={() => {
              showCreateTransactionModal('updateSignaturesRequired');
            }}
          >
            Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin />}
          </Button>

        </div>

        <div className="wallet-transaction">
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
