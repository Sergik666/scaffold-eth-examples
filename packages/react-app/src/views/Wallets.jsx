import React, { useState } from "react";
import WalletPreview from "../components/WalletPreview";
import CreateWalletModal from "../components/CreateWalletModal";
import { useContractReader } from "../hooks";

export default function Wallets({ readContracts, writeContracts, tx, mainnetProvider, localProvider, blockExplorer, price }) {

  const [isCreateWalletModalVisible, setIsCreateWalletModalVisible] = useState(false);

  let walletsAddress = useContractReader(readContracts, "MultiSigWalletsManager", "getAllWallets");
  if (walletsAddress) {
    walletsAddress = [...walletsAddress, ''];
  } else {
    walletsAddress = [''];
  }

  const showCreateWalletDialog = () => {
    setIsCreateWalletModalVisible(true);
  };

  const showWallet = (walletAddress) => {
    alert('Show wallet:' + walletAddress);
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
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {walletsAddress.map((walletAddress) =>
          <WalletPreview
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
