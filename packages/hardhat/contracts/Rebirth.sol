// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./ContractDeployer.sol";

contract Rebirth {
    bytes32 public immutable SALT;

    event Deployed(address contractAddress);

    constructor(string memory _salt) {
        SALT = bytes32(bytes(_salt));
    }

    function deploy() external returns (address) {
        address contractDeployerAddress = address(
            new ContractDeployer{salt: SALT}()
        );
        emit Deployed(contractDeployerAddress);
        return contractDeployerAddress;
    }

    function calculateContractAddress() external view returns (address) {
        bytes32 h = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                SALT,
                keccak256(getContractDeployerBytecode())
            )
        );

        return address(uint160(uint256(h)));
    }

    function getContractDeployerBytecode() public pure returns (bytes memory) {
        bytes memory bc = type(ContractDeployer).creationCode;
        return abi.encodePacked(bc);
    }
}
