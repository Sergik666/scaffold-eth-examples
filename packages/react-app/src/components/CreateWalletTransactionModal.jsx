import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import AddressInput from "./AddressInput";
import Address from "./Address";

export default function CreateWalletTransactionModal({
  visible,
  handleOk,
  mainnetProvider,
  blockExplorer,
  owners,
  signaturesRequired,
  mode,
  addOwnerAddress,
  removeAddress,
  removeOwnerAddress,
}) {

  const modeAdd = 'add';
  const modeRemove = 'remove';

  const [newAddress, setNewAddress] = useState();
  const [newSignaturesRequired, setNewSignaturesRequired] = useState();

  const isAddressExist = () => {
    return mode === modeAdd && newAddress && owners && owners.includes(newAddress);
  };

  const signaturesRequiredCount = () => {
    return newSignaturesRequired || signaturesRequired;
  }

  const isSignaturesRequiredCountNotValid = () => {
    return signaturesRequiredCount() > owners.length + 1;
  }

  const confirmAvailable = () => {
    if (mode === modeAdd) {
      return newAddress
        && owners && !owners.includes(newAddress)
        && signaturesRequiredCount() > 0
        && !isSignaturesRequiredCountNotValid();
    }

    if (mode === modeRemove) {
      return signaturesRequiredCount() > 0 && !isSignaturesRequiredCountNotValid();

    }

    return false;
  };

  const title = () => {
    if (mode === modeAdd) {
      return "Add Owner to Wallet";
    }

    if (mode === modeRemove) {
      return "Remove Owner from Wallet";
    }

    return "";
  }

  const renderAddress = () => {
    if (mode === modeAdd) {
      return (<div style={{ margin: 8, padding: 8, display: 'flex' }}>

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
      </div>)
    }

    if (mode === modeRemove) {
      return (<div style={{ margin: 8, padding: 8, display: 'flex' }}>

        <div style={{ flexGrow: 1 }}>
          <Address
            address={removeAddress}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer} />
        </div>
      </div>)
    }
    return ''
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

      {isAddressExist() ?
        <div style={{ color: 'red', margin: 8, padding: 8 }}>
          Address already exist in owners
        </div>
        : ''
      }

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
      <div style={{ margin: 8, padding: 8, display: 'flex' }}>
        <Button
          style={{ flexGrow: 1 }}
          disabled={!confirmAvailable()}
          onClick={() => {
            if (mode === modeAdd) {
              addOwnerAddress(newAddress, signaturesRequiredCount());
            }
            if (mode === modeRemove) {
              removeOwnerAddress(removeAddress, signaturesRequiredCount());
            }
          }}
        >Confirm</Button>
      </div>
    </Modal>
  );
};

