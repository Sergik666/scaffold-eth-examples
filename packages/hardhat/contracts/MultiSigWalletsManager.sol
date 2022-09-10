// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./MetaMultiSigWallet.sol";

contract MultiSigWalletsManager {
    address[] private s_allWallets;

    event Create(
        uint256 walletIndex,
        address indexed walletAddress,
        address[] owners,
        uint256 signaturesRequired
    );

    constructor() {}

    function createWallet(
        uint256 _chainId,
        address[] memory _owners,
        uint _signaturesRequired
    ) public payable returns (address walletAddress) {
        MetaMultiSigWallet metaMultiSigWallet = new MetaMultiSigWallet(
            _chainId,
            _owners,
            _signaturesRequired
        );

        walletAddress = address(metaMultiSigWallet);
        uint256 walletIndex = s_allWallets.length;
        s_allWallets.push(walletAddress);

        emit Create(walletIndex, walletAddress, _owners, _signaturesRequired);

        return walletAddress;
    }

    function getAllWallets() public view returns (address[] memory) {
        return s_allWallets;
    }

    function getWalletsCount() public view returns (uint256) {
        return s_allWallets.length;
    }

    function getWallet(uint256 _index) public view returns (address) {
        return s_allWallets[_index];
    }
}
