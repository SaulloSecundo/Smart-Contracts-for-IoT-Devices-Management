# Contratos inteligentes para provisionamento de dispositivos IoT

Este projeto implementa contratos inteligentes Ethereum para atuação nos processos de registro e autenticação temporária de dispositivos IoT. No presente recorte, a proposta é permitir que sensores sejam registrados por um administrador e tenham seu tempo de validade controlado na blockchain, com autenticação verificável.

Atualmente, o projeto contempla quatro tipos de sensores:

```shell
ProximitySensorManager
MotionSensorManager
HumiditySensorManager
TemperatureSensorManager
```

##  Requisitos

- Node.js (v18+)
- Hardhat (```npm install --save-dev hardhat```)
- Ganache (interface gráfica ou CLI)

## Como rodar localmente

### 1. Clone o repositório

```shell
git clone https://github.com/SaulloSecundo/Smart-Contracts-for-IoT-Devices-Management.git
cd Smart-Contracts-for-IoT-Devices-Management
```

### 2. Instale as dependências

```shell
npm install
```
### 3. Inicie o Ganache
- Abra o Ganache (UI ou CLI)
- Copie a RPC URL e mantenha visível a chave privada de uma conta
- Configure o Hardhat (se necessário):

Se ainda não tiver configurado, edite hardhat.config.js com a RPC e a private key:

```shell
module.exports = {
  defaultNetwork: "ganache",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // ou sua URL do Ganache
      accounts: ["SUA_CHAVE_PRIVADA", "outra chave (se necessário)"]
    }
  },
  solidity: "0.8.20"
};
```
## Como compilar e fazer o deploy dos contratos

### 1. Compile os contratos

```shell
npx hardhat compile
```

### 2. Deploy dos contratos na rede local (Ganache)

```shell
npx hardhat run scripts/deploy.js --network ganache
```
Isso irá compilar e implantar os quatro contratos, e exibir os endereços na rede Ganache.

## Como interagir com os contratos

Esta seção demonstra como interagir com o contrato inteligente HumiditySensorManager utilizando o Hardhat Console, após o deploy do contrato em uma rede local ou de testes.

### 1. Use o console interativo do Hardhat

```shell
npx hardhat console --network ganache
```
### 2. Exemplo de interação: contrato HumiditySensorManager

OBS.: A interação com os demais contratos seguem a mesma lógica

#### Obtenção das contas e conexão com o contrato

```shell
const [admin, deviceOwner] = await ethers.getSigners();

const HumiditySensorManager = await ethers.getContractFactory("HumiditySensorManager");
const humiditySensorManager = await HumiditySensorManager.attach("ENDERECO_DO_CONTRATO");
```
OBS.: O endereço do contrato deve ser substituído pelo endereço obtido no momento do deploy.

#### Registro de sensores de umidade

O registro de sensores é uma operação restrita ao administrador do contrato (conta que realizou o deploy).

```shell
registerHumiditySensor(
  string uid,
  string macAddress,
  address owner
)
```
Exemplo de registro: 

```shell
await humiditySensorManager.registerHumiditySensor(
  "UID123",
  "00:11:22:33:44:55",
  deviceOwner.address
);
```

#### Regras de validação aplicadas

O uid: 
  - não pode ser vazio
  - deve ter no máximo 64 caracteres
    
O macAddress deve possuir tamanho válido;
O owner não pode ser o endereço zero (address(0));
Um mesmo uid não pode ser registrado mais de uma vez;
Apenas o admin pode executar esta operação;

#### Consulta dos dados do sensor

Após o registro, os dados do sensor podem ser consultados diretamente no mapeamento público:

```shell
const sensor = await humiditySensorManager.sensors("UID123");

console.log(sensor.macAddress);
console.log(sensor.owner);
console.log(sensor.isValid);
```

#### Validação do sensor cadastrado

```shell
isHumiditySensorAuthentic(string uid) → bool // true, se atender as regras de validação
```

Exemplo de uso:

```shell
const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
console.log("Sensor autêntico?", isAuthentic);
```

Observação importante sobre expiração:
Sensores possuem um tempo máximo de validade definido no contrato (2 minutos).
Após esse período, o sensor é considerado não autêntico, mesmo que não tenha sido revogado manualmente.

## Estrutura dos Contratos

Cada contrato segue a mesma lógica de autenticação temporária. Eles contêm:

### Modificador ```onlyAdmin```

Permite que apenas o administrador (endereço que fez o deploy) execute funções críticas como o registro de sensores.

### ```Struct``` específica

Cada contrato define uma struct que sintetisa o mínimo de informações necessárias para efetivar a identificação única dos dispositivos no processo de registro. No contrato destinado aos sensores de umidade, por exemplo, temos o seguinte:

```shell
struct HumiditySensor {
  string macAddress;
  uint256 registeredAt;
  uint256 expiresAt;
  bool isValid;
}
```

Para cada dispositivo registrado, o "uid" informado é mapeado para uma strutc que contém os dados do aparelho correspondente.
 
### Função ```register<SensorType>Sensor```

Registra um sensor na blockchain com validade de 2 minutos (tempo de expiração usado para testes rápidos):

```shell
function registerHumiditySensor(string memory _deviceID) public onlyAdmin
```

### Função ```is<SensorType>SensorAuthentic```

Verifica se o sensor está ativo e dentro do tempo de validade:

```shell
function isHumiditySensorAuthentic(string memory _deviceID) public view returns (bool)
```
## Como rodar os testes

Os testes automatizados básicos estão localizados na pasta ```test/```. Para executá-los:

```shell
npx hardhat test
```

Os testes cobrem:

- Registro de sensores
- Velidação de dados de entrada
- Validação de entidades cadastradas 
- Verificações de segurança básica
- Acesso restrito a administradores

## Observações

- Os contratos foram organizados por tipo de sensor para maior modularidade.
- Por se tratar de um MVSC, o projeto pode ser facilmente expandido para classes distintas de dispostivos com dados mais complexos.
- Os contratos foram implantados usando scripts/deploy.js

