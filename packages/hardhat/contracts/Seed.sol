// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

library Seed {
    
    function getUintInRangeBySeed(
        bytes8 seed,
        uint minNumber,
        uint maxNumber
    ) internal pure returns (uint) {
        return getUintBySeed(seed, maxNumber - minNumber) + minNumber;
    }

    function getUint8InRangeBySeed(
        bytes8 seed,
        uint minNumber,
        uint maxNumber
    ) internal pure returns (uint8) {
        return uint8(getUintBySeed(seed, maxNumber - minNumber) + minNumber);
    }

    function getUintBySeed(
        bytes8 seed,
        uint maxNumber
    ) internal pure returns (uint) {
        // Use bitwise AND to convert the seed to a positive integer
        uint intSeed = uint64(seed) & 0x7fffffff;

        // Use a simple deterministic algorithm to generate a number between 0 and maxNum-1
        uint num = (intSeed * 16807) % 127773;
        uint result = (num % maxNumber) + 1;

        return result;
    }
}