# 🏗 scaffold-eth - 🔵 Rebirth Contract

## Description

Reloading the contract at the same address. An example was made after watching a video on this topic (on russian language): https://youtu.be/6i6pKU_FaJs

We have a main contract for restore [Rebirth Contract](https://sepolia.etherscan.io/address/0xE690D00A1ae04B2aa0a2B903980360D4981b94ac) that loads a contract to load other contracts [Deploy Contract](https://sepolia.etherscan.io/address/0x56a37913eF6C67a31fD7B453308DcE49).
For deploy "Deploy Contract" to same address used salt and same contract bytecode.

"Deploy Contract" deployed "Contract A", "Contract B" or bytecode. And deployed ["Main Contract" address](https://sepolia.etherscan.io/address/0x20D50924B373978162DF1AFc079f0c9A62Fcb669) always same if nonce = 0 and on this address not contract.

To update the "master contract" at the same address, you need to delete the previous "Main Contract" and "Deploy Contract", for this we use the "selfdestruct" method.
After the destruction of the contract, its "nonce" is reset, so that the new "Main Contract" will receive the same address.

## Step by step

1. "Rebirth Contract" click "Deploy"
2. "Deploy Contract" click "Deploy Contract A"
3. "Main Contract" click "Destroy"
4. "Deploy Contract" click "Destroy"
5. "Rebirth Contract" click "Deploy"
6. "Deploy Contract" click "Deploy Bytecode"

## Testing

The tests also implemented checking the receipt of the same address

## Installation

```bash
git clone git@github.com:Sergik666/scaffold-eth-examples.git contract-rebirth

cd contract-rebirth

git checkout contract-rebirth
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
cd contract-rebirth

yarn chain

```

---

> in a third terminal window:


```bash
cd contract-rebirth

yarn deploy

```

📱 Open http://localhost:3000 to see the app


For testing

> in a fourth terminal window:
```bash
yarn test
```

Site demo:
https://sergik666-rebirth-contract.surge.sh
