// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract wallet {
    mapping(address => uint) public balances;


    receive() external payable {
        balances[msg.sender] += msg.value;
    } 
  //On préfère l'autre fonction a celle ci parce qu'on a pas besoin de voir le solde d'un autre utilisateur
  //Notre mapping prends déja une adresse donc pas besoin de l'ajouter
    // function getBalance(address _address) external view returns (uint) {
    //   return balances[_address];
    // }

    function getbalance() external view returns (uint) {
      return balances[msg.sender];
    }

  //On ne peut pas envoyer des fonds a un contrat sans une fonction receive ou fallback
    fallback() external payable {}

    function withdraw(address payable _to, uint _amount) external {
      require(_amount <= balances[msg.sender], "Insufficient balance");
      balances[msg.sender] -= _amount;
      _to.transfer(_amount);
    }

    
}
