
// ═══════════════════════════════════════════
// CORRECTIONS v2.1 — intégrées directement
// ═══════════════════════════════════════════

// FIX 1: switchTab — support onglet "upcoming"
(function(){
  const origSwitchTab = window.switchTab;
  window.switchTab = function(tab) {
    currentTab = tab;
    const isUCL = currentLeague === 'ucl';
    ['tab-class','tab-match','tab-upcoming','tab-bracket'].forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      el.className = 'btn btn-outline';
      if(id === 'tab-bracket') {
        el.style.cssText = 'width:auto;padding:0 20px;height:38px;font-size:13px;display:' + (isUCL ? '' : 'none');
      } else {
        el.style.cssText = 'width:auto;padding:0 20px;height:38px;font-size:13px';
      }
    });
    const activeMap = {classement:'tab-class', matchs:'tab-match', upcoming:'tab-upcoming', bracket:'tab-bracket'};
    const aEl = document.getElementById(activeMap[tab] || 'tab-class');
    if(aEl) aEl.className = 'btn';
    if(tab === 'bracket') showBracket(currentLeague);
    else if(tab === 'upcoming') loadUpcomingMatches(currentLeague);
    else if(currentLeague) loadLeagueData(currentLeague);
  };
})();

// FIX 2: loadUpcomingMatches function
window.loadUpcomingMatches = async function(key) {
  if(!key || !LEAGUES[key]) return;
  const league = LEAGUES[key];
  const el = document.getElementById('foot-result');
  if(!el) return;
  el.innerHTML = '<p style="color:var(--muted);font-size:13px">⏳ Chargement des matchs à venir...</p>';
  try {
    const r = await fetch('https://football-proxy.widehem-olivier.workers.dev/competitions/' + league.id + '/matches?status=SCHEDULED&limit=10');
    const d = await r.json();
    if(d.matches && d.matches.length) {
      let html = '<div style="display:grid;gap:8px">';
      d.matches.slice(0,10).forEach(f => {
        const date = new Date(f.utcDate).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'});
        const time = new Date(f.utcDate).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
        html += '<div style="background:var(--bg);border-radius:var(--radius);padding:12px 16px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px">'
          + '<div style="font-size:13px;font-weight:500;text-align:right">' + f.homeTeam.name + '</div>'
          + '<div style="text-align:center;min-width:110px"><div style="font-size:14px;font-weight:700;color:var(--accent)">' + time + '</div><div style="font-size:11px;color:var(--muted)">' + date + '</div></div>'
          + '<div style="font-size:13px;font-weight:500">' + f.awayTeam.name + '</div></div>';
      });
      html += '</div>';
      el.innerHTML = html;
    } else {
      el.innerHTML = '<p style="color:var(--muted);font-size:13px">Aucun match à venir trouvé.</p>';
    }
  } catch(e) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px">Données à venir non disponibles.</p>';
  }
};

// FIX 3: showHoro — meilleure variation quotidienne
(function(){
  const origShowHoro = window.showHoro;
  window.showHoro = function(name, btn) {
    document.querySelectorAll('.sign-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const sign = SIGNS.find(s => s.name === name);
    const texts = HOROSCOPES[name];
    if(!texts) return;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    const idx = seed % texts.length;
    const text = texts[idx];
    const stars = '⭐'.repeat(3 + Math.floor((today.getDate() % 3)));
    document.getElementById('horo-result').innerHTML = `
      <div class="horo-card">
        <h3>${sign.icon} ${sign.name}</h3>
        <div class="dates">${sign.dates}</div>
        <div class="stars">${stars}</div>
        <p>${text}</p>
        <div class="ad-slot" style="margin-top:1.5rem">[ Publicité AdSense ]</div>
      </div>`;
  };
})();

// FIX 4: Horoscope icon size (CSS patch)
(function(){
  const style = document.createElement('style');
  style.textContent = '.sign-btn .sign-icon { font-size: 30px !important; }';
  document.head.appendChild(style);
})();

// FIX 5: genPwd — guarantee at least 1 char per checked type
(function(){
  window.genPwd = function() {
    const mandatory = [];
    let chars = '';
    const U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const L = 'abcdefghijklmnopqrstuvwxyz';
    const N = '0123456789';
    const S = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if(document.getElementById('p-upper').checked) { chars += U; mandatory.push(U[Math.floor(Math.random()*U.length)]); }
    if(document.getElementById('p-lower').checked) { chars += L; mandatory.push(L[Math.floor(Math.random()*L.length)]); }
    if(document.getElementById('p-num').checked)   { chars += N; mandatory.push(N[Math.floor(Math.random()*N.length)]); }
    if(document.getElementById('p-sym').checked)   { chars += S; mandatory.push(S[Math.floor(Math.random()*S.length)]); }
    if(!chars) chars = L;
    const len = parseInt(document.getElementById('p-len').value) || 16;
    const pwd = [...mandatory];
    for(let i = pwd.length; i < len; i++) pwd.push(chars[Math.floor(Math.random()*chars.length)]);
    for(let i = pwd.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [pwd[i],pwd[j]]=[pwd[j],pwd[i]]; }
    document.getElementById('p-out').textContent = pwd.join('');
    let score = 0;
    if(len >= 12) score++;
    if(len >= 16) score++;
    if(document.getElementById('p-upper').checked) score++;
    if(document.getElementById('p-lower').checked) score++;
    if(document.getElementById('p-num').checked)   score++;
    if(document.getElementById('p-sym').checked)   score++;
    const labels = ['Très faible','Faible','Moyen','Bon','Fort','Très fort'];
    const colors = ['#EF5350','#FF7043','#FFD54F','#AED581','#66BB6A','#2A6B4F'];
    const idx = Math.min(score, 5);
    const lbl = document.getElementById('p-strength-label');
    const bar = document.getElementById('p-bar');
    if(lbl) lbl.textContent = 'Force : ' + labels[idx];
    if(bar) { bar.style.width = ((idx+1)/6*100)+'%'; bar.style.background = colors[idx]; }
  };
})();

// FIX 6: convSetFormat — support GIF & BMP
(function(){
  window.convSetFormat = function(fmt) {
    ['JPG','PNG','WebP','GIF','BMP'].forEach(f => {
      const btn = document.getElementById('conv-btn-'+f);
      if(btn) { btn.style.background = f===fmt?'var(--accent)':'var(--bg)'; btn.style.color = f===fmt?'#fff':'var(--text)'; }
    });
    if(fmt==='JPG')      window.convFormat = 'image/jpeg';
    else if(fmt==='PNG') window.convFormat = 'image/png';
    else if(fmt==='WebP')window.convFormat = 'image/webp';
    else if(fmt==='GIF') window.convFormat = 'image/gif';
    else if(fmt==='BMP') window.convFormat = 'image/bmp';
    else window.convFormat = 'image/jpeg';
    window.convExt = fmt.toLowerCase() === 'jpg' ? 'jpg' : fmt.toLowerCase();
    if(window.convFile) convConvert();
  };
  // Patch renderConvertImg to show more format buttons
  const origRender = window.renderConvertImg;
  window.renderConvertImg = function(el) {
    if(origRender) origRender(el);
    // Replace format buttons
    const wrap = el.querySelector('#conv-formats');
    if(wrap) {
      wrap.innerHTML = ['JPG','PNG','WebP','GIF','BMP'].map(f =>
        `<button onclick="convSetFormat('${f}')" id="conv-btn-${f}" style="padding:8px 18px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px;font-weight:600;cursor:pointer;background:var(--bg)">${f}</button>`
      ).join('');
      convSetFormat('JPG');
    }
  };
})();

// FIX 7: Sommeil — remove bold from time display
(function(){
  const origCalcSommeil = window.calcSommeil;
  window.calcSommeil = function(mode) {
    if(origCalcSommeil) origCalcSommeil(mode);
    // Remove bold from time spans after render
    setTimeout(() => {
      const containers = ['sl-coucher', 'sl-reveil'];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.querySelectorAll('span').forEach(s => {
          if(s.style.fontWeight === '700' || s.style.fontWeight === 'bold') {
            s.style.fontWeight = '400';
          }
        });
      });
    }, 50);
  };
})();

// FIX 8: calcDiff — fix LCS j++ bug
(function(){
  window.calcDiff = function() {
    ['words','lines','chars'].forEach(m => {
      const b = document.getElementById('diff-btn-'+m);
      if(b) { b.style.background = m===window.diffMode?'var(--accent)':'var(--bg)'; b.style.color = m===window.diffMode?'#fff':'var(--text)'; }
    });
    const a = document.getElementById('diff-a').value;
    const b = document.getElementById('diff-b').value;
    const el = document.getElementById('diff-result');
    const stats = document.getElementById('diff-stats');
    if(!a&&!b){if(el)el.innerHTML='';return;}
    let tokensA, tokensB, sep;
    if(window.diffMode==='lines'){tokensA=a.split('\n');tokensB=b.split('\n');sep='\n';}
    else if(window.diffMode==='chars'){tokensA=a.split('');tokensB=b.split('');sep='';}
    else{tokensA=a.split(/(\s+)/);tokensB=b.split(/(\s+)/);sep='';}
    const m=tokensA.length, n=tokensB.length;
    const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
      if(tokensA[i-1]===tokensB[j-1]) dp[i][j]=dp[i-1][j-1]+1;
      else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
    }
    let i=m,j=n,added=0,removed=0;
    const parts=[];
    while(i>0||j>0){
      if(i>0&&j>0&&tokensA[i-1]===tokensB[j-1]){parts.unshift({t:tokensA[i-1],s:'same'});i--;j--;}
      else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){parts.unshift({t:tokensB[j-1],s:'add'});j--;added++;}  // FIX: j-- not j++
      else{parts.unshift({t:tokensA[i-1],s:'del'});i--;removed++;}
    }
    if(el) el.innerHTML=parts.map(p=>{
      const esc=p.t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if(p.s==='add') return `<span style="background:#F0FFF4;color:#16A34A">${esc}</span>`;
      if(p.s==='del') return `<span style="background:#FFF0F0;color:#C4522A;text-decoration:line-through">${esc}</span>`;
      return esc;
    }).join(window.diffMode==='chars'?'':sep||' ');
    if(stats) stats.textContent=`+${added} ajout(s) · -${removed} suppression(s)`;
  };
})();

// FIX 9: awakeCristal — version statique (sans API)
(function(){
  const CRISTAL_PREDS = [
    "Les étoiles murmures que de nouveaux horizons s'ouvrent devant vous. Une opportunité inattendue se présente — saisissez-la avec confiance.",
    "Je perçois une énergie lumineuse autour de vous. Quelqu'un que vous avez perdu de vue cherche à vous retrouver.",
    "La brume se dissipe... je vois un changement positif dans votre vie professionnelle. Restez attentif aux signes.",
    "Les cristaux vibrent d'une énergie douce. L'amour est proche, plus proche que vous ne le pensez.",
    "Une période de transformation s'annonce. Ce qui vous semblait impossible devient soudain à portée de main.",
    "Je vois des liens forts qui se consolident. Les personnes proches de vous seront votre force dans les jours à venir.",
    "Les astres s'alignent en votre faveur. Une décision que vous hésitez à prendre mérite d'être prise.",
    "La boule révèle une période créative exceptionnelle. Exprimez vos idées sans retenue — elles valent de l'or.",
    "Une surprise agréable se prépare dans l'ombre. Faites confiance au temps qui passe.",
    "Je perçois de l'abondance autour de vous. Un projet que vous portez depuis longtemps commence enfin à prendre forme.",
    "Les vibrations sont puissantes ce soir. Une rencontre ou une conversation changera votre perspective.",
    "La boule voit un chemin se clarifier. La patience que vous avez eue sera récompensée au-delà de vos espérances.",
    "Une énergie de renouveau vous entoure. Laissez tomber ce qui pèse — la légèreté vous attend.",
    "Les mystères s'éclairent... votre intuition est votre meilleure alliée en ce moment. Écoutez-la.",
    "Je sens une créativité bouillonnante en vous. C'est le moment idéal pour concrétiser vos projets.",
    "La brume révèle un voyage, réel ou intérieur. De nouveaux horizons s'annoncent.",
    "Les forces de l'univers se concentrent sur vous. Une période de chance douce s'installe.",
    "Je vois des liens de confiance qui se renforcent. Votre entourage vous soutient plus que vous ne le réalisez.",
    "Une belle opportunité professionnelle pointe à l'horizon. Soyez prêt(e) à la saisir.",
    "La boule vibre d'une énergie apaisante. Une solution que vous cherchez arrivera naturellement.",
    "Les étoiles tracent un chemin de lumière. Ce que vous semez aujourd'hui fleurira demain.",
    "Je perçois un lien fort qui traverse le temps. Quelqu'un pense à vous en ce moment même.",
    "Les cristaux chantent une mélodie douce. La santé et la sérénité vous accompagnent.",
    "Une période de clarté mentale arrive. Les décisions difficiles deviendront plus simples.",
    "La boule révèle que votre courage sera votre plus grand atout dans les semaines qui viennent.",
    "Je vois une belle surprise liée à la famille ou aux amis. Les liens du cœur se renforcent.",
    "Les vibrations cosmiques annoncent un renouveau. Quelque chose de beau se prépare en silence.",
    "La boule perçoit votre force intérieure. Vous avez toutes les ressources pour surmonter ce qui vous préoccupe.",
    "Je vois de la lumière sur votre chemin. Une période de récolte après beaucoup d'efforts s'annonce.",
    "Les mystères de l'univers s'alignent en votre faveur. Faites confiance au processus.",
  ];

  window.awakeCristal = async function() {
    if(window.cristalPhase === 'awakening') return;
    window.cristalPhase = 'awakening';
    const btn = document.getElementById('cristal-btn');
    const invite = document.getElementById('cristal-invite');
    const pred = document.getElementById('cristal-prediction');
    const pulse = document.getElementById('cristal-pulse');
    if(btn) btn.disabled = true;
    if(invite) invite.textContent = "✨ La boule s'éveille... les vibrations se concentrent...";
    if(pred) pred.innerHTML = '';
    if(pulse) pulse.style.boxShadow = '0 0 30px 10px rgba(168,85,247,0.5)';
    await new Promise(r => setTimeout(r, 2500));
    if(invite) invite.textContent = '🔮 Les mystères se révèlent...';
    await new Promise(r => setTimeout(r, 1000));
    const text = CRISTAL_PREDS[Math.floor(Math.random() * CRISTAL_PREDS.length)];
    const today = new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
    const themes = ['amour et relations','travail et carrière','finances','santé et bien-être','projets personnels','rencontres et opportunités','famille','créativité'];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    window.cristalPhase = 'revealing';
    if(pred) pred.innerHTML = `
      <div style="background:linear-gradient(135deg,#1E0533,#3B0764);border-radius:var(--radius-lg);padding:1.5rem;border:1px solid #7C3AED;box-shadow:0 0 30px rgba(168,85,247,0.3)">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#A855F7;margin-bottom:12px">✨ Vision du ${today}</div>
        <p style="color:#F3E8FF;font-size:15px;line-height:1.8;font-style:italic;margin:0">${text}</p>
        <div style="margin-top:12px;font-size:11px;color:#7C3AED">🔮 ${theme.charAt(0).toUpperCase()+theme.slice(1)}</div>
      </div>`;
    if(invite) invite.textContent = 'La boule a parlé... consultez-la à nouveau demain';
    if(btn){ btn.disabled = false; btn.textContent = '🔮 Consulter à nouveau'; }
    if(pulse) pulse.style.boxShadow = '0 0 15px 5px rgba(168,85,247,0.2)';
  };
})();

console.log('✅ Toutes les corrections v2.1 ont été appliquées avec succès');
