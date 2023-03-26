// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Seed.sol";

library SVGBuildingGenerator {
    struct BuildingConfiguration {
        int x;
        int y;
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
        bytes8 seed,
        bool lightOff
    ) internal pure returns (string memory) {
        string memory buildings = "";
        int buildingXPosition = Seed.getIntInRangeBySeed(seed, -10, 10);
        for (uint32 i = 0; i < 7; i++) {
            bytes8 buildingSeed = Seed.seedPlusInt(seed, buildingXPosition);

            BuildingConfiguration
                memory building = getBuildingConfigurationBySeed(
                    buildingSeed,
                    buildingXPosition,
                    170
                );

            buildings = string(
                abi.encodePacked(
                    buildings,
                    renderBuilding(buildingSeed, building, lightOff)
                )
            );

            buildingXPosition =
                buildingXPosition +
                int(building.buildingWithSize) +
                3;

            // buildings = string(
            //     abi.encodePacked(
            //         buildings,
            //         "<!-- buildingXPosition:",
            //         Strings.toString(buildingXPosition),
            //         "-->"
            //     )
            // );

            if (buildingXPosition > 200) {
                break;
            }
        }

        return buildings;
    }

    function getBuildingConfigurationBySeed(
        bytes8 buildingSeed,
        int x,
        int y
    ) internal pure returns (BuildingConfiguration memory) {
        uint8 windowOffset = 3;

        uint buildingWallSize = Seed.getUintInRangeBySeed(buildingSeed, 3, 5);

        string memory buildingWallColor = getBuildingWallColor(buildingSeed);

        uint8 windowColumnsCount = Seed.getUint8InRangeBySeed(
            buildingSeed,
            1,
            7
        );
        uint8 windowRowsCount = Seed.getUint8InRangeBySeed(
            Seed.seedPlusUint(buildingSeed, windowColumnsCount),
            1,
            8
        );

        uint8 windowWidth = Seed.getUint8InRangeBySeed(buildingSeed, 5, 7);
        uint8 windowHeight = Seed.getUint8InRangeBySeed(
            Seed.seedPlusInt(buildingSeed, y),
            windowWidth,
            windowWidth + 2
        );

        bool showAttics = Seed.getUint8InRangeBySeed(buildingSeed, 0, 10) > 5;
        bool showRoof = false;
        if (windowColumnsCount > 2 && windowRowsCount > 2) {
            showRoof =
                Seed.getUintInRangeBySeed(
                    Seed.fromUint(windowColumnsCount * windowRowsCount),
                    0,
                    10
                ) >
                4;
        }

        uint buildingWithSize = getBuildingSize(
            buildingWallSize,
            windowWidth,
            windowColumnsCount,
            showRoof
        );

        uint buildingWidth = buildingWallSize *
            2 +
            ((windowColumnsCount - 1) * (windowOffset + windowWidth)) +
            windowWidth;

        uint buildingHeight = buildingWallSize +
            windowRowsCount *
            (windowOffset + windowHeight);

        BuildingConfiguration memory building;
        building.x = x;
        if (showRoof) {
            building.x += int(buildingWallSize);
        }
        building.y = y - int(buildingHeight);
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
        uint buildingWallSize,
        uint8 windowWidth,
        uint8 windowColumnsCount,
        bool showRoof
    ) internal pure returns (uint) {
        return
            (buildingWallSize * (showRoof ? 2 : 0)) +
            (buildingWallSize * 2) +
            (windowWidth * windowColumnsCount) +
            (3 * (windowColumnsCount - 1));
    }

    function renderBuilding(
        bytes8 seed,
        BuildingConfiguration memory building,
        bool lightOff
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<g>",
                    renderBuildingAttics(seed, building),
                    building.showRoof ? renderBuildingRoof(building) : "",
                    renderBuildingWall(building),
                    renderBuildingWindows(seed, building, lightOff),
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
            if (Seed.getUintBySeed(Seed.seedPlusUint(seed, i), 10) <= 6) {
                continue;
            }

            int windowX = building.x +
                int(
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
                            int(
                                building.buildingWallSize -
                                    (
                                        building.showRoof
                                            ? building.buildingWallSize
                                            : 0
                                    )
                            ),
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
                building.x - int(building.buildingWallSize),
                building.y - int(building.buildingWallSize),
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
        BuildingConfiguration memory building,
        bool lightOff
    ) internal pure returns (string memory) {
        string memory windows = "";
        for (uint8 i = 0; i < building.windowColumnsCount; i++) {
            int windowX = building.x +
                int(
                    building.buildingWallSize +
                        i *
                        (building.windowOffset + building.windowWidth)
                );

            for (uint j = 0; j < building.windowRowsCount; j++) {
                int windowY = building.y +
                    int(
                        building.buildingWallSize +
                            j *
                            (building.windowOffset + building.windowHeight)
                    );
                uint windowSeed = (uint256(bytes32(seed)) % 27) +
                    ((i + 1) * 4 * building.windowHeight) +
                    ((j + 1) * 9 * building.windowWidth);

                string memory color = lightOff
                    ? "#6e6e6e"
                    : getBuildingWindowColor(windowSeed);
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
        int x,
        int y,
        uint width,
        uint height,
        string memory fill
    ) public pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<rect x="',
                int2str(x),
                '" y="',
                int2str(y),
                '" width="',
                Strings.toString(width),
                '" height="',
                Strings.toString(height),
                '" fill="',
                fill,
                '" />'
            )
        );
        return svg;
    }

    function int2str(
        int _i
    ) internal pure returns (string memory _intAsString) {
        if (_i < 0)
            return
                string(abi.encodePacked("-", Strings.toString(uint(_i * -1))));
        return Strings.toString(uint(_i));
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
        uint seed
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
