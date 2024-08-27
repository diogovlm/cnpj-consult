import { createPartnerCard } from './components/partnerCard/partnerCard.js';

function handleCNPJInput() {
  const cnpjInput = document.getElementById('cnpjInput');
  cnpjInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    if (this.value.length > 14) {
      this.value = this.value.slice(0, 14);
    }
  });
}

function searchCNPJ() {
  const cnpjInput = document.getElementById('cnpjInput');
  const cnpj = cnpjInput.value.trim();

  if (cnpj.length !== 14) {
    alert('O CNPJ deve conter 14 dígitos.');
    return;
  }

  if (document.getElementById('results').style.display === 'block') {
    setPlaneFields();
  }

  fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na consulta do CNPJ');
      }
      return response.json();
    })
    .then(data => {
      populateCompanyDetails(data);
      displayPartners(data.qsa);
      document.getElementById('results').style.display = 'block';
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao buscar os dados do CNPJ. Por favor, tente novamente.');
    });

  cnpjInput.value = '';
}

function populateCompanyDetails(data) {
  document.getElementById('companyName').textContent = data.nome_fantasia || "Nome Fantasia não disponível";
  document.getElementById('companyLegalName').textContent = data.razao_social;
  document.getElementById('companyOpeningDate').textContent = data.data_inicio_atividade;
  document.getElementById('companyStatus').textContent = data.descricao_situacao_cadastral;
  document.getElementById('companyActivity').textContent = data.cnae_fiscal_descricao;
  document.getElementById('companyAddress').textContent = `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`;

  const phoneElement = document.getElementById('companyPhone');
  phoneElement.textContent = data.ddd_telefone_1 || "Telefone não disponível";

  if (phoneElement.textContent !== "Telefone não disponível") {
    formatPhoneNumber({ target: phoneElement });
  }

  document.getElementById('companyEmail').textContent = data.email || "E-mail não disponível";
}

function displayPartners(partners) {
  const partnersContainer = document.getElementById('partners-container');
  partnersContainer.innerHTML = '';
  partners.forEach(partner => {
    const card = createPartnerCard(partner);
    partnersContainer.appendChild(card);
  });
}

function toggleEditableFields() {
  const resultsDiv = document.getElementById('results');
  const spans = resultsDiv.querySelectorAll('span');
  makeFieldsEditable(spans);
}

function makeFieldsEditable(spans) {
  const companyNameElement = document.getElementById('companyName');
  const companyNameText = companyNameElement.textContent;

  const companyNameInputContainer = document.createElement('p');
  companyNameInputContainer.className = 'card-text';
  companyNameInputContainer.innerHTML = `<strong>Nome:</strong> <input type="text" class="form-control" id="companyName" value="${companyNameText}" style="width: 100%; margin-top: 5px;">`;

  companyNameElement.parentElement.replaceChild(companyNameInputContainer, companyNameElement);

  spans.forEach(span => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.value = span.textContent;
    input.style.width = '100%';
    input.style.marginTop = '5px';
    input.id = span.id;

    if (span.id === 'companyAddress') {
      const [logradouro, numero, bairro, municipioUf, cep] = span.textContent.split(', ');
      const [municipio, state] = municipioUf.split(' - ');

      span.parentElement.innerHTML = `
        <p class="card-text"><strong>Logradouro:</strong> <input type="text" class="form-control" id="companyLogradouro" value="${logradouro}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Número:</strong> <input type="text" class="form-control" id="companyNumero" value="${numero}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Bairro:</strong> <input type="text" class="form-control" id="companyBairro" value="${bairro}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Município:</strong> <input type="text" class="form-control" id="companyMunicipio" value="${municipio}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>UF:</strong> <input type="text" class="form-control" id="companyUf" value="${state}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>CEP:</strong> <input type="text" class="form-control" id="companyCep" value="${cep}" style="width: 100%; margin-top: 5px;"></p>
      `;
    } else {
      span.replaceWith(input);
    }
  });

  initiatePhoneListener();

  document.getElementById('editButton').style.display = 'none';
  document.getElementById('submitButton').style.display = 'block';
}

function setPlaneFields() {
  const resultsDiv = document.getElementById('results');
  const inputs = resultsDiv.querySelectorAll('input');

  if (inputs.length > 0) {
    inputs.forEach(input => {
      if (input.id === 'companyName') {
        const companyNameElement = document.createElement('h2');
        companyNameElement.className = 'card-title';
        companyNameElement.id = 'companyName';
        companyNameElement.textContent = input.value;

        input.parentElement.replaceWith(companyNameElement);
      } else {
        const span = document.createElement('span');
        span.textContent = input.value;
        span.id = input.id;

        input.replaceWith(span);
      }
    });

    document.getElementById('submitButton').style.display = 'none';
    document.getElementById('editButton').style.display = 'block';
  }
}

function initiatePhoneListener() {
  document.getElementById('companyPhone').addEventListener('input', function(e) {
    formatPhoneNumber(e);
  });
}

function formatPhoneNumber(e) {
  let x;
  const isAnInput = e.target.tagName === 'INPUT';

  isAnInput ? x = e.target.value.replace(/\D/g, '') : x = e.target.textContent.replace(/\D/g, ''); // Clear the string to only numbers

  if (x.length > 11) {
    x = x.slice(0, 11); // Limit to 11 digits
  }

  if (x.length > 2) {
    x = x.replace(/^(\d{2})(\d)/, '($1) $2'); // Format the area code
  }

  if (x.length > 6) {
    x = x.replace(/(\d{4})(\d{4})$/, '$1-$2'); // Format as 8-digit number (XXXX-XXXX)
  } else if (x.length > 7) {
    x = x.replace(/(\d{5})(\d{4})$/, '$1-$2'); // Format as 9-digit number (XXXXX-XXXX)
  }

  isAnInput ? e.target.value = x : e.target.textContent = x;
}

function handleSubmitButton() {
  const resultsDiv = document.getElementById('results');
  const inputs = resultsDiv.querySelectorAll('input');

  const editedData = {
    companyName: '',
    companyLegalName: '',
    companyOpeningDate: '',
    companyStatus: '',
    companyActivity: '',
    companyLogradouro: '',
    companyNumero: '',
    companyBairro: '',
    companyMunicipio: '',
    companyUf: '',
    companyCep: '',
    companyPhone: '',
    companyEmail: ''
  };

  inputs.forEach(input => {
    let value = input.value;

    if (input.id === 'companyPhone') {
      value = value.replace(/\D/g, '');
    }

    switch (input.id) {
      case 'companyName':
        editedData.companyName = value;
        break;
      case 'companyLegalName':
        editedData.companyLegalName = value;
        break;
      case 'companyOpeningDate':
        editedData.companyOpeningDate = value;
        break;
      case 'companyStatus':
        editedData.companyStatus = value;
        break;
      case 'companyActivity':
        editedData.companyActivity = value;
        break;
      case 'companyLogradouro':
        editedData.companyLogradouro = value;
        break;
      case 'companyNumero':
        editedData.companyNumero = value;
        break;
      case 'companyBairro':
        editedData.companyBairro = value;
        break;
      case 'companyMunicipio':
        editedData.companyMunicipio = value;
        break;
      case 'companyUf':
        editedData.companyUf = value;
        break;
      case 'companyCep':
        editedData.companyCep = value;
        break;
      case 'companyPhone':
        editedData.companyPhone = value;
        break;
      case 'companyEmail':
        editedData.companyEmail = value;
        break;
    }
  });

  console.log(editedData);

  editedData.companyAddress = `${editedData.companyLogradouro}, ${editedData.companyNumero}, ${editedData.companyBairro}, ${editedData.companyMunicipio} - ${editedData.companyUf}, ${editedData.companyCep}`;

  const addressParent = document.querySelector('#companyLogradouro')?.closest('.card-text')?.parentElement;
  
  if (addressParent) {
    ['companyLogradouro', 'companyNumero', 'companyBairro', 'companyMunicipio', 'companyUf', 'companyCep'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.parentElement.remove();
      }
    });

    const newAddressElement = document.createElement('p');
    newAddressElement.className = 'card-text';
    newAddressElement.innerHTML = `<strong>Endereço Completo:</strong> <span id="companyAddress">${editedData.companyAddress}</span>`;
    
    addressParent.appendChild(newAddressElement);
  } else {
    console.error('Address parent container not found. Cannot replace address fields.');
  }

  inputs.forEach(input => {
    if (input.id === 'companyName') {
      const companyNameElement = document.createElement('h2');
      companyNameElement.className = 'card-title';
      companyNameElement.id = 'companyName';
      companyNameElement.textContent = editedData.companyName;

      input.parentElement.replaceWith(companyNameElement);
    } else if (!input.id.startsWith('companyLogradouro') && !input.id.startsWith('companyNumero') &&
               !input.id.startsWith('companyBairro') && !input.id.startsWith('companyMunicipio') &&
               !input.id.startsWith('companyUf') && !input.id.startsWith('companyCep')) {
      const span = document.createElement('span');
      span.textContent = input.value;
      span.id = input.id;

      input.replaceWith(span);
    }
  });

  document.getElementById('submitButton').style.display = 'none';
  document.getElementById('editButton').style.display = 'block';
}



function initializeEventListeners() {
  handleCNPJInput();

  document.getElementById('searchButton').addEventListener('click', searchCNPJ);
  document.getElementById('editButton').addEventListener('click', toggleEditableFields);
  document.getElementById('submitButton').addEventListener('click', handleSubmitButton);
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);
