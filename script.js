import { createPartnerCard } from './components/partnerCard/partnerCard.js';

function handleCNPJInput() {
  const cnpjInput = document.getElementById('cnpjInput');

  cnpjInput.addEventListener('input', function () {
    this.value = limitCNPJInput(this.value)
  });

  cnpjInput.addEventListener('paste', function (event) {
    event.preventDefault();
    let pastedData = (event.clipboardData || window.clipboardData).getData('Text');
    this.value = limitCNPJInput(pastedData)
  });

  cnpjInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchCNPJ();
    }
  });
}

function limitCNPJInput(value) {
  let result = value.replace(/\D/g, '');
  result = result.slice(0, 14);
  return result
}

function toggleError(message = null) {
  const errorMessage = document.getElementById('errorMessage');
  if (message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  } else {
    errorMessage.style.display = 'none';
  }
}

function displayLoading(show) {
  const loadingMessage = document.getElementById('loadingMessage');
  loadingMessage.style.display = show ? 'block' : 'none';

  if (show) {
    toggleError();
  }
}

async function searchCNPJ() {
  updateElementsOnNewSearch()

  const cnpjInput = document.getElementById('cnpjInput');
  const cnpj = cnpjInput.value.trim();

  if (cnpj.length !== 14) {
    toggleError('O CNPJ deve conter 14 dígitos.');
    return;
  }

  if (document.getElementById('results').style.display === 'block') {
    setPlaneFields();
  }

  displayLoading(true);

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na consulta do CNPJ');
    }
    const data = await response.json();
    populateCompanyDetails(data);
    displayPartners(data.qsa);
    document.getElementById('results').style.display = 'block';
    toggleError();
  } catch (error) {
    toggleError(error.message);
  } finally {
    displayLoading(false);
  }

  cnpjInput.value = '';
}

function populateCompanyDetails(data) {
  setContent('companyName', data.nome_fantasia || "Nome Fantasia não disponível");
  setContent('companyLegalName', data.razao_social);
  setContent('companyOpeningDate', data.data_inicio_atividade);
  setContent('companyStatus', data.descricao_situacao_cadastral);
  setContent('companyActivity', data.cnae_fiscal_descricao);
  setContent('companyAddress', data, formatAddress);
  setContent('companyPhone', data.ddd_telefone_1 || "Telefone não disponível", formatPhoneNumber);
  setContent('companyEmail', data.email || "E-mail não disponível");
}

function setContent(elementId, content, formatter = null) {
  const element = document.getElementById(elementId);
  element.textContent = formatter ? formatter(content) : content;
}

function formatAddress(data) {
  return `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`;
}

function formatPhoneNumber(phoneNumber) {
  let x = phoneNumber.replace(/\D/g, '');

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

  return x;
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
  companyNameInputContainer.innerHTML = `
  <strong>Nome:</strong>
  <input type="text" class="form-control" id="companyName" value="${companyNameText}" style="width: 100%; margin-top: 5px;">`;

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
      const [municipio, uf] = municipioUf.split(' - ');

      span.parentElement.innerHTML = `
        <p class="card-text"><strong>Logradouro:</strong> <input type="text" class="form-control" id="companyLogradouro" value="${logradouro}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Número:</strong> <input type="text" class="form-control" id="companyNumero" value="${numero}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Bairro:</strong> <input type="text" class="form-control" id="companyBairro" value="${bairro}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>Município:</strong> <input type="text" class="form-control" id="companyMunicipio" value="${municipio}" style="width: 100%; margin-top: 5px;"></p>
        <p class="card-text"><strong>UF:</strong> <input type="text" class="form-control" id="companyUf" value="${uf}" style="width: 100%; margin-top: 5px;"></p>
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
    const formattedPhone = formatPhoneNumber(e.target.value);
    e.target.value = formattedPhone;
  });
}

function updateElementsOnNewSearch() {
  const inputs = document.querySelectorAll('#results input');
  if(inputs.length !== 0) {
    const editedData = extractFormData(inputs);

    handleAddressElements(editedData)
    replaceInputsWithSpans(inputs, editedData);

    document.getElementById('submitButton').style.display = 'none';
    document.getElementById('editButton').style.display = 'block';
  }
}

function updateEditedData(editedData) {
  // For now, it is a simple console.log to show the updated data because there isn't an endpoint to send the editedData
  console.log(editedData);
}

function handleSubmitButton() {
  const inputs = document.querySelectorAll('#results input');
  const editedData = extractFormData(inputs);

  handleAddressElements(editedData)
  replaceInputsWithSpans(inputs, editedData);

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('submitButton').style.display = 'none';
  document.getElementById('editButton').style.display = 'block';

  updateEditedData(editedData)
}

function handleAddressElements(editedData) {
  const addressParent = document.querySelector('#companyLogradouro')?.closest('.card-text')?.parentElement;
  if (addressParent) {
    removeAddressInputs();
    updateAddressElement(addressParent, editedData.companyAddress);
  } else {
    console.error('Address parent container not found. Cannot replace address fields.');
  }
}

function extractFormData(inputs) {
  let formData = {};

  inputs.forEach(input => {
    let value = input.value;

    if (input.id === 'companyPhone') {
      value = value.replace(/\D/g, '');
    }

    formData[input.id] = value;
  });

  formData.companyAddress = `${formData.companyLogradouro}, ${formData.companyNumero}, ${formData.companyBairro}, ${formData.companyMunicipio} - ${formData.companyUf}, ${formData.companyCep}`;

  return formData;
}

function removeAddressInputs() {
  ['companyLogradouro', 'companyNumero', 'companyBairro', 'companyMunicipio', 'companyUf', 'companyCep'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.parentElement.remove();
    }
  });
}

function updateAddressElement(parent, address) {
  const newAddressElement = document.createElement('p');
  newAddressElement.className = 'card-text';
  newAddressElement.innerHTML = `<strong>Endereço Completo:</strong> <span id="companyAddress">${address}</span>`;
  
  parent.appendChild(newAddressElement);
}

function replaceInputsWithSpans(inputs, data) {
  inputs.forEach(input => {
    const span = document.createElement('span');
    span.textContent = input.id === 'companyPhone' ? formatPhoneNumber(input.value) : input.value;
    span.id = input.id;

    if (input.id === 'companyName') {
      const companyNameElement = document.createElement('h2');
      companyNameElement.className = 'card-title';
      companyNameElement.id = 'companyName';
      companyNameElement.textContent = data.companyName;
      input.parentElement.replaceWith(companyNameElement);
    } else {
      input.replaceWith(span);
    }
  });
}

function initializeEventListeners() {
  handleCNPJInput();

  document.getElementById('searchButton').addEventListener('click', searchCNPJ);
  document.getElementById('editButton').addEventListener('click', toggleEditableFields);
  document.getElementById('submitButton').addEventListener('click', handleSubmitButton);
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);
