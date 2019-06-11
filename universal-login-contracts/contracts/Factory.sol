pragma solidity ^0.5.2;

contract Factory {
    address public contractAddress;

    function createContract(address signer, bytes32 salt, bytes memory initCode) public {
        bytes32 finalSalt = keccak256(abi.encodePacked(salt, signer));
        address newContractAddress;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            newContractAddress := create2(0, add(initCode, 0x20), mload(initCode), finalSalt)
            if iszero(extcodesize(newContractAddress)) {revert(0, 0)}
        }
        contractAddress = newContractAddress;
    }

    function computeContractAddress(address signer, bytes32 salt, bytes memory initCode) public view returns(address futureContractAddress) {
        bytes32 finalSalt = keccak256(abi.encodePacked(salt, signer));
        bytes32 hashedData = keccak256(abi.encodePacked(bytes1(0xff), address(this), finalSalt, keccak256(initCode)));
        futureContractAddress = convertDataToAddress(hashedData);
        return futureContractAddress;
    }

    function convertDataToAddress(bytes32 data) internal view returns(address) {
        return address(bytes20(data << 96));
    }
}
