// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProximitySensorManager {

    address public admin;

    //construtor definido para armazenar o endereço que implantou o contrato
    constructor() {
        admin = msg.sender;
    }

    // Estrutura mínima para sintetizar os dados de registro dos sensores de proximidade
    struct ProximitySensor {
        string macAddress;
        string measurementType; // esperado: "proximity"
        uint256 registeredAt;
        uint256 expiresAt;
        bool isValid;
    }

    // Mapeamento usando UID como chave
    mapping(string => ProximitySensor) public sensors;

    //evento de log para o processo de registro
    event SensorRegistered(
        string uid,
        string macAddress,
        string measurementType,
        uint256 registeredAt,
        uint256 expiresAt
    );

    // modificador que limita o uso de funcionalidades ao administrador
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    function registerProximitySensor(string memory _uid, string memory _macAddress) public onlyAdmin {
        // validação de UID e MAC
        require(bytes(_uid).length > 0, "UID cannot be empty");
        require(bytes(_macAddress).length > 0, "MAC cannot be empty");
	
	//verifica se o dispositivo já/ainda está registrado na rede
        require(!sensors[_uid].isValid, "Device already registered");

        //síntese da data de registro do dispositivo e seu período de validade
        uint256 nowTimestamp = block.timestamp;
        uint256 expiryTimestamp = nowTimestamp + 2 minutes;

        sensors[_uid] = ProximitySensor({
            macAddress: _macAddress,
            measurementType: "proximity",
            registeredAt: nowTimestamp,
            expiresAt: expiryTimestamp,
            isValid: true
        });

        emit SensorRegistered(_uid, _macAddress, "proximity", nowTimestamp, expiryTimestamp);
    }

//Se o dispositivo está registrado e a data de validade ainda não foi atingida, a função de autenticação retorna 'true'
    function isProximitySensorAuthentic(string memory _uid) public view returns (bool) {
        ProximitySensor memory device = sensors[_uid];
        return device.isValid && block.timestamp <= device.expiresAt;
    }
}
