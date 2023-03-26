// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        return
            uint8(getUintBySeed(seed, maxNumber - minNumber) + minNumber - 1);
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

    function getIntInRangeBySeed(
        bytes8 seed,
        int minNumber,
        int maxNumber
    ) internal pure returns (int) {
        return getIntBySeed(seed, maxNumber - minNumber) + minNumber - 1;
    }

    function getIntBySeed(
        bytes8 seed,
        int maxNumber
    ) internal pure returns (int) {
        return int(getUintBySeed(seed, uint(maxNumber)));
    }

    function seedPlusInt(
        bytes8 seed,
        int value
    ) internal pure returns (bytes8) {
        return fromInt(int(uint(uint64(seed))) + value);
    }

    function fromInt(int seed) internal pure returns (bytes8) {
        return bytes8(uint64(int64(seed)));
    }

    function seedPlusUint(
        bytes8 seed,
        uint value
    ) internal pure returns (bytes8) {
        return fromUint(uint(uint64(seed)) + value);
    }

    function fromUint(uint seed) internal pure returns (bytes8) {
        return bytes8(uint64(seed));
    }

    function isSunFromSeed(bytes8 seed) internal pure returns (bool) {
        uint8 firstByte = uint8(bytes1(seed));
        return ((firstByte & 0x80) == 0x80);
    }

    function isShowCloudsFromSeed(bytes8 seed) internal pure returns (bool) {
        return getUintBySeed(seed, 100) > 60;
    }

    function isShowStarsFromSeed(bytes8 seed) internal pure returns (bool) {
        return getUint8InRangeBySeed(seed, 0, 15) > 10;
    }

    function getTimeOfDayFromSeed(bytes8 seed) internal pure returns (uint8) {
        //  Sunrise = 1, Day = 2 , Sunset = 3, Night = 4, Twilight 5
        return getUint8InRangeBySeed(seed, 0, 6);
    }
}
