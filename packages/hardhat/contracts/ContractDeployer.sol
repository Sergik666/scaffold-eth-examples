// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./ContractA.sol";
import "./ContractB.sol";

contract ContractDeployer {
    address parent;

    event Deployed(address contractAddress);

    constructor() {
        parent = msg.sender;
    }

    function deployContractA() external returns (address) {
        address contractAddress = address(new ContractA());
        emit Deployed(contractAddress);
        return contractAddress;
    }

    function deployContractB() external returns (address) {
        address contractAddress = address(new ContractB());
        emit Deployed(contractAddress);
        return contractAddress;
    }

    function deployContractFromByteCode(
        bytes memory bytecode
    ) public returns (address) {
        address contractAddress;
        assembly {
            contractAddress := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        emit Deployed(contractAddress);
        return contractAddress;
    }

    function destroy() external {
        selfdestruct(payable(parent));
    }
}
