import React from "react";
import { useParams } from 'react-router-dom';
import QR from "qrcode.react";
import Address from "./Address";
import Balance from "./Balance";

export default function WalletManagement({
  mainnetProvider,
  localProvider,
  blockExplorer,
  price,
}) {

  const { value: address } = useParams();

  return (
    <div className="wallet-management">
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
  )
}
