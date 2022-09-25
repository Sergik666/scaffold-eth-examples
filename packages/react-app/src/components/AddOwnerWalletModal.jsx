import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import AddressInput from "./AddressInput";

export default function AddOwnerWalletModal({ visible, handleOk, mainnetProvider, owners, signaturesRequired, addOwnerAddress }) {

  const [newAddress, setNewAddress] = useState();
  const [newSignaturesRequired, setNewSignaturesRequired] = useState();

  const isAddressExist = () => {
    return newAddress && owners && owners.includes(newAddress);
  };

  const signaturesRequiredCount = () => {
    return newSignaturesRequired || signaturesRequired;
  }

  const isSignaturesRequiredCountNotValid = () => {
    return signaturesRequiredCount() > owners.length + 1;
  }

  const canAddAddress = () => {
    return newAddress
      && owners && !owners.includes(newAddress)
      && signaturesRequiredCount() > 0
      && !isSignaturesRequiredCountNotValid();
  };

  return (
    <Modal
      title="Add Owner to Wallet"
      visible={visible}
      onCancel={handleOk}
      destroyOnClose
      onOk={handleOk}
      footer={null}
      closable
      maskClosable
    >
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
          disabled={!canAddAddress()}
          onClick={() => {
            addOwnerAddress(newAddress, signaturesRequiredCount());
          }}
        >Add</Button>
      </div>
    </Modal>
  );
};

