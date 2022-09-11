import React from "react";
import Address from "./Address";
import Balance from "./Balance";
import QR from "qrcode.react";
import './WalletPreview.css';

export default function WalletPreview({ address, mainnetProvider, localProvider, blockExplorer, price }) {

  if (!address) {
    return (
      <div className="wallet-preview">
        <p className="create">+</p>
        <p className="action">Create Wallet</p>
      </div>);
  }

  return (
    <div className="wallet-preview">
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
          size="180"
          level="H"
          includeMargin
          renderAs="svg"
          imageSettings={{ excavate: false }}
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

      <p className="open action">Open Wallet</p>

    </div>
  );
}
