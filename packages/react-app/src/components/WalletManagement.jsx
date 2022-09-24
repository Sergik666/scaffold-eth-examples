import React from "react";
import './WalletPreview.css';

export default function WalletManagement({match}) {

  const value = match?.params?.value;

  return (
    <div>
      {value || 'NO VALUE'}
    </div>
  )
}
