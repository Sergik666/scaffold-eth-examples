// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "./StringConverter.sol";
import "./Seed.sol";

library SVGBuildingGenerator {
    struct BuildingConfiguration {
        uint x;
        uint y;
        uint buildingWidth;
        uint buildingHeight;
        uint buildingWithSize;
        uint buildingWallSize;
        string buildingWallColor;
        uint windowColumnsCount;
        uint windowRowsCount;
        uint windowWidth;
        uint windowHeight;
        uint windowOffset;
        bool showAttics;
        bool showRoof;
    }

    function renderBuildings(
        bytes8 seed
    ) internal pure returns (string memory) {
        string memory buildings = "";
        uint8 buildingXPosition = Seed.getUint8InRangeBySeed(seed, 0, 20);
        for (uint32 i = 0; i < 4; i++) {

            bytes8 buildingSeed = bytes8(uint64(seed) + buildingXPosition + i);

            BuildingConfiguration
                memory building = getBuildingConfigurationBySeed(
                    bytes8(uint64(buildingSeed)),
                    buildingXPosition,
                    170
                );

            buildings = string(
                abi.encodePacked(buildings, renderBuilding(seed, building))
            );

            buildingXPosition =
                buildingXPosition +
                uint8(building.buildingWithSize) +
                3;

            buildings = string(
                abi.encodePacked(
                    buildings,
                    "<!-- buildingXPosition:",
                    StringConverter.uint2str(buildingXPosition),
                    "-->"
                )
            );

            if (buildingXPosition > 200) {
                break;
            }
        }

        return buildings;
    }

    function getBuildingConfigurationBySeed(
        bytes8 buildingSeed,
        uint8 x,
        uint8 y
    ) internal pure returns (BuildingConfiguration memory) {
        uint8 windowOffset = 3;

        uint8 buildingWallSize = Seed.getUint8InRangeBySeed(buildingSeed, 3, 5);

        string memory buildingWallColor = getBuildingWallColor(buildingSeed);

        uint8 windowColumnsCount = Seed.getUint8InRangeBySeed(
            buildingSeed,
            3,
            5
        );
        uint8 windowRowsCount = Seed.getUint8InRangeBySeed(buildingSeed, 1, 7);

        uint8 windowWidth = Seed.getUint8InRangeBySeed(buildingSeed, 5, 7);
        uint8 windowHeight = Seed.getUint8InRangeBySeed(
            bytes8(uint64(buildingSeed) + y),
            windowWidth,
            windowWidth + 2
        );

        bool showAttics = Seed.getUint8InRangeBySeed(buildingSeed, 0, 10) > 5;
        bool showRoof = Seed.getUintInRangeBySeed(
            bytes8(uint64(windowColumnsCount * windowRowsCount)),
            0,
            10
        ) > 4;

        uint8 buildingWithSize = getBuildingSize(
            buildingWallSize,
            windowWidth,
            windowColumnsCount,
            showRoof
        );

        uint8 buildingWidth = buildingWallSize *
            2 +
            ((windowColumnsCount - 1) * (windowOffset + windowWidth)) +
            windowWidth;
        uint8 buildingHeight = buildingWallSize +
            windowRowsCount *
            (windowOffset + windowHeight);

        BuildingConfiguration memory building;
        building.x = x;
        building.y = y - buildingHeight;
        building.buildingWidth = buildingWidth;
        building.buildingHeight = buildingHeight;
        building.buildingWithSize = buildingWithSize;
        building.buildingWallSize = buildingWallSize;
        building.buildingWallColor = buildingWallColor;
        building.windowColumnsCount = windowColumnsCount;
        building.windowRowsCount = windowRowsCount;
        building.windowWidth = windowWidth;
        building.windowHeight = windowHeight;
        building.windowOffset = windowOffset;
        building.showAttics = showAttics;
        building.showRoof = showRoof;

        return building;
    }

    function getBuildingSize(
        uint8 buildingWallSize,
        uint8 windowWidth,
        uint8 windowColumnsCount,
        bool showRoof
    ) internal pure returns (uint8) {
        return
            (buildingWallSize * (showRoof ? 2 : 0)) +
            (buildingWallSize * 2) +
            (windowWidth * windowColumnsCount) +
            (3 * (windowColumnsCount - 1));
    }

    function renderBuilding(
        bytes8 seed,
        BuildingConfiguration memory building
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<g>",
                    renderBuildingAttics(seed, building),
                    building.showRoof ? renderBuildingRoof(building) : "",
                    renderBuildingWall(building),
                    renderBuildingWindows(seed, building),
                    "</g>"
                )
            );
    }

    function renderBuildingAttics(
        bytes8 seed,
        BuildingConfiguration memory building
    ) internal pure returns (string memory) {
        string memory attics = "";
        for (uint8 i = 0; i < building.windowColumnsCount; i++) {
            if (Seed.getUintBySeed(bytes8(uint64(seed) + i), 10) <= 6) {
                continue;
            }

            uint8 windowX = uint8(
                building.x +
                    building.buildingWallSize +
                    i *
                    (building.windowOffset + building.windowWidth)
            );

            attics = string(
                abi.encodePacked(
                    attics,
                    getSVGRect(
                        windowX,
                        building.y -
                            building.buildingWallSize -
                            (building.showRoof ? building.buildingWallSize : 0),
                        building.windowWidth,
                        building.buildingWallSize,
                        building.buildingWallColor
                    )
                )
            );
        }

        return attics;
    }

    function renderBuildingRoof(
        BuildingConfiguration memory building
    ) internal pure returns (string memory) {
        return
            getSVGRect(
                building.x - building.buildingWallSize,
                building.y - building.buildingWallSize,
                building.buildingWidth + building.buildingWallSize * 2,
                building.buildingWallSize,
                "#47474e"
            );
    }

    function renderBuildingWall(
        BuildingConfiguration memory building
    ) internal pure returns (string memory) {
        return
            getSVGRect(
                building.x,
                building.y,
                building.buildingWidth,
                building.buildingHeight,
                building.buildingWallColor
            );
    }

    function renderBuildingWindows(
        bytes8 seed,
        BuildingConfiguration memory building
    ) internal pure returns (string memory) {
        string memory windows = "";
        for (uint8 i = 0; i < building.windowColumnsCount; i++) {
            uint8 windowX = uint8(
                building.x +
                    building.buildingWallSize +
                    i *
                    (building.windowOffset + building.windowWidth)
            );

            for (uint8 j = 0; j < building.windowRowsCount; j++) {
                uint8 windowY = uint8(
                    building.y +
                        building.buildingWallSize +
                        j *
                        (building.windowOffset + building.windowHeight)
                );
                bytes8 windowSeed = bytes8(
                    uint64(seed) *
                        uint64(i + building.windowHeight * 2) *
                        uint64(j + building.windowWidth * 2)
                );
                string memory color = getBuildingWindowColor(windowSeed);
                windows = string(
                    abi.encodePacked(
                        windows,
                        getSVGRect(
                            windowX,
                            windowY,
                            building.windowWidth,
                            building.windowHeight,
                            color
                        )
                    )
                );
            }
        }

        return windows;
    }

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

    function getBuildingWallColor(
        bytes8 seed
    ) public pure returns (string memory) {
        uint remainder = uint64(seed) % 100;

        if (remainder < 50) {
            return "#b1b1b1";
        } else if (remainder < 60) {
            return "#a9a791";
        } else if (remainder < 90) {
            return "#a2a77e";
        } else {
            return "#f26c25";
        }
    }

    function getBuildingWindowColor(
        bytes8 seed
    ) public pure returns (string memory) {
        uint remainder = uint64(seed) % 100;

        if (remainder < 50) {
            return "#6e6e6e";
        } else if (remainder < 60) {
            return "#ffdb9d";
        } else if (remainder < 90) {
            return "#fca";
        } else {
            return "#fff";
        }
    }
}
