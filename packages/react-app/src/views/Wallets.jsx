import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import WalletPreview from "../components/WalletPreview";
import CreateWalletModal from "../components/CreateWalletModal";
import { useContractReader } from "../hooks";

export default function Wallets({ readContracts, writeContracts, tx, mainnetProvider, localProvider, blockExplorer, price, walletsAddress }) {

  const [isCreateWalletModalVisible, setIsCreateWalletModalVisible] = useState(false);

  let walletsAddressWithEmptyAddress = walletsAddress;
  if (walletsAddressWithEmptyAddress) {
    walletsAddressWithEmptyAddress = [...walletsAddress, ''];
  } else {
    walletsAddressWithEmptyAddress = [''];
  }

  const showCreateWalletDialog = () => {
    setIsCreateWalletModalVisible(true);
  };

  const history = useHistory();

  const showWallet = (walletAddress) => {

    history.push(`/wallet/${walletAddress}`);
  };

  const createWallet = async (wallets, signaturesRequired) => {
    const { chainId } = await mainnetProvider.getNetwork();
    if(await tx(writeContracts['MultiSigWalletsManager'].createWallet(chainId, wallets, signaturesRequired)))
    { 
      setIsCreateWalletModalVisible(false); 
    }
  };

  return (
    <>
      <CreateWalletModal
        visible={isCreateWalletModalVisible}
        handleOk={() => { setIsCreateWalletModalVisible(false); }}
        mainnetProvider={mainnetProvider}
        createWallet={createWallet}
        key='new'
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {walletsAddressWithEmptyAddress.map((walletAddress) =>
          <WalletPreview
            key={walletAddress}
            style={{ padding: '10px' }}
            address={walletAddress}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            blockExplorer={blockExplorer}
            price={price}
            onClick={() => {
              if (walletAddress) {
                showWallet(walletAddress);
              } else {
                showCreateWalletDialog();
              };
            }}
          />
        )}
      </div>
    </>
  );
}
