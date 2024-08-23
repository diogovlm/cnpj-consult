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
      document.getElementById('companyStatus').textContent = data.situacao;
      document.getElementById('companyActivity').textContent = data.cnae_fiscal_descricao;
      document.getElementById('companyAddress').textContent = `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`;
      document.getElementById('companyPhone').textContent = data.ddd_telefone_1 || "Telefone não disponível";
      document.getElementById('companyEmail').textContent = data.email || "E-mail não disponível";

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
      
      // Preserve the original ID of the span
      input.id = span.id;

      span.replaceWith(input);
    });
  } else {
    inputs.forEach(input => {
      const span = document.createElement('span');
      span.textContent = input.value;
      span.id = input.id;

      input.replaceWith(span);
    });
  }
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
  }
}
