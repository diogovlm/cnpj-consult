import { createPartnerCard } from './components/partnerCard/partnerCard.js';

const cnpjInput = document.getElementById('cnpjInput');

cnpjInput.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
  if (this.value.length > 14) {
    this.value = this.value.slice(0, 14);
  }
});

document.getElementById('searchButton').addEventListener('click', function() {
  const cnpjInput = document.getElementById('cnpjInput');
  const cnpj = cnpjInput.value.trim();

  if (cnpj.length !== 14) {
    alert('O CNPJ deve conter 14 dígitos.');
    return;
  }

  if (document.getElementById('results').style.display === 'block') {
    revertEditableFields();
  }

  fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na consulta do CNPJ');
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('companyName').textContent = data.nome_fantasia || "Nome Fantasia não disponível";
      document.getElementById('companyLegalName').textContent = data.razao_social;
      document.getElementById('companyOpeningDate').textContent = data.data_inicio_atividade;
      document.getElementById('companyStatus').textContent = data.descricao_situacao_cadastral;
      document.getElementById('companyActivity').textContent = data.cnae_fiscal_descricao;
      document.getElementById('companyAddress').textContent = `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`;
      document.getElementById('companyPhone').textContent = data.ddd_telefone_1 || "Telefone não disponível";
      document.getElementById('companyEmail').textContent = data.email || "E-mail não disponível";

      displayPartners(data.qsa)

      document.getElementById('results').style.display = 'block';
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao buscar os dados do CNPJ. Por favor, tente novamente.');
    });

  cnpjInput.value = '';
});
document.getElementById('editButton').addEventListener('click', function() {
  const resultsDiv = document.getElementById('results');
  const spans = resultsDiv.querySelectorAll('span');
  const inputs = resultsDiv.querySelectorAll('input');

  if (inputs.length === 0) {
    spans.forEach(span => {
      const text = span.textContent;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.value = text;
      input.style.width = '100%';
      input.style.marginTop = '5px';
      input.id = span.id;

      span.replaceWith(input);
    });

    document.getElementById('submitButton').style.display = 'block';
  } else {
    inputs.forEach(input => {
      const span = document.createElement('span');
      span.textContent = input.value;
      span.id = input.id;

      input.replaceWith(span);
    });

    document.getElementById('submitButton').style.display = 'none';
  }
});

document.getElementById('submitButton').addEventListener('click', function() {
  const resultsDiv = document.getElementById('results');
  const inputs = resultsDiv.querySelectorAll('input');

  const editedData = {
    companyName: document.getElementById('companyName').textContent,
    companyLegalName: '',
    companyOpeningDate: '',
    companyStatus: '',
    companyActivity: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: ''
  };

  inputs.forEach(input => {
    switch (input.id) {
      case 'companyLegalName':
        editedData.companyLegalName = input.value;
        break;
      case 'companyOpeningDate':
        editedData.companyOpeningDate = input.value;
        break;
      case 'companyStatus':
        editedData.companyStatus = input.value;
        break;
      case 'companyActivity':
        editedData.companyActivity = input.value;
        break;
      case 'companyAddress':
        editedData.companyAddress = input.value;
        break;
      case 'companyPhone':
        editedData.companyPhone = input.value;
        break;
      case 'companyEmail':
        editedData.companyEmail = input.value;
        break;
    }
  });

  //The next line is only to show the new information because there is no endpoint to update the information
  console.log(editedData);

  revertEditableFields();
});

function revertEditableFields() {
  const resultsDiv = document.getElementById('results');
  const inputs = resultsDiv.querySelectorAll('input');

  if (inputs.length > 0) {
    inputs.forEach(input => {
      const span = document.createElement('span');
      span.textContent = input.value;
      span.id = input.id;
      input.replaceWith(span);
    });

    document.getElementById('submitButton').style.display = 'none';
  }
}

function displayPartners(partners) {
  const partnersContainer = document.getElementById('partners-container');
  partnersContainer.innerHTML = '';
  partners.forEach(partner => {
    const card = createPartnerCard(partner);
    partnersContainer.appendChild(card);
  });
}