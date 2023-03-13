pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";

import "./HexStrings.sol";

// import "./StringConverter.sol";

// import "./Seed.sol";

// import "./SVGBaseGenerator.sol";
// import "./SVGBuildingGenerator.sol";
import "./SVGGenerator.sol";

contract ElectroCityNFT is ERC721, Ownable {
    using Strings for uint256;
    using HexStrings for uint160;

    struct TokenData {
        bytes8 seed;
    }

    mapping(uint256 => TokenData) public tokenData;

    bool public lightIsOn = true;

    address[] private _lightOperators;

    event LightSwitched(bool isOn);

    constructor() public ERC721("ElectroCityNFT", "ECN") {
        _lightOperators.push(msg.sender);
    }

    function mint() public payable {
        require(totalSupply() < 1000, "Maximum token supply reached");
        require(msg.value >= 0.01 ether, "Price is 0.01 ETH");

        uint256 tokenId = totalSupply() + 1;

        bytes8 seed = bytes8(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenId))
        );

        tokenData[tokenId] = TokenData(seed);

        _mint(msg.sender, tokenId);
    }

    // function burn(uint256 tokenId) public {
    //     require(
    //         _isApprovedOrOwner(msg.sender, tokenId),
    //         "Caller is not owner nor approved"
    //     );
    //     _burn(tokenId);
    //     delete tokenData[tokenId];
    // }

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

    // function tokenURI(
    //     uint256 tokenId
    // ) public view override returns (string memory) {
    //     require(_exists(tokenId), "Token does not exist");

    //     string memory baseURI = "https://example.com/token/";

    //     return string(abi.encodePacked(baseURI, tokenId.toString()));
    // }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "not exist");
        string memory name = string(
            abi.encodePacked("ElectroCityNFT #", id.toString())
        );
        bytes8 seed = tokenData[id].seed;
        uint8 firstByte = uint8(bytes1(seed));
        bool isDay = ((firstByte & 0x80) == 0x80);
        uint dayBit = (firstByte >> 7) & 1;

        string memory description = string(
            abi.encodePacked(
                "This ElectroCityNFT seed:",
                uint2str(uint64(seed)),
                ", day byte: ",
                uint2str(dayBit),
                "!!!"
            )
        );
        string memory image = Base64.encode(
            bytes(SVGGenerator.generateSVGofTokenBySeed(seed, !lightIsOn))
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
                                //   '", "external_url":"https://burnyboys.com/token/',
                                //   id.toString(),
                                '", "attributes": [{"trait_type": "day", "value": ',
                                isDay ? "true" : "false",
                                //   '"},{"trait_type": "chubbiness", "value": ',
                                //   uint2str(chubbiness[id]),
                                '}], "owner":"',
                                (uint160(ownerOf(id))).toHexString(20),
                                '", "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function uint2str(
        uint _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // function generateSVGofTokenById(
    //     uint256 id
    // ) internal view returns (string memory) {
    //     string memory svg = string(
    //         abi.encodePacked(
    //             ' <svg width="200mm" height="200mm" version="1.1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
    //             renderTokenById(id),
    //             "</svg>"
    //         )
    //     );

    //     return svg;
    // }

    // // Visibility is `public` to enable it being called by other contracts for composition.
    // function renderTokenById(uint256 id) public view returns (string memory) {
    //     bytes32 seed = tokenData[id].seed;
    //     bool isDay = uint8(seed[0]) >= 128;
    //     string memory render = string(
    //         abi.encodePacked(
    //             "<defs>",
    //             renderSkyGradient(isDay),
    //             '<mask id="MoonMask" maskUnits="userSpaceOnUse">',
    //             '<path id="MoonMask_box" d="m159 19h22v22h-22z" fill="#fff"/>',
    //             '<circle cx="163.65" cy="27.354" r="10" d="m 173.65009,27.354164 a 10,10 0 0 1 -10,10 10,10 0 0 1 -10,-10 10,10 0 0 1 10,-10 10,10 0 0 1 10,10 z" stroke-width=".265"/>',
    //             "</mask>",
    //             "</defs>",
    //             "<g>",
    //             '<rect id="SkyBlueRect" width="200" height="200" fill="url(#SkyGradient)"/>',
    //             '<path d="m180 30a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10z" fill="#fff" mask="url(#MoonMask)"/>',
    //             '<g fill="#ccc" stroke="#ccc">',
    //             '<rect y="120" width="200" height="80"/>',
    //             '<path d="M -15 120 v -30 h 30 v 30 M 15 120 v -30 l 15-15 l 15 15 v 30 M 52.55 120 v -40 h 16 v 40 M 77 120 v -25 h 3 v -20 h 15 v 20 h 8 v 25 M 105 120 v -40 h 5 v -5 h 5 v -5 h 4 v -10 h 2 v 10 h 4 v 5 h 5 v 5 h 5 v 40 M 142.55 120 v -40 h 16 v 40 M 167 120 v -25 h 3 v -20 h 15 v 20 h 8 v 25  z"/>',
    //             "</g>",
    //             "</g>"
    //         )
    //     );

    //     return render;
    // }

    // function renderSkyGradient(
    //     bool isDay
    // ) private pure returns (string memory) {
    //     string memory render = string(
    //         abi.encodePacked(
    //             '<linearGradient id="SkyGradient" x1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">',
    //             '<stop stop-color="',
    //             isDay ? "#35d6ed" : "#360ccd",
    //             '" offset="0"/>',
    //             '<stop stop-color="',
    //             isDay ? "#65ddef" : "#302dd9",
    //             '" offset=".25"/>',
    //             '<stop stop-color="',
    //             isDay ? "#7ae5f5" : "#2a4ee5",
    //             '" offset=".5"/>',
    //             '<stop stop-color="',
    //             isDay ? "#97ebf4" : "#246ff0",
    //             '" offset=".75"/>',
    //             '<stop stop-color="',
    //             isDay ? "#c9f6ff" : "#1e90fc",
    //             '" offset="1"/>',
    //             "</linearGradient>"
    //         )
    //     );
    //     return render;
    // }

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
}
