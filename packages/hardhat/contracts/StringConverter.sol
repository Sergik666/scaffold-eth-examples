// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
import "@openzeppelin/contracts/utils/Strings.sol";

library StringConverter {
    function uint2str(
        uint _i
    ) internal pure returns (string memory _uintAsString) {
        return Strings.toString(uint(_i));
    }

    function int2str(
        int _i
    ) internal pure returns (string memory _intAsString) {
        if (_i < 0)
            return string(abi.encodePacked("-", uint2str(uint(_i * -1))));
        return uint2str(uint(_i));
    }
}
