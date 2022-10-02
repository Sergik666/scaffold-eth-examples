import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import AddressInput from "./AddressInput";
import Address from "./Address";
import EtherInput from "./EtherInput";

export default function CreateWalletTransactionModal({
  visible,
  handleOk,
  mainnetProvider,
  blockExplorer,
  price,
  owners,
  signaturesRequired,
  modalMethodData,
  createTransactionCallback,
}) {

  const methodName = modalMethodData ? modalMethodData.methodName : null;
  const removeOwnerAddress = modalMethodData ? modalMethodData.removeOwnerAddress : null;
  const amount = modalMethodData ? modalMethodData.amount : null;

  const modeAddSigner = 'addSigner';
  const modeRemoveSigner = 'removeSigner';
  const modeUpdateSignaturesRequired = 'updateSignaturesRequired';
  const modeTransfer = 'transfer';

  const [newAddress, setNewAddress] = useState();
  const [newSignaturesRequired, setNewSignaturesRequired] = useState();
  const [transferAmount, setTransferAmount] = useState();

  const isAddressExist = () => {
    return methodName === modeAddSigner && newAddress && owners && owners.includes(newAddress);
  };

  const signaturesRequiredCount = () => {
    return newSignaturesRequired || signaturesRequired;
  }

  const isSignaturesRequiredCountNotValid = () => {
    if (methodName === modeAddSigner) {
      return signaturesRequiredCount() > owners.length + 1;
    }

    if (methodName === modeRemoveSigner) {
      return signaturesRequiredCount() > owners.length - 1;
    }

    return signaturesRequiredCount() > owners.length;
  }

  const confirmAvailable = () => {
    if (methodName === modeAddSigner) {
      return newAddress
        && owners && !owners.includes(newAddress)
        && signaturesRequiredCount() > 0
        && !isSignaturesRequiredCountNotValid();
    }

    if (methodName === modeRemoveSigner) {
      return signaturesRequiredCount() > 0 && !isSignaturesRequiredCountNotValid();
    }

    if (methodName === modeUpdateSignaturesRequired) {
      return signaturesRequiredCount() > 0 && !isSignaturesRequiredCountNotValid()
        && signaturesRequired !== signaturesRequiredCount();
    }

    if (methodName === modeTransfer) {
      return transferAmount && transferAmount > 0;
    }

    return false;
  };

  const title = () => {
    if (methodName === modeAddSigner) {
      return "Add Owner to Wallet";
    }

    if (methodName === modeRemoveSigner) {
      return "Remove Owner from Wallet";
    }

    if (methodName === modeUpdateSignaturesRequired) {
      return "Change Signatures Required Count";
    }

    if (methodName === modeTransfer) {
      return "Transfer Amount";
    }

    return "";
  }

  const renderAddress = () => {
    if (methodName === modeAddSigner) {
      return (<>
        <div style={{ margin: 8, padding: 8, display: 'flex' }}>

          <div style={{ flexGrow: 1 }}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="new owner address"
              style={{ flexGrow: 1 }}
              onChange={(address) => {
                setNewAddress(address);
              }}
            />

          </div>
        </div>

        {isAddressExist() ?
          <div style={{ color: 'red', margin: 8, padding: 8 }}>
            Address already exist in owners
          </div>
          : ''
        }
      </>);
    }

    if (methodName === modeRemoveSigner) {
      return (<div style={{ margin: 8, padding: 8, display: 'flex' }}>

        <div style={{ flexGrow: 1 }}>
          <Address
            address={removeOwnerAddress}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer} />
        </div>
      </div>);
    }

    if (methodName === modeTransfer) {
      return (<div style={{ margin: 8, padding: 8, display: 'flex' }}>

      <div style={{ flexGrow: 1 }}>
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="to address"
          style={{ flexGrow: 1 }}
          onChange={(address) => {
            setNewAddress(address);
          }}
        />

      </div>
    </div>);
    }
    return '';
  }

  const renderSignaturesRequired = () => {
    if (methodName === modeAddSigner || methodName === modeRemoveSigner || methodName === modeUpdateSignaturesRequired) {
      return (<>
        {isSignaturesRequiredCountNotValid() ?
          <div style={{ color: 'red', margin: 8, padding: 8 }}>
            Signatures required greater owners count
          </div>
          : ''
        }

        <div style={{ margin: 8, padding: 8 }}>
          Count of signatures required:
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Input
            ensProvider={mainnetProvider}
            placeholder="signatures"
            value={signaturesRequiredCount()}
            onChange={(e) => { setNewSignaturesRequired(e.target.value) }}
          />
        </div>
      </>);
    }
    return '';
  }

  const renderAmount = () => {
    if (methodName === modeTransfer) {
      return (<>
        <div style={{ margin: 8, padding: 8 }}>
          <EtherInput price={price} mode="USD" value={transferAmount} onChange={setTransferAmount} />
        </div>
      </>);
    }
    return '';
  }

  const confirm = () => {
    let args;
    let transactionTransferAmount = amount;
    let toAddress;
    if (methodName === modeAddSigner) {
      args = [newAddress, signaturesRequiredCount()];
    }

    if (methodName === modeRemoveSigner) {
      args = [removeOwnerAddress, signaturesRequiredCount()];
    }

    if (methodName === modeUpdateSignaturesRequired) {
      args = [signaturesRequiredCount()];
    }

    if (methodName === modeTransfer) {
      transactionTransferAmount = transferAmount;
      toAddress = newAddress;
    }

    createTransactionCallback(methodName, args, transactionTransferAmount, toAddress);
  }

  return (
    <Modal
      title={title()}
      visible={visible}
      onCancel={handleOk}
      destroyOnClose
      onOk={handleOk}
      footer={null}
      closable
      maskClosable
    >
      {renderAddress()}

      {renderSignaturesRequired()}

      {renderAmount()}

      <div style={{ margin: 8, padding: 8, display: 'flex' }}>
        <Button
          style={{ flexGrow: 1 }}
          disabled={!confirmAvailable()}
          onClick={() => {
            confirm();
          }}
        >Confirm</Button>
      </div>
    </Modal>
  );
};

