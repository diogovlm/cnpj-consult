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