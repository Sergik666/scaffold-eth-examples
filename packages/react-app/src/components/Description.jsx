import React from "react";
import selfdestructImage from '../images/selfdestruct.png';
import reinitImage from '../images/reinit.png';
import stepbystepImage from '../images/stepbystep.png';


export default function Description(props) {

  return <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
    <h1>Description</h1>
    <p>
      Reloading the contract at the same address.
    </p>
    <h1>Theory</h1>
    <h2>Nonce</h2>
    <p>
      Sequence number of transactions.
    </p>
    <h2><a href="https://www.evm.codes/#f0?fork=shanghai" target="_blank">Create</a></h2>
    <p>
      To create a contract address, use the sender address and sender nonce.
    </p>
    <p>
      How is the address calculated:
    </p>
    <p className="code">
      <pre>
        {`address = keccak256(rlp([sender_address,sender_nonce]))[12:]`}
      </pre>
    </p>
    <p>
      To create a contract you must specify "new" and the name of the contract class.
    </p>
    <p>
      Example of the contract's creating and converting to an address:
    </p>
    <p className="code">
      <pre>
        {`address(new ContractA());`}
      </pre>
    </p>
    <p>
      To create a contract based on byte code, you can use the low-level method
    </p>
    <p className="code">
      <pre>
        {`address contractAddress;
assembly {
contractAddress := create(0, add(bytecode, 0x20), mload(bytecode))'}
}`}
      </pre>
    </p>
    <h2><a href="https://www.evm.codes/#f5?fork=shanghai" target="_blank">Create2</a></h2>
    <p>
      To create a contract address, use the sender address, salt and hash (from the bytecode of the contract)
    </p>
    <p>
      How is the address calculated:
    </p>
    <p className="code">
      <pre>
        {`initialisation_code = memory[offset:offset+size]
address = keccak256(0xff + sender_address + salt + keccak256(initialisation_code))[12:]`}
      </pre>
    </p>
    <p>
      To create a contract, you must specify "new", the name of the contract and salt.
    </p>
    <p>
      Example of the contract's creating and converting to an address:
    </p>
    <p className="code">
      <pre>
        {`address(new ContractDeployer{salt: SALT}());`}
      </pre>
    </p>
    <h2><a href="https://www.evm.codes/#ff?fork=shanghai" target="_blank">selfdestruct</a></h2>
    <p>
      Deleting the contract byte code and resetting the nonce, the contract funds are sent to the specified address.
    </p>
    <p>
      Usage example:
    </p>
    <p className="code">
      <pre>
        {`selfdestruct(payable(parent));`}
      </pre>
    </p>
    <h1>Displays in etherscan</h1>
    <img style={{ maxWidth: 820 }} src={selfdestructImage} alt="selfdestruct" />
    <p>
      Deleted contract is marked 'selfdestruct'.
    </p>
    <img style={{ maxWidth: 820 }} src={reinitImage} alt="reinit" />
    <p>
      Reloaded contract is marked with 'reinit'
    </p>
    <h1>How can we use it</h1>
    <p>
      With create2 we can create a contract with the same addresses. Using the create method and the same nonce creates a contract at the same address. With selfdestruct we can delete this contract. Zeroing the nonce and reloading it with the zeroed nonce. You can already download an arbitrary contract at the same address.
    </p>
    <p>
      We have a main contract for restore <a href="https://sepolia.etherscan.io/address/0xE690D00A1ae04B2aa0a2B903980360D4981b94ac" target="_blank">Rebirth Contract</a> that loads a contract to load other contracts <a href="https://sepolia.etherscan.io/address/0x50C56Ec20478fE29b069B7223005de97bFD0378f" target="_blank">Deploy Contract</a>. To deploy "Deploy Contract" use the same address, salt and same contract bytecode.
    </p>
    <p>
      "Deploy Contract" deployed "Contract A", "Contract B" or bytecode. And deployed contract <a href="https://sepolia.etherscan.io/address/0x20D50924B373978162DF1AFc079f0c9A62Fcb669" target="_blank">"Main Contract" address</a> always has the same address on condition the nonce is equal 0, and this address doesn't have any other contract.
    </p>
    <p>
      To update the "master contract" at the same address, you need to delete the previous "Main Contract" and "Deploy Contract" (use the "selfdestruct" method). After the destruction of the contract, its "nonce" is reset, so the new "Main Contract" will receive the same address.
    </p>
    <h2>Step by step</h2>
    <p>
      1. "Rebirth Contract" click "Deploy"
    </p>
    <p>
      2. "Deploy Contract" click "Deploy Contract A"
    </p>
    <p>
      3. "Main Contract" click "Destroy"
    </p>
    <p>
      4. "Deploy Contract" click "Destroy"
    </p>
    <p>
      5. "Rebirth Contract" click "Deploy"
    </p>
    <p>
      6. "Deploy Contract" click "Deploy Bytecode"
    </p>
    <img style={{ maxWidth: 820 }} src={stepbystepImage} alt="Step by step" />
    <h2>Testing</h2>
    <p>
      Checking the contract's loading on the same address is included into the tests
    </p>
  </div>
}
