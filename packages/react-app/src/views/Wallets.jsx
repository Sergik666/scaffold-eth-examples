import React from "react";
import WalletPreview from "../components/WalletPreview";

export default function Wallets({ mainnetProvider, localProvider, blockExplorer, price }) {

  let walletsAddress = [
    // '0x6F77D0bCD7a9C3D4344000aBa4015b2880ce16C2',
    // '0x6F77D0bCD7a9C3D4344000aBa4015b2880ce16C2',
    // '0x6F77D0bCD7a9C3D4344000aBa4015b2880ce16C2',
    // '0x6F77D0bCD7a9C3D4344000aBa4015b2880ce16C2',
  ];

  walletsAddress = [...walletsAddress, ''];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      {walletsAddress.map((walletAddress) =>
        <WalletPreview
          style={{ padding: '10px' }}
          address={walletAddress}
          mainnetProvider={mainnetProvider}
          localProvider={localProvider}
          blockExplorer={blockExplorer}
          price={price}
        />
      )}
    </div>
  );
}
