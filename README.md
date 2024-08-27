# Consulta de CNPJ

## Descrição

Este projeto é uma aplicação web simples que permite a consulta de informações de empresas a partir de seu CNPJ utilizando a [API BrasilAPI](https://brasilapi.com.br/). O usuário pode visualizar informações como Nome, Razão Social, Data de Abertura, Situação, Atividade Principal, Endereço Completo, Telefone e E-mail da empresa, além de informações dos sócios.

## Funcionalidades

- **Consulta de CNPJ**: Insira o CNPJ da empresa e veja as informações principais retornadas pela API.
- **Edição de Informações**: Edite as informações exibidas diretamente na interface.
- **Exibição de Sócios**: Veja os dados dos sócios em cartões separados.

## Tecnologias Utilizadas

- **HTML5**: Estrutura do projeto.
- **CSS3**: Estilização da interface.
- **JavaScript (ES6+)**: Lógica do projeto e consumo da API.
- **Bootstrap 5**: Framework CSS para estilização e responsividade.
- **Bootstrap Icons**: Biblioteca de ícones.

## Pré-requisitos

Para executar o projeto localmente, você precisará de um navegador web moderno.

## Como Executar o Projeto

### 1. Clone o Repositório

Clone este repositório para o seu ambiente local usando o seguinte comando:

```bash
git clone https://github.com/diogovlm/cnpj-consult.git
```

### 2. Acesse a Pasta do Projeto

Navegue até a pasta do projeto clonado:

```bash
cd cnpj-consult
```

### 3. Execute o Projeto

Abra o arquivo \`index.html\` em seu navegador. Você pode fazer isso clicando duas vezes no arquivo ou abrindo-o diretamente no navegador.

**Opção alternativa**: Use uma extensão como "Live Server" no Visual Studio Code para lançar o projeto com um servidor local.

### 4. Utilize a Aplicação

- Insira o CNPJ da empresa no campo de busca e clique em "Consultar".
- As informações da empresa serão exibidas na tela.
- Clique no ícone de lápis no canto superior direito para editar as informações.
- Após editar, clique em "Salvar Informações" para finalizar a edição.

## Estrutura do Projeto

```plaintext
├── assets/
│   └── default-avatar.png
├── components/
│   └── partnerCard/
│       ├── partnerCard.js
│       └── partnerCard.css
├── index.html
├── script.js
├── styles.css
└── README.md
```

- **assets/default-avatar.png**: Imagem de avatar padrão para os cartões de sócio.
- **components/partnerCard/**: Contém os componentes de cartão de sócio.
- **index.html**: Página principal da aplicação.
- **script.js**: Script principal da aplicação.
- **styles.css**: Estilos personalizados para a aplicação.