import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Spin, List } from "antd";
import QR from "qrcode.react";
import { useExternalContractLoader, useContractReader } from "../hooks";
import Address from "../components/Address";
import Balance from "../components/Balance";
import MetaMultiSigWalletABI from "../contracts/MetaMultiSigWallet.abi";
import './WalletManagement.css';

export default function WalletManagement({
  mainnetProvider,
  localProvider,
  blockExplorer,
  price,
}) {

  const [owners, setOwners] = useState([]);

  const { value: address } = useParams();

  const walletContract = useExternalContractLoader(localProvider, address, MetaMultiSigWalletABI);

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
      if (typeof localProvider !== "undefined") {
        localProvider.resetEventsBlock(1);
      }
  
      walletContract.on("Owner", ownerEvent);
    }

    return () => {
      if (walletContract) {
        walletContract.off("Owner", ownerEvent);
      }
    }

  }, [walletContract]);

  const signaturesRequired = useContractReader({ MetaMultiSigWallet: walletContract }, "MetaMultiSigWallet", "signaturesRequired", 1000);

  return (
    <div className="wallet-management">
      <div className="wallet-information">
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

      <div className="wallet-owners">

        <h2 className="owners">Owners:</h2>

        <List
          style={{ maxWidth: 400, margin: "auto" }}
          bordered
          dataSource={owners}
          renderItem={(item) => {
            return (
              <List.Item key={"owner_" + item}>
                <Address
                  address={item}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  size="short"
                  fontSize={16}
                />
              </List.Item>
            )
          }}
        />

        <h2 className="signatures-required">
          Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin />}
        </h2>

      </div>

    </div>
  )
}
