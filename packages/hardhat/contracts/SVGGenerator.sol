// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./Seed.sol";

import "./SVGBuildingGenerator.sol";

library SVGGenerator {
    struct SVGConfiguration {
        bytes8 seed;
        uint8 celestialBody;
        uint8 cosmos;
        uint8 timeOfDay;
        uint8 weather;
        uint8[] backBuildingIds;
    }

    function generateSVGConfigurationBySeed(
        bytes8 seed
    ) internal pure returns (SVGConfiguration memory) {
        uint8 timeOfDay = Seed.getTimeOfDayFromSeed(seed);
        bool isShowClouds = Seed.isShowCloudsFromSeed(seed);
        bool isShowStarts = Seed.isShowStarsFromSeed(seed);
        bool isDay = timeOfDay < 4;

        SVGConfiguration memory svgConfiguration;

        svgConfiguration.seed = seed;

        svgConfiguration.celestialBody = 1;
        if (timeOfDay == 3) {
            svgConfiguration.celestialBody = Seed.getUint8InRangeBySeed(seed, 0, 2);

        } else if (timeOfDay > 3){
            svgConfiguration.celestialBody = 2;
        }

        if (!isDay && isShowStarts) {
            svgConfiguration.cosmos = 1;
        }

        svgConfiguration.timeOfDay = timeOfDay;

        if (isShowClouds) {
            svgConfiguration.weather = 1;
        }

        uint8 buildingCount = 7;

        svgConfiguration.backBuildingIds = new uint8[](buildingCount);
        for (uint8 i = 0; i < buildingCount; i++) {
            svgConfiguration.backBuildingIds[i] = uint8(
                Seed.getUintBySeed(
                    Seed.seedPlusUint(seed, i * buildingCount),
                    buildingCount
                )
            );
        }

        return svgConfiguration;
    }

    function renderSVG(
        SVGConfiguration memory svgConfiguration,
        bool lightOff
    ) internal pure returns (string memory) {
        bool showSun = svgConfiguration.celestialBody == 1;
        bool showMoon = svgConfiguration.celestialBody == 2;
        bool showClouds = svgConfiguration.weather == 1;
        bool showStarts = svgConfiguration.cosmos == 1;

        string memory defs = string(
            abi.encodePacked(
                "<defs>",
                renderSkyGradient(svgConfiguration.timeOfDay),
                showSun ? renderSunDefs() : "",
                showMoon ? renderMoonDefs() : "",
                showClouds ? renderCloudsDefs() : "",
                showStarts ? renderStarsDefs() : "",
                "</defs>"
            )
        );

        string memory weather = "";
        if (showClouds) {
            weather = renderClouds();
        }

        if (showStarts) {
            weather = string(abi.encodePacked(weather, renderStars()));
        }

        string memory svg = string(
            abi.encodePacked(
                ' <svg width="200mm" height="200mm" version="1.1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">',
                defs,
                "<g>",
                '<rect width="200" height="200" fill="url(#SkyGradient)"/>',
                showSun ? renderSun() : renderMoon(),
                weather,
                renderBackBuildingsObjects(svgConfiguration.backBuildingIds),
                SVGBuildingGenerator.renderBuildings(
                    svgConfiguration.seed,
                    lightOff
                ),
                renderRoad(),
                "</g>",
                "</svg>"
            )
        );

        return svg;
    }

    function getSkyGradientColors(
        uint8 timeOfDay
    ) private pure returns (string[5] memory) {

        //  Sunrise = 1, Day = 2 , Sunset = 3, Night = 4, Twilight 5
        if (timeOfDay == 1)
            return ["#FDD900", "#FDB813", "#FD7E14", "#B3366F", "#582C4D"];
        // if (timeOfDay == 2)
        //     return ["#55C1FF", "#3D9FE8", "#2B79C8", "#214F96", "#1B3A72"];
        if (timeOfDay == 3)
            return ["#F44336", "#E84E2C", "#CC4C27", "#9D3C23", "#512A2A"];
        if (timeOfDay == 4)
            return ["#4A1E4D", "#4A1E4D", "#4A1E4D", "#4A1E4D", "#4A1E4D"];
        if (timeOfDay == 5)
            return ["#0A2A5E", "#0B3061", "#0D3B66", "#0E4369", "#0F4B6D"];

        return ["#55C1FF", "#3D9FE8", "#2B79C8", "#214F96", "#1B3A72"];

        // if (timeOfDay > 4) {
        //     return ["#360ccd", "#302dd9", "#2a4ee5", "#246ff0", "#1e90fc"];
        // }

        // return ["#35d6ed", "#65ddef", "#7ae5f5", "#97ebf4", "#c9f6ff"];
    }

    function renderSkyGradient(
        uint8 timeOfDay
    ) private pure returns (string memory) {
        string[5] memory colors = getSkyGradientColors(timeOfDay);

        string memory render = string(
            abi.encodePacked(
                '<linearGradient id="SkyGradient" x1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">',
                '<stop stop-color="',
                colors[0],
                '" offset="0"/>',
                '<stop stop-color="',
                colors[1],
                '" offset=".25"/>',
                '<stop stop-color="',
                colors[2],
                '" offset=".5"/>',
                '<stop stop-color="',
                colors[3],
                '" offset=".75"/>',
                '<stop stop-color="',
                colors[1],
                '" offset="1"/>',
                "</linearGradient>"
            )
        );
        return render;
    }

    function renderSunDefs() private pure returns (string memory) {
        return
            '<radialGradient id="SunRadialGradient" cx="190" cy="9" r="10" gradientTransform="matrix(-.95724 .63422 -.54466 -.82206 358.37 -83.415)" gradientUnits="userSpaceOnUse"><stop stop-color="#ff8d0f" offset="0"/><stop stop-color="#ffbf00" offset="1"/></radialGradient><filter id="SunFilter" x="-.048" y="-.048" width="1.096" height="1.096" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0.4"/></filter>';
    }

    function renderMoonDefs() private pure returns (string memory) {
        return
            '<mask id="MoonMask" maskUnits="userSpaceOnUse"><path id="MoonMask_box" d="m159 19h22v22h-22z" fill="#fff"/><circle cx="163.65" cy="27.354" r="10" d="m 173.65009,27.354164 a 10,10 0 0 1 -10,10 10,10 0 0 1 -10,-10 10,10 0 0 1 10,-10 10,10 0 0 1 10,10 z" stroke-width=".265"/></mask>';
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
        return
            '<filter id="CloudFilter" x="-.021825" y="-.042921" width="1.0437" height="1.0858" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0.39481193"/></filter>';
    }

    function renderClouds() private pure returns (string memory) {
        return
            '<g transform="translate(-15.341 5.9868)" fill="#fff" filter="url(#CloudFilter)" opacity=".9"><ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/><ellipse cx="92.887" cy="35.98" rx="10.851" ry="9.1673" stroke-width=".26458"/><ellipse cx="84.462" cy="38.289" rx="13.096" ry="6.9223" stroke-width=".24298"/></g><g transform="matrix(.87323 0 0 .70348 79.229 19.711)" fill="#fff" filter="url(#CloudFilter)" opacity=".9"><ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/><ellipse cx="92.887" cy="35.98" rx="10.851" ry="9.1673" stroke-width=".26458"/><ellipse cx="79.888" cy="39.885" rx="8.6724" ry="5.3266" stroke-width=".17345"/></g><g transform="translate(-57.249 -11.599)" fill="#fff" filter="url(#CloudFilter)" opacity=".9"><ellipse cx="103.56" cy="34.857" rx="11.225" ry="11.038" stroke-width=".26458"/><ellipse cx="87.648" cy="33.36" rx="10.851" ry="11.787" stroke-width=".30001"/><ellipse cx="77.353" cy="34.734" rx="10.851" ry="10.477" stroke-width=".2721"/><ellipse cx="94.758" cy="38.973" rx="10.851" ry="10.29" stroke-width=".28031"/></g><g transform="translate(32.353 -13.436)" fill="#fff" filter="url(#CloudFilter)" opacity=".9"><ellipse cx="109.73" cy="34.951" rx="6.1739" ry="6.8287" stroke-width=".15433"/><ellipse cx="83.907" cy="34.296" rx="10.851" ry="11.599" stroke-width=".29762"/><ellipse cx="72.021" cy="33.892" rx="6.4546" ry="6.6416" stroke-width=".16709"/><ellipse cx="96.722" cy="34.015" rx="12.441" ry="14.125" stroke-width=".35167"/></g>';
    }

    function renderStarsDefs() private pure returns (string memory) {
        return
            '<g id="star"><polygon points="5,0 6.5,4.5 10,5.5 6.5,7 5,11 3.5,7 0,5.5 3.5,4.5" fill="#fff"/></g>';
    }

    function renderStars() private pure returns (string memory) {
        return
            '<g><use href="#star" x="7" y="7"/><use href="#star" x="20" y="34"/><use href="#star" x="45" y="15"/><use href="#star" x="71" y="44"/><use href="#star" x="87" y="5"/><use href="#star" x="118" y="35"/><use href="#star" x="137" y="3"/><use href="#star" x="161" y="50"/></g>';
    }

    function renderBackBuildingsObjects(
        uint8[] memory backBuildingIds
    ) private pure returns (string memory) {
        int16 startOffset = -15;

        uint16 buildingWidth = 30;
        string memory pathData = "";
        for (uint8 i = 0; i < backBuildingIds.length; i++) {
            pathData = string(
                abi.encodePacked(
                    pathData,
                    getBackBuildingPath(
                        backBuildingIds[i],
                        startOffset + int16(buildingWidth * i),
                        120
                    )
                )
            );
        }
        string memory buildings = string(
            abi.encodePacked('<path d="', pathData, ' z"/>')
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
    ) internal pure returns (string memory) {
        uint16 buildingWidth = 30;
        string memory pathData = "";
        for (uint8 i = 0; i < buildingIds.length; i++) {
            pathData = string(
                abi.encodePacked(
                    pathData,
                    getBackBuildingPath(
                        buildingIds[i],
                        startOffset + int16(buildingWidth * i),
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
                        int2str(x),
                        " ",
                        int2str(y),
                        " v -30 l 15-15 l 15 15 v 30 "
                    )
                );
        } else if (buildingId == 2) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        int2str(x + 7),
                        " ",
                        int2str(y),
                        " v -40 h 16 v 40 "
                    )
                );
        } else if (buildingId == 3) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        int2str(x),
                        " ",
                        int2str(y),
                        " v -30 h 30 v 30 "
                    )
                );
        } else if (buildingId == 4) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        int2str(x),
                        " ",
                        int2str(y),
                        " v -40 h 5 v -5 h 5 v -5 h 4 v -10 h 2 v 10 h 4 v 5 h 5 v 5 h 5 v 40 "
                    )
                );
        } else if (buildingId == 5) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        int2str(x + 10),
                        " ",
                        int2str(y),
                        " v -20 h 15 v 20 "
                    )
                );
        } else if (buildingId == 6) {
            return
                string(
                    abi.encodePacked(
                        "M ",
                        int2str(x + 2),
                        " ",
                        int2str(y),
                        " v -25 h 3 v -20 h 15 v 20 h 8 v 25 "
                    )
                );
        } else {
            return "";
        }
    }

    function renderRoad() private pure returns (string memory) {
        return
            '<rect y="170" width="200" height="30" fill="#4d4d4d" stroke-width=".26458"/><g fill="#fff"><rect x="10" y="183" width="30" height="4"/><rect x="60" y="183" width="30" height="4"/><rect x="110" y="183" width="30" height="4"/><rect x="160" y="183" width="30" height="4"/></g>';
    }

    function int2str(
        int _i
    ) internal pure returns (string memory _intAsString) {
        if (_i < 0)
            return
                string(abi.encodePacked("-", Strings.toString(uint(_i * -1))));
        return Strings.toString(uint(_i));
    }
}
