// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "./StringConverter.sol";

library SVGBaseGenerator {
    function getSVGRect(
        uint x,
        uint y,
        uint width,
        uint height,
        string memory fill
    ) public pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<rect x="',
                StringConverter.uint2str(x),
                '" y="',
                StringConverter.uint2str(y),
                '" width="',
                StringConverter.uint2str(width),
                '" height="',
                StringConverter.uint2str(height),
                '" fill="',
                fill,
                '" />'
            )
        );
        return svg;
    }
}
