// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./HexStrings.sol";

import "./SVGGenerator.sol";

contract ElectroCityNFT is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
    using Strings for uint256;
    using HexStrings for uint160;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 private _maxTotalSupply = 1000;

    struct TokenData {
        bytes8 seed;
    }

    mapping(uint256 => TokenData) public tokenData;

    bool public lightIsOn = true;

    address[] private _lightOperators;

    event LightSwitched(bool isOn);

    constructor() ERC721("ElectroCityNFT", "ECN") {
        _lightOperators.push(msg.sender);
    }

    function mint() public payable {
        require(_tokenIds.current() < _maxTotalSupply, "Maximum token supply reached");
        require(msg.value >= 0.01 ether, "Price is 0.01 ETH");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        bytes8 seed = bytes8(
            keccak256(abi.encodePacked(tokenId, block.timestamp, msg.sender))
        );

        tokenData[tokenId] = TokenData(seed);

        _mint(msg.sender, tokenId);
    }

    function maxTotalSupply() public view returns (uint256) {
        return _maxTotalSupply;
    }

    function changeLightIsOn(bool _lightIsOn) public onlyLightOperators {
        if (lightIsOn != _lightIsOn) {
            lightIsOn = _lightIsOn;
            emit LightSwitched(_lightIsOn);
        }
    }

    function addLightOperator(address operator) public onlyOwner {
        _lightOperators.push(operator);
    }

    function removeLightOperator(address operator) public onlyOwner {
        for (uint256 i = 0; i < _lightOperators.length; i++) {
            if (_lightOperators[i] == operator) {
                _lightOperators[i] = _lightOperators[
                    _lightOperators.length - 1
                ];
                _lightOperators.pop();
                break;
            }
        }
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function getTokenData(uint256 tokenId) public view returns (bytes32) {
        return tokenData[tokenId].seed;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "not exist");
        string memory name = string(
            abi.encodePacked("ElectroCityNFT #", id.toString())
        );

        bytes8 seed = tokenData[id].seed;

        SVGGenerator.SVGConfiguration memory svgConfiguration = SVGGenerator
            .generateSVGConfigurationBySeed(seed);

        string memory description = string(
            abi.encodePacked(
                "This ElectroCityNFT Seed: ",
                Strings.toString(uint64(seed))
            )
        );

        string memory attributes = string(
            abi.encodePacked(
                '{"trait_type": "Celestial Body", "value": "',
                getCelestialBodyName(svgConfiguration.celestialBody),
                '"}',
                ',{"trait_type": "Time of Day", "value": "',
                getTimeOfDayName(svgConfiguration.timeOfDay),
                '"}',
                ',{"trait_type": "Weather", "value": ',
                svgConfiguration.weather == 1 ? '"Clouds"' : '""',
                "}",
                ',{"trait_type": "Cosmos", "value": ',
                svgConfiguration.cosmos == 1 ? '"Stars"' : '""',
                "}"
            )
        );

        string memory image = Base64.encode(
            bytes(SVGGenerator.renderSVG(svgConfiguration, !lightIsOn))
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"',
                                description,
                                '", "attributes": [',
                                attributes,
                                '], "owner":"',
                                (uint160(ownerOf(id))).toHexString(20),
                                '", "image": "data:image/svg+xml;base64,',
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getCelestialBodyName(
        uint8 celestialBody
    ) private pure returns (string memory) {
        if (celestialBody == 1) return "Sun";
        if (celestialBody == 2) return "Moon";

        return "";
    }

    function getTimeOfDayName(
        uint8 timeOfDay
    ) private pure returns (string memory) {
        //  Sunrise = 1, Day = 2 , Sunset = 3, Night = 4, Twilight 5
        if (timeOfDay == 1) return "Sunrise";
        if (timeOfDay == 3) return "Sunset";
        if (timeOfDay == 4) return "Night";
        if (timeOfDay == 5) return "Twilight";

        return "Day";
    }

    modifier onlyLightOperators() {
        bool isOperator = false;
        for (uint256 i = 0; i < _lightOperators.length; i++) {
            if (_lightOperators[i] == msg.sender) {
                isOperator = true;
                break;
            }
        }
        require(isOperator, "Only light operators can change lightIsOn");
        _;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {
        mint();
    }
}
