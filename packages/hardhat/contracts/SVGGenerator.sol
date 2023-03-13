// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

import "./StringConverter.sol";
import "./Seed.sol";
import "./SVGBaseGenerator.sol";
import "./SVGBuildingGenerator.sol";

library SVGGenerator {
    function generateSVGofTokenBySeed(
        bytes8 seed,
        bool lightOff
    ) internal view returns (string memory) {
        uint8 firstByte = uint8(bytes1(seed));
        bool isDay = ((firstByte & 0x80) == 0x80);
        bool isShowClouds = Seed.getUintBySeed(seed, 100) > 30;
        string memory svg = string(
            abi.encodePacked(
                ' <svg width="200mm" height="200mm" version="1.1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                "<defs>",
                renderSkyGradient(isDay),
                isDay ? renderSunDefs() : renderMoonDefs(),
                isShowClouds ? renderCloudsDefs(): "",
                "</defs>",
                "<g>",
                '<rect width="200" height="200" fill="url(#SkyGradient)"/>',
                isDay ? renderSun() : renderMoon(),
                renderBackBuildingsObjects(seed),
                isShowClouds ? renderClouds() : "",
                SVGBuildingGenerator.renderBuildings(seed, lightOff),
                renderRoad(),
                "</g>",
                "</svg>"
            )
        );

        return svg;
    }

    function renderSkyGradient(
        bool isDay
    ) private pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<linearGradient id="SkyGradient" x1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="',
                isDay ? "#35d6ed" : "#360ccd",
                '" offset="0"/>',
                '<stop stop-color="',
                isDay ? "#65ddef" : "#302dd9",
                '" offset=".25"/>',
                '<stop stop-color="',
                isDay ? "#7ae5f5" : "#2a4ee5",
                '" offset=".5"/>',
                '<stop stop-color="',
                isDay ? "#97ebf4" : "#246ff0",
                '" offset=".75"/>',
                '<stop stop-color="',
                isDay ? "#c9f6ff" : "#1e90fc",
                '" offset="1"/>',
                "</linearGradient>"
            )
        );
        return render;
    }

    function renderSunDefs() private pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<radialGradient id="SunRadialGradient" cx="190" cy="9" r="10" gradientTransform="matrix(-.95724 .63422 -.54466 -.82206 358.37 -83.415)" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="#ff8d0f" offset="0"/>',
                '<stop stop-color="#ffbf00" offset="1"/>',
                "</radialGradient>",
                '<filter id="SunFilter" x="-.048" y="-.048" width="1.096" height="1.096" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0.4"/></filter>'
            )
        );
        return render;
    }

    function renderMoonDefs() private pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<mask id="MoonMask" maskUnits="userSpaceOnUse">',
                '<path id="MoonMask_box" d="m159 19h22v22h-22z" fill="#fff"/>',
                '<circle cx="163.65" cy="27.354" r="10" d="m 173.65009,27.354164 a 10,10 0 0 1 -10,10 10,10 0 0 1 -10,-10 10,10 0 0 1 10,-10 10,10 0 0 1 10,10 z" stroke-width=".265"/>',
                "</mask>"
            )
        );
        return render;
    }

    function renderSun() private pure returns (string memory) {
        return
            '<circle id="Sun" cx="170" cy="30" r="10" fill="url(#SunRadialGradient)" filter="url(#SunFilter)" style="mix-blend-mode:normal"/>';
    }

    function renderMoon() private pure returns (string memory) {
        return
            '<path d="m180 30a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10z" fill="#fff" mask="url(#MoonMask)"/>';
    }

     function renderCloudsDefs() private pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<filter id="CloudFilter" x="-.021825" y="-.042921" width="1.0437" height="1.0858" color-interpolation-filters="sRGB">',
                '<feGaussianBlur stdDeviation="0.39481193"/>',
                '</filter>'
            )
        );
        return render;
    }

    function renderClouds() private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<g transform="translate(-15.341 5.9868)" fill="#fff" filter="url(#CloudFilter)" opacity=".9">',
                    '<ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/>',
                    '<ellipse cx="92.887" cy="35.98" rx="10.851" ry="9.1673" stroke-width=".26458"/>',
                    '<ellipse cx="84.462" cy="38.289" rx="13.096" ry="6.9223" stroke-width=".24298"/>',
                    "</g>",
                    '<g transform="matrix(.87323 0 0 .70348 79.229 19.711)" fill="#fff" filter="url(#CloudFilter)" opacity=".9">',
                    '<ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/>',
                    '<ellipse cx="92.887" cy="35.98" rx="10.851" ry="9.1673" stroke-width=".26458"/>',
                    '<ellipse cx="79.888" cy="39.885" rx="8.6724" ry="5.3266" stroke-width=".17345"/>',
                    "</g>",
                    '<g transform="translate(-57.249 -11.599)" fill="#fff" filter="url(#CloudFilter)" opacity=".9">',
                    '<ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/>',
                    '<ellipse cx="87.648" cy="33.36" rx="10.851" ry="11.787" stroke-width=".30001"/>',
                    '<ellipse cx="77.353" cy="34.734" rx="10.851" ry="10.477" stroke-width=".2721"/>',
                    '<ellipse cx="94.758" cy="38.973" rx="10.851" ry="10.29" stroke-width=".28031"/>',
                    "</g>",
                    '<g transform="translate(32.353 -13.436)" fill="#fff" filter="url(#CloudFilter)" opacity=".9">',
                    '<ellipse cx="109.73" cy="34.951" rx="6.1739" ry="6.8287" stroke-width=".15433"/>',
                    '<ellipse cx="83.907" cy="34.296" rx="10.851" ry="11.599" stroke-width=".29762"/>',
                    '<ellipse cx="72.021" cy="33.892" rx="6.4546" ry="6.6416" stroke-width=".16709"/>',
                    '<ellipse cx="96.722" cy="34.015" rx="12.441" ry="14.125" stroke-width=".35167"/>',
                    "</g>"
                )
            );
    }

    function renderBackBuildingsObjects(
        bytes8 seed
    ) private view returns (string memory) {
        int16 startOffset = -15;
        uint8 buildingCount = 7;

        uint8[] memory buildingIds = new uint8[](buildingCount);
        for (uint8 i = 0; i < buildingCount; i++) {
            buildingIds[i] = uint8(
                Seed.getUintBySeed(
                    bytes8(uint64(seed) + i * buildingCount),
                    buildingCount
                )
            );
        }

        string memory buildings = getBackBuildingsPath(
            buildingIds,
            startOffset,
            120
        );

        return
            string(
                abi.encodePacked(
                    '<g fill="#ccc" stroke="#ccc">',
                    '<rect y="120" width="200" height="80"/>',
                    buildings,
                    "</g>"
                )
            );
    }

    function getBackBuildingsPath(
        uint8[] memory buildingIds,
        int16 startOffset,
        int16 y
    ) internal view returns (string memory) {
        int16 buildingWidth = 30;
        string memory pathData = "";
        for (uint8 i = 0; i < buildingIds.length; i++) {
            console.log(
                string(
                    abi.encodePacked(
                        "buildingId: ",
                        StringConverter.uint2str(buildingIds[i]),
                        ", x: ",
                        StringConverter.int2str(
                            startOffset +
                                int16(uint16(buildingWidth) * uint16(i))
                        )
                    )
                )
            );

            pathData = string(
                abi.encodePacked(
                    pathData,
                    getBackBuildingPath(
                        buildingIds[i],
                        startOffset + int16(uint16(buildingWidth) * uint16(i)),
                        y
                    )
                )
            );
        }
        return string(abi.encodePacked('<path d="', pathData, ' z"/>'));
    }

    function getBackBuildingPath(
        uint8 buildingId,
        int16 x,
        int16 y
    ) internal pure returns (string memory) {
        if (buildingId == 1) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x),
                        " ",
                        StringConverter.int2str(y),
                        " v -30 l 15-15 l 15 15 v 30 "
                    )
                );
        } else if (buildingId == 2) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x + 7),
                        " ",
                        StringConverter.int2str(y),
                        " v -40 h 16 v 40 "
                    )
                );
        } else if (buildingId == 3) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x),
                        " ",
                        StringConverter.int2str(y),
                        " v -30 h 30 v 30 "
                    )
                );
        } else if (buildingId == 4) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x),
                        " ",
                        StringConverter.int2str(y),
                        " v -40 h 5 v -5 h 5 v -5 h 4 v -10 h 2 v 10 h 4 v 5 h 5 v 5 h 5 v 40 "
                    )
                );
        } else if (buildingId == 5) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x + 10),
                        " ",
                        StringConverter.int2str(y),
                        " v -20 h 15 v 20 "
                    )
                );
        } else if (buildingId == 6) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        StringConverter.int2str(x + 2),
                        " ",
                        StringConverter.int2str(y),
                        " v -25 h 3 v -20 h 15 v 20 h 8 v 25 "
                    )
                );
        } else {
            return "";
        }
    }

    function renderRoad() private pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<rect y="170" width="200" height="30" fill="#4d4d4d" stroke-width=".26458"/>',
                '<g fill="#fff">',
                '<rect x="10" y="183" width="30" height="4"/>',
                '<rect x="60" y="183" width="30" height="4"/>',
                '<rect x="110" y="183" width="30" height="4"/>',
                '<rect x="160" y="183" width="30" height="4"/>',
                "</g>`"
            )
        );
        return render;
    }
}
