function createPartnerCard(partner) {
  const card = document.createElement('div');
  card.className = 'partner-card';

  const name = document.createElement('h3');
  name.textContent = partner.nome_socio;
  card.appendChild(name);

  const avatar = document.createElement('img');
  const isGitHubPages = window.location.hostname.includes('github.io');
  let basePath = '';

  if (isGitHubPages) {
    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1];
    basePath = `/${repoName}`;
  }

  avatar.src = `${basePath}/assets/default-avatar.png`;
  avatar.alt = 'Profile Avatar';
  avatar.className = 'partner-avatar';
  card.appendChild(avatar);

  if (partner.qualificacao_socio) {
    const role = document.createElement('p');
    role.textContent = partner.qualificacao_socio;
    card.appendChild(role);
  }

  return card;
}

export { createPartnerCard };
