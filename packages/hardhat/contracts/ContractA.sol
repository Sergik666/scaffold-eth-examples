// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract ContractA {
    address parent;
    uint public a;

    constructor() {
        parent = msg.sender;
    }

    function setA(uint _a) external {
        a = _a;
    }

    function getName() external pure returns (string memory) {
        return "My name is ContractA";
    }

    // function withdraw() external {
    //     (bool ok, ) = parent.call{value: address(this).balance}("");
    //     require(ok, "failed!");
    // }

    function destroy() external {
        selfdestruct(payable(parent));
    }

    receive() external payable {}
}
