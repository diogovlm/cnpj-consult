import { createPartnerCard } from './components/partnerCard/partnerCard.js';

const CNPJ_LENGTH = 14;

/* ----------------- Event Handling Functions ----------------- */

/**
 * Initializes event listeners for CNPJ input field.
 */
function handleCNPJInput() {
  const cnpjInput = document.getElementById('cnpjInput');
  cnpjInput.addEventListener('input', handleCNPJInputEvent);
  cnpjInput.addEventListener('paste', handleCNPJPasteEvent);
  cnpjInput.addEventListener('keypress', handleCNPJKeyPressEvent);
}

/**
 * Handles input event for CNPJ field, limiting input to valid CNPJ format.
 */
function handleCNPJInputEvent() {
  this.value = limitCNPJInput(this.value);
}

/**
 * Handles paste event for CNPJ field, ensuring pasted content is in valid CNPJ format.
 */
function handleCNPJPasteEvent(event) {
  event.preventDefault();
  let pastedData = (event.clipboardData || window.clipboardData).getData('Text');
  this.value = limitCNPJInput(pastedData);
}

/**
 * Handles keypress event for CNPJ field, triggering search on Enter key press.
 */
function handleCNPJKeyPressEvent(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchCNPJ();
  }
}

/* ----------------- Utility Functions ----------------- */

/**
 * Limits input to valid CNPJ format (14 digits).
 */
function limitCNPJInput(value) {
  return value.replace(/\D/g, '').slice(0, CNPJ_LENGTH);
}

/**
 * Toggles visibility of an HTML element by its ID.
 */
function toggleElementVisibility(elementId, show) {
  const element = document.getElementById(elementId);
  element.style.display = show ? 'block' : 'none';
}

/**
 * Displays an error message if provided, otherwise hides the error message element.
 */
function toggleError(message = null) {
  toggleElementVisibility('errorMessage', !!message);
  if (message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
  }
}

/**
 * Displays or hides the loading message.
 */
function displayLoading(show) {
  toggleElementVisibility('loadingMessage', show);
  if (show) toggleError(); // Hide any existing error messages while loading
}

/**
 * Validates whether the given CNPJ is the correct length.
 */
function isCNPJValid(cnpj) {
  return cnpj.length === CNPJ_LENGTH;
}

/**
 * Checks if the results section is currently visible.
 */
function isResultsVisible() {
  return document.getElementById('results').style.display === 'block';
}

/**
 * Clears the CNPJ input field.
 */
function clearCNPJInput(cnpjInput) {
  cnpjInput.value = '';
}

/* ----------------- Data Fetching Functions ----------------- */

/**
 * Fetches company data from Brasil API using the provided CNPJ.
 */
async function fetchCNPJData(cnpj) {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na consulta do CNPJ');
  }
  return response.json();
}

/* ----------------- Main Function: Search and Display ----------------- */

/**
 * Initiates a CNPJ search, fetches company data, and displays it.
 */
async function searchCNPJ() {
  resetResults();

  const cnpjInput = document.getElementById('cnpjInput');
  const cnpj = cnpjInput.value.trim();

  if (!isCNPJValid(cnpj)) {
    toggleError('O CNPJ deve conter 14 dígitos.');
    return;
  }

  if (isResultsVisible()) {
    convertInputsToSpans();
  }

  displayLoading(true);

  try {
    const data = await fetchCNPJData(cnpj);
    populateCompanyDetails(data);
    displayPartners(data.qsa);
    toggleElementVisibility('results', true);
    toggleError();
  } catch (error) {
    toggleError(error.message);
  } finally {
    displayLoading(false);
  }

  clearCNPJInput(cnpjInput);
}

/* ----------------- Reset and Conversion Functions ----------------- */

/**
 * Resets the results section, converting any inputs back to spans.
 */
function resetResults() {
  convertInputsToSpans();
  toggleElementVisibility('submitButton', false);
  toggleElementVisibility('editButton', true);
}

/**
 * Converts all input fields within the results section back to span elements.
 */
function convertInputsToSpans() {
  const inputs = document.querySelectorAll('#results input');
  if (inputs.length !== 0) {
    const editedData = extractFormData(inputs);
    handleAddressElements(editedData);
    replaceInputsWithSpans(inputs, editedData);
  }
}

/* ----------------- Data Manipulation and Formatting Functions ----------------- */

/**
 * Extracts form data from input fields.
 */
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

/**
 * Populates company details in the results section.
 */
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

/**
 * Sets the content of a specified HTML element.
 */
function setContent(elementId, content, formatter = null) {
  const element = document.getElementById(elementId);
  element.textContent = formatter ? formatter(content) : content;
}

/**
 * Formats an address object into a readable string.
 */
function formatAddress(data) {
  return `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`;
}

/**
 * Formats a phone number string into a readable format.
 */
function formatPhoneNumber(phoneNumber) {
  let x = phoneNumber.replace(/\D/g, '');
  if (x.length > 11) x = x.slice(0, 11);
  if (x.length > 2) x = x.replace(/^(\d{2})(\d)/, '($1) $2');
  if (x.length > 6) x = x.replace(/(\d{4})(\d{4})$/, '$1-$2');
  else if (x.length > 7) x = x.replace(/(\d{5})(\d{4})$/, '$1-$2');
  return x;
}

/* ----------------- Partner Display and Editable Fields ----------------- */

/**
 * Displays the partners associated with the company.
 */
function displayPartners(partners) {
  const partnersContainer = document.getElementById('partners-container');
  partnersContainer.innerHTML = '';
  partners.forEach(partner => {
    const card = createPartnerCard(partner);
    partnersContainer.appendChild(card);
  });
}

/**
 * Toggles the fields in the results section to be editable.
 */
function toggleEditableFields() {
  const spans = document.querySelectorAll('#results span');
  makeFieldsEditable(spans);
}

/**
 * Converts span elements to editable input fields.
 */
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
    const input = createEditableInput(span);
    if (span.id === 'companyAddress') {
      handleAddressInput(span, input);
    } else {
      span.replaceWith(input);
    }
  });

  initiatePhoneListener();

  toggleElementVisibility('editButton', false);
  toggleElementVisibility('submitButton', true);
}

/**
 * Creates an editable input field for a span element.
 */
function createEditableInput(span) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control';
  input.value = span.textContent;
  input.style.width = '100%';
  input.style.marginTop = '5px';
  input.id = span.id;
  return input;
}

/**
 * Handles the conversion of address spans to editable inputs.
 */
function handleAddressInput(span, input) {
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
}

/* ----------------- Address Handling and Data Update ----------------- */

/**
 * Updates the address elements with the new data.
 */
function handleAddressElements(editedData) {
  const addressParent = document.querySelector('#companyLogradouro')?.closest('.card-text')?.parentElement;
  if (addressParent) {
    removeAddressInputs();
    updateAddressElement(addressParent, editedData.companyAddress);
  } else {
    console.error('Address parent container not found. Cannot replace address fields.');
  }
}

/**
 * Removes address inputs from the DOM.
 */
function removeAddressInputs() {
  ['companyLogradouro', 'companyNumero', 'companyBairro', 'companyMunicipio', 'companyUf', 'companyCep'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.parentElement.remove();
    }
  });
}

/**
 * Updates the address element in the DOM with the provided address.
 */
function updateAddressElement(parent, address) {
  const newAddressElement = document.createElement('p');
  newAddressElement.className = 'card-text';
  newAddressElement.innerHTML = `<strong>Endereço Completo:</strong> <span id="companyAddress">${address}</span>`;
  parent.appendChild(newAddressElement);
}

/**
 * Replaces input fields with spans containing the updated data.
 */
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

/**
 * Updates the data with the newly edited values and logs them.
 */
function updateEditedData(editedData) {
  // For now, it is a simple console.log to show the updated data because there isn't an endpoint to send the editedData
  console.log(editedData);
}

/* ----------------- Phone Input Handling ----------------- */

/**
 * Initiates a listener on the phone input to format the phone number as the user types.
 */
function initiatePhoneListener() {
  document.getElementById('companyPhone').addEventListener('input', function (e) {
    e.target.value = formatPhoneNumber(e.target.value);
  });
}

/* ----------------- Button Handling Functions ----------------- */

/**
 * Handles the submission of edited data.
 */
function handleSubmitButton() {
  const inputs = document.querySelectorAll('#results input');
  const editedData = extractFormData(inputs);

  handleAddressElements(editedData);
  replaceInputsWithSpans(inputs, editedData);

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  toggleElementVisibility('submitButton', false);
  toggleElementVisibility('editButton', true);

  updateEditedData(editedData);
}

/* ----------------- Initialization ----------------- */

/**
 * Initializes event listeners when the DOM content is loaded.
 */
function initializeEventListeners() {
  handleCNPJInput();

  document.getElementById('searchButton').addEventListener('click', searchCNPJ);
  document.getElementById('editButton').addEventListener('click', toggleEditableFields);
  document.getElementById('submitButton').addEventListener('click', handleSubmitButton);
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);
