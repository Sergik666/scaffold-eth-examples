import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import AddressInput from "./AddressInput";

export default function CreateWalletModal({ visible, handleOk, mainnetProvider, createWallet }) {

  const [wallets, setWallets] = useState(['']);
  const [signaturesRequired, setSignaturesRequired] = useState(1);

  return (
    <Modal
      title="Create Wallet"
      visible={visible}
      onCancel={handleOk}
      destroyOnClose
      onOk={handleOk}
      footer={null}
      closable
      maskClosable
    >
      <div style={{ margin: 8, padding: 8 }}>
        Owners:
      </div>
      {wallets.map((wallet, index) =>
        <div key={wallet} style={{ margin: 8, padding: 8, display: 'flex' }}>
          <div style={{ flexGrow: 1 }}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="new owner address"
              style={{ flexGrow: 1 }}
              value={wallet}
              onChange={(address) => {
                const newWallets = [...wallets];
                newWallets[index] = address;
                setWallets(newWallets);
              }}
            />
          </div>
          <Button
            style={{ marginLeft: 5 }}
            disabled={wallets.length < 2}
            onClick={() => {
              setWallets([
                ...wallets.slice(0, index),
                ...wallets.slice(index + 1)
              ]);
            }}
          >x</Button>
        </div>
      )}
      <div style={{ margin: 8, padding: 8, display: 'flex' }}>
        <Button
          style={{ flexGrow: 1 }}
          onClick={() => {
            setWallets([...wallets, '']);
          }}
        >+</Button>
      </div>
      <div style={{ margin: 8, padding: 8 }}>
        Count of signatures required:
      </div>
      <div style={{ margin: 8, padding: 8 }}>
        <Input
          ensProvider={mainnetProvider}
          placeholder="signatures"
          value={signaturesRequired}
          onChange={(e) => { setSignaturesRequired(e.target.value) }}
        />
      </div>
      <div style={{ margin: 8, padding: 8, display: 'flex' }}>
        <Button
          style={{ flexGrow: 1 }}
          onClick={() => {
            createWallet(wallets, signaturesRequired);
          }}
        >Create</Button>
      </div>
    </Modal>
  );
};

