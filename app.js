const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{notation:'compact',style:'currency',currency:'USD',maximumFractionDigits:1}).format(n);
const price=n=>Number(n).toLocaleString('en-US',{maximumSignificantDigits:7});
function draw(data){
  $('status').textContent='Actualizado automáticamente';
  $('snapshots').textContent=data.snapshot_count;
  $('updated').textContent=data.latest_time?new Date(data.latest_time).toLocaleString():'Sin datos';
  $('new-count').textContent=data.new_entries.length;
  $('ranking').innerHTML=data.ranking.map(r=>`<tr><td>${r.rank}</td><td class="symbol">${r.symbol.replace('USDT','')}</td><td class="gain">+${Number(r.price_change_pct).toFixed(2)}%</td><td>$${price(r.last_price)}</td><td>${money(r.quote_volume)}</td><td>${r.is_new_entry?'<span class="badge">NUEVO</span>':'—'}</td></tr>`).join('');
  $('entries').innerHTML=data.recent_entries.length?data.recent_entries.map(r=>`<div class="entry"><div><strong>${r.symbol.replace('USDT','')}</strong><small>${new Date(r.snapshot_time).toLocaleString()}</small></div><span class="positive">+${Number(r.price_change_pct).toFixed(2)}%</span></div>`).join(''):'<div class="empty">Todavía no hay cambios posteriores a la primera captura.</div>';
  $('research').innerHTML=data.research.map(r=>`<div class="result"><div><strong>${r.market} · ${r.strategy}</strong><small>${r.trades} operaciones · PF ${r.profit_factor}</small></div><strong class="${r.return_pct>=0?'positive':'negative'}">${r.return_pct>=0?'+':''}${r.return_pct.toFixed(2)}%</strong></div>`).join('');
  const p2=data.project02||{snapshot_count:0,latest_time:null,portfolios:[]};
  $('p2-snapshots').textContent=p2.snapshot_count;
  $('p2-updated').textContent=p2.latest_time?new Date(p2.latest_time).toLocaleString():'Sin datos';
  $('p2-themes').textContent=new Set(p2.portfolios.map(r=>r.theme)).size;
  const labels={complete:'Completa',filtered:'Filtrada',top10:'Top 10'};
  const pct=n=>n===null||n===undefined?'—':`${n>=0?'+':''}${Number(n).toFixed(2)}%`;
  $('p2-portfolios').innerHTML=p2.portfolios.length?p2.portfolios.map(r=>`<tr><td><strong>${r.theme_rank}. ${r.theme}</strong></td><td>${labels[r.strategy]||r.strategy}</td><td>${r.constituents}</td><td class="${r.return_24h>=0?'positive':'negative'}">${pct(r.return_24h)}</td><td>${pct(r.median_return_24h)}</td><td>${pct(r.return_without_max)}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">Esperando el primer snapshot verificado.</td></tr>';
}
async function refresh(){
  try{
    const isStatic=location.hostname.endsWith('github.io');
    let response=await fetch(isStatic?'./data.json':'/api/dashboard');
    if(!response.ok&&!isStatic) response=await fetch('./data.json');
    if(!response.ok) throw new Error('Datos no disponibles');
    draw(await response.json());
  }catch(e){$('status').textContent='Sin conexión'}
}
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('active',tab===button));
  document.querySelectorAll('.project').forEach(project=>project.classList.toggle('hidden',project.id!==button.dataset.tab));
}));
refresh();setInterval(refresh,30000);
