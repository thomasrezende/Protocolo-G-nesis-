import { useState, useCallback, useEffect } from "react";

// ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "op_agentes_v2";
const loadAgentes = () => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } };
const saveAgentes = (l) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); } catch {} };

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#0a0a0a", surface:"#111", surface2:"#161616", surface3:"#1c1c1c",
  border:"#222", border2:"#333",
  lime:"#c8f55a", limeD:"#a8d040", limeFade:"rgba(200,245,90,0.08)", limeFade2:"rgba(200,245,90,0.18)",
  white:"#f0f0f0", gray1:"#c0c0c0", gray2:"#888", gray3:"#555", gray4:"#333", gray5:"#222",
  red:"#e05050", blue:"#50c8e0", purple:"#9060d0", gold:"#d0a040", green:"#50c050", orange:"#e0803a",
};
const ELEMENTO_COR = {
  Morte:        { border:"#9090c0", bg:"rgba(26,26,46,0.5)",    text:"#9090c0" },
  Energia:      { border:"#00c8e0", bg:"rgba(0,200,224,0.08)",  text:"#00c8e0" },
  Medo:         { border:"#c8c8d0", bg:"rgba(200,200,208,0.06)",text:"#c8c8d0" },
  Conhecimento: { border:"#d0a040", bg:"rgba(208,160,64,0.08)", text:"#d0a040" },
  Sangue:       { border:"#e03030", bg:"rgba(224,48,48,0.1)",   text:"#e03030" },
};

// ─── DADOS ───────────────────────────────────────────────────────────────────
const ORIGENS = [
  { nome:"Acadêmico",              pericias:["Ciências","Investigação"],             habilidade:"Saber é Poder" },
  { nome:"Agente de Saúde",        pericias:["Intuição","Medicina"],                 habilidade:"Técnica Medicinal" },
  { nome:"Amigo dos Animais",      pericias:["Adestramento","Percepção"],            habilidade:"Companheiro Animal" },
  { nome:"Amnésico",               pericias:["Duas à escolha do mestre"],            habilidade:"Vislumbres do Passado" },
  { nome:"Artista",                pericias:["Artes","Enganação"],                   habilidade:"Magnum Opus" },
  { nome:"Astronauta",             pericias:["Ciências","Fortitude"],                habilidade:"Acostumado ao Extremo" },
  { nome:"Atleta",                 pericias:["Acrobacia","Atletismo"],               habilidade:"110%" },
  { nome:"Chef",                   pericias:["Fortitude","Profissão (cozinheiro)"],  habilidade:"Ingrediente Secreto" },
  { nome:"Chef do Outro Lado",     pericias:["Ocultismo","Profissão (cozinheiro)"],  habilidade:"Fome do Outro Lado" },
  { nome:"Colegial",               pericias:["Atualidades","Tecnologia"],            habilidade:"Poder da Amizade" },
  { nome:"Cosplayer",              pericias:["Artes","Vontade"],                     habilidade:"Não é fantasia, é cosplay!" },
  { nome:"Criminoso",              pericias:["Crime","Furtividade"],                 habilidade:"O Crime Compensa" },
  { nome:"Cultista Arrependido",   pericias:["Ocultismo","Religião"],                habilidade:"Traços do Outro Lado" },
  { nome:"Desgarrado",             pericias:["Fortitude","Sobrevivência"],           habilidade:"Calejado" },
  { nome:"Diplomata",              pericias:["Atualidades","Diplomacia"],            habilidade:"Conexões" },
  { nome:"Engenheiro",             pericias:["Profissão","Tecnologia"],              habilidade:"Ferramenta Favorita" },
  { nome:"Executivo",              pericias:["Diplomacia","Profissão"],              habilidade:"Processo Otimizado" },
  { nome:"Experimento",            pericias:["Atletismo","Fortitude"],               habilidade:"Mutação" },
  { nome:"Explorador",             pericias:["Fortitude","Sobrevivência"],           habilidade:"Manual do Sobrevivente" },
  { nome:"Fanático por Criaturas", pericias:["Investigação","Ocultismo"],            habilidade:"Conhecimento Oculto" },
  { nome:"Fotógrafo",              pericias:["Artes","Percepção"],                   habilidade:"Através da Lente" },
  { nome:"Inventor Paranormal",    pericias:["Profissão (engenheiro)","Vontade"],    habilidade:"Invenção Paranormal" },
  { nome:"Investigador",           pericias:["Investigação","Percepção"],            habilidade:"Faro para Pistas" },
  { nome:"Jovem Místico",          pericias:["Ocultismo","Religião"],                habilidade:"A Culpa é das Estrelas" },
  { nome:"Legista do Turno da Noite", pericias:["Ciências","Medicina"],             habilidade:"Luto Habitual" },
  { nome:"Lutador",                pericias:["Luta","Reflexos"],                     habilidade:"Mão Pesada" },
  { nome:"Magnata",                pericias:["Diplomacia","Pilotagem"],              habilidade:"Patrocinador da Ordem" },
  { nome:"Mateiro",                pericias:["Percepção","Sobrevivência"],           habilidade:"Mapa Celeste" },
  { nome:"Mercenário",             pericias:["Iniciativa","Intimidação"],            habilidade:"Posição de Combate" },
  { nome:"Mergulhador",            pericias:["Atletismo","Fortitude"],               habilidade:"Fôlego de Nadador" },
  { nome:"Militar",                pericias:["Pontaria","Tática"],                   habilidade:"Para Bellum" },
  { nome:"Motorista",              pericias:["Pilotagem","Reflexos"],                habilidade:"Mãos no Volante" },
  { nome:"Nerd Entusiasta",        pericias:["Ciências","Tecnologia"],               habilidade:"O Inteligentão" },
  { nome:"Operário",               pericias:["Fortitude","Profissão"],               habilidade:"Ferramenta de Trabalho" },
  { nome:"Policial",               pericias:["Percepção","Pontaria"],                habilidade:"Patrulha" },
  { nome:"Profetizado",            pericias:["Vontade","+1 à escolha"],              habilidade:"Luta ou Fuga" },
  { nome:"Psicólogo",              pericias:["Intuição","Profissão (psicólogo)"],    habilidade:"Terapia" },
  { nome:"Religioso",              pericias:["Religião","Vontade"],                  habilidade:"Acalentar" },
  { nome:"Repórter Investigativo", pericias:["Atualidades","Investigação"],          habilidade:"Encontrar a Verdade" },
  { nome:"Servidor Público",       pericias:["Intuição","Vontade"],                  habilidade:"Espírito Cívico" },
  { nome:"T.I.",                   pericias:["Investigação","Tecnologia"],           habilidade:"Motor de Busca" },
  { nome:"Teórico da Conspiração", pericias:["Investigação","Ocultismo"],            habilidade:"Eu Já Sabia" },
  { nome:"Trabalhador Rural",      pericias:["Adestramento","Sobrevivência"],        habilidade:"Desbravador" },
  { nome:"Trambiqueiro",           pericias:["Crime","Enganação"],                   habilidade:"Impostor" },
  { nome:"Universitário",          pericias:["Atualidades","Investigação"],          habilidade:"Dedicação" },
  { nome:"Vítima",                 pericias:["Reflexos","Vontade"],                  habilidade:"Cicatrizes Psicológicas" },
];

const CLASSES = {
  Combatente: {
    desc:"Treinado para lutar com todo tipo de armas e com coragem para encarar os perigos de frente. Prefere abordagens diretas.",
    pv_base:20, pv_nex:4, pe_base:2, pe_nex:2, san_base:12, san_nex:3,
    pericias_fixas:["Luta ou Pontaria","Fortitude ou Reflexos"],
    pericias_livre_formula:"1 + Intelecto", pericias_livre:(INT)=>1+INT,
    pericias_classe:["Atletismo","Fortitude","Intimidação","Luta","Pontaria","Reflexos","Tática"],
  },
  Especialista: {
    desc:"Confia em esperteza, conhecimento técnico ou lábia para resolver mistérios e enfrentar o paranormal.",
    pv_base:16, pv_nex:3, pe_base:3, pe_nex:3, san_base:16, san_nex:4,
    pericias_fixas:[],
    pericias_livre_formula:"7 + Intelecto", pericias_livre:(INT)=>7+INT,
    pericias_classe:["Acrobacia","Crime","Diplomacia","Enganação","Furtividade","Pilotagem","Tecnologia"],
  },
  Ocultista: {
    desc:"Possui talento para se conectar com o paranormal. Domina os mistérios do Outro Lado para combatê-los.",
    pv_base:12, pv_nex:2, pe_base:4, pe_nex:4, san_base:20, san_nex:5,
    pericias_fixas:["Ocultismo","Vontade"],
    pericias_livre_formula:"3 + Intelecto", pericias_livre:(INT)=>3+INT,
    pericias_classe:["Ciências","Investigação","Medicina","Ocultismo","Religião","Vontade"],
  },
};

const PATENTES = ["Recruta","Operador","Agente Especial","Oficial de Operações","Agente de Elite"];

const PERICIAS = [
  {nome:"Acrobacia",at:"AGI"},{nome:"Adestramento",at:"PRE"},{nome:"Artes",at:"PRE"},
  {nome:"Atletismo",at:"FOR"},{nome:"Atualidades",at:"INT"},{nome:"Ciências",at:"INT"},
  {nome:"Crime",at:"AGI"},{nome:"Diplomacia",at:"PRE"},{nome:"Enganação",at:"PRE"},
  {nome:"Fortitude",at:"VIG"},{nome:"Furtividade",at:"AGI"},{nome:"Iniciativa",at:"AGI"},
  {nome:"Intimidação",at:"PRE"},{nome:"Intuição",at:"PRE"},{nome:"Investigação",at:"INT"},
  {nome:"Luta",at:"FOR"},{nome:"Medicina",at:"INT"},{nome:"Ocultismo",at:"INT"},
  {nome:"Percepção",at:"PRE"},{nome:"Pilotagem",at:"AGI"},{nome:"Pontaria",at:"AGI"},
  {nome:"Profissão",at:"INT"},{nome:"Reflexos",at:"AGI"},{nome:"Religião",at:"PRE"},
  {nome:"Sobrevivência",at:"INT"},{nome:"Tática",at:"INT"},{nome:"Tecnologia",at:"INT"},
  {nome:"Vontade",at:"PRE"},
];

const GRAUS = ["Destreinado","Treinado","Veterano","Expert"];
const GRAU_BONUS = {Destreinado:0,Treinado:5,Veterano:10,Expert:15};
const GRAU_SH    = {Destreinado:"—",Treinado:"T",Veterano:"V",Expert:"E"};
const GRAU_COR   = {Destreinado:C.gray4,Treinado:C.blue,Veterano:C.gold,Expert:C.lime};
const attrNames  = {FOR:"Força",AGI:"Agilidade",VIG:"Vigor",PRE:"Presença",INT:"Intelecto"};
const attrCors   = {FOR:C.red,AGI:C.blue,VIG:C.green,PRE:C.gold,INT:C.purple};

// ─── CÁLCULOS ────────────────────────────────────────────────────────────────
const calcPV  = (cls,attrs,nex) => { const c=CLASSES[cls]; if(!c)return 0; return c.pv_base+(attrs.VIG||0)+c.pv_nex*Math.floor(nex/5); };
const calcPE  = (cls,attrs,nex) => { const c=CLASSES[cls]; if(!c)return 0; return c.pe_base+(attrs.PRE||0)+c.pe_nex*Math.floor(nex/5); };
const calcSAN = (cls,nex)       => { const c=CLASSES[cls]; if(!c)return 0; return c.san_base+c.san_nex*Math.floor(nex/5); };
const calcDEF = (attrs,f)       => {
  const base = 10+(attrs.AGI||0);
  const manualBonus = (f.bonus_defesa||[]).filter(b=>b.ativo).reduce((a,b)=>a+(Number(b.valor)||0),0);
  const transBonus  = (f.transformacao?.ativa && f.transformacao?.bonus_defesa) ? Number(f.transformacao.bonus_defesa)||0 : 0;
  return base + manualBonus + transBonus;
};
const calcBonusP = (f,nome) => {
  const grauB  = GRAU_BONUS[f.pericias[nome]||"Destreinado"];
  const manualB= f.bonus_pericia?.[nome]||0;
  const extraB = (f.bonus_extras||[]).filter(b=>b.ativo&&(b.alvo==="Todas"||b.alvo===nome)).reduce((a,b)=>a+(Number(b.valor)||0),0);
  const transB = (f.transformacao?.ativa && f.transformacao?.bonus_pericias?.[nome]) ? Number(f.transformacao.bonus_pericias[nome])||0 : 0;
  return grauB+manualB+extraB+transB;
};

const rolarDado = l=>Math.floor(Math.random()*l)+1;
const parseDice = formula => {
  const rx=/(\d*)d(\d+)([+-]\d+)?/gi; let total=0,rolls=[],m;
  while((m=rx.exec(formula))!==null){
    const q=parseInt(m[1]||"1"),l=parseInt(m[2]),mod=parseInt(m[3]||"0");
    for(let i=0;i<q;i++){const r=rolarDado(l);rolls.push(`d${l}:${r}`);total+=r;}total+=mod;
  }
  if(!rolls.length)return{total:0,rolls:["inválido"]};
  return{total,rolls};
};

// ─── FICHA BLANK ─────────────────────────────────────────────────────────────
const fichaBlank = () => ({
  id:Date.now(),
  criacao_step:1,
  nome:"",jogador:"",patente:"Recruta",nivel:1,nex:0,xp:0,idade:"",genero:"",
  aparencia:"",historia:"",motivacao:"",
  atributos:{FOR:1,AGI:1,VIG:1,PRE:1,INT:1},
  origem:"",classe:"",
  pericias:Object.fromEntries(PERICIAS.map(p=>[p.nome,"Destreinado"])),
  bonus_pericia:Object.fromEntries(PERICIAS.map(p=>[p.nome,0])),
  bonus_extras:[],
  pv_atual:0,pe_atual:0,san_atual:0,
  habilidades:[],rituais:[],inventario:[],notas:"",dinheiro:500,
  status:{Sangrando:false,Abalado:false,Vulnerável:false,Enfraquecido:false,"Em Surto":false,Catatônico:false},
  condicoes:"",
  // transformação
  transformacao: null,
  // bônus de defesa manuais
  bonus_defesa: [],
});

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tela, setTela]         = useState("biblioteca");
  const [agentes, setAgentes]   = useState(()=>loadAgentes());
  const [fichaAtiva, setFichaAtiva] = useState(null);
  // modal de deleção
  const [deletandoId, setDeletandoId]     = useState(null);
  const [confirmaTexto, setConfirmaTexto] = useState("");

  useEffect(()=>{ saveAgentes(agentes); },[agentes]);

  const novoAgente = () => { const f=fichaBlank(); setFichaAtiva(f); setTela("ficha"); };

  const abrirAgente = (id) => {
    const f = agentes.find(a=>a.id===id);
    if(f){ setFichaAtiva({...f}); setTela("ficha"); }
  };

  const salvarAgente = (ficha) => {
    setAgentes(prev=>{
      const idx=prev.findIndex(a=>a.id===ficha.id);
      return idx>=0 ? prev.map((a,i)=>i===idx?ficha:a) : [...prev,ficha];
    });
    setFichaAtiva(null); setTela("biblioteca");
  };

  const iniciarDeletar = (id) => { setDeletandoId(id); setConfirmaTexto(""); };
  const cancelarDeletar = () => { setDeletandoId(null); setConfirmaTexto(""); };
  const confirmarDeletar = () => {
    if(confirmaTexto.trim().toUpperCase()==="REMOVER"){
      setAgentes(prev=>prev.filter(a=>a.id!==deletandoId));
      cancelarDeletar();
    }
  };

  if(tela==="ficha"&&fichaAtiva)
    return <FichaView ficha={fichaAtiva} onSave={salvarAgente} onBack={()=>setTela("biblioteca")} />;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.gray1,fontFamily:"'Courier New',monospace",fontSize:13}}>
      {/* MODAL DELETAR */}
      {deletandoId && (
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.red}`,borderRadius:4,padding:28,width:360,maxWidth:"90vw"}}>
            <div style={{fontSize:10,letterSpacing:3,color:C.red,marginBottom:12}}>⚠ OPERAÇÃO IRREVERSÍVEL</div>
            <div style={{fontSize:13,color:C.white,marginBottom:6}}>
              <strong style={{color:C.red}}>{agentes.find(a=>a.id===deletandoId)?.nome||"Agente"}</strong> será removido permanentemente da biblioteca.
            </div>
            <div style={{fontSize:11,color:C.gray3,marginBottom:16,lineHeight:1.7}}>
              Para confirmar essa operação, digite <strong style={{color:C.white,letterSpacing:2}}>REMOVER</strong> no campo abaixo:
            </div>
            <input
              autoFocus
              value={confirmaTexto}
              onChange={e=>setConfirmaTexto(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")confirmarDeletar();if(e.key==="Escape")cancelarDeletar();}}
              placeholder="Digite REMOVER"
              style={{width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${confirmaTexto.toUpperCase()==="REMOVER"?C.red:C.border2}`,color:C.white,borderRadius:2,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",letterSpacing:2,marginBottom:14}}
            />
            <div style={{display:"flex",gap:10}}>
              <button onClick={cancelarDeletar} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit",letterSpacing:1}}>CANCELAR</button>
              <button
                disabled={confirmaTexto.trim().toUpperCase()!=="REMOVER"}
                onClick={confirmarDeletar}
                style={{flex:1,padding:"8px 0",background:confirmaTexto.trim().toUpperCase()==="REMOVER"?"rgba(224,80,80,0.15)":"transparent",border:`1px solid ${confirmaTexto.trim().toUpperCase()==="REMOVER"?C.red:C.gray4}`,color:confirmaTexto.trim().toUpperCase()==="REMOVER"?C.red:C.gray4,cursor:confirmaTexto.trim().toUpperCase()==="REMOVER"?"pointer":"not-allowed",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                CONFIRMAR REMOÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,letterSpacing:5,color:C.lime}}>⬡ ORDEM PARANORMAL</div>
          <div style={{fontSize:9,color:C.gray3,letterSpacing:4,marginTop:2}}>BIBLIOTECA DE AGENTES</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:9,color:C.gray4,letterSpacing:1}}>{agentes.length} AGENTE{agentes.length!==1?"S":""} SALVOS</div>
          <button onClick={novoAgente} style={btnLime}>+ NOVO AGENTE</button>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 20px"}}>
        {agentes.length===0 && (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:40,marginBottom:16,opacity:0.15}}>◈</div>
            <div style={{fontSize:13,color:C.gray3,letterSpacing:2,marginBottom:8}}>NENHUM AGENTE REGISTRADO</div>
            <div style={{fontSize:11,color:C.gray4,marginBottom:24}}>Crie seu primeiro agente para começar.</div>
            <button onClick={novoAgente} style={btnLime}>+ CRIAR PRIMEIRO AGENTE</button>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))",gap:12}}>
          {agentes.map(a=>{
            const pvMax=calcPV(a.classe,a.atributos,a.nex);
            const pct=pvMax>0?Math.min(100,(a.pv_atual/pvMax)*100):0;
            const transAtiva = a.transformacao?.ativa;
            return (
              <div key={a.id} style={{background:transAtiva?"rgba(200,245,90,0.04)":C.surface2,border:`1px solid ${transAtiva?C.lime:C.border}`,borderLeft:`3px solid ${transAtiva?C.lime:C.lime}`,borderRadius:3,padding:16,cursor:"pointer",transition:"all 0.15s"}}
                onClick={()=>abrirAgente(a.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.nome||"Sem nome"}</div>
                      {transAtiva && <span style={{fontSize:8,color:C.lime,border:`1px solid ${C.lime}`,padding:"1px 5px",borderRadius:2,letterSpacing:1,flexShrink:0}}>TRANSF.</span>}
                    </div>
                    <div style={{fontSize:9,color:C.lime,letterSpacing:2,marginTop:2}}>{a.classe||"—"} · {a.patente} · NEX {a.nex}% · Nv.{a.nivel}</div>
                    {a.origem&&<div style={{fontSize:9,color:C.gray3,marginTop:2}}>{a.origem}</div>}
                  </div>
                  <button onClick={e=>{e.stopPropagation();iniciarDeletar(a.id);}}
                    style={{padding:"3px 8px",background:"transparent",border:`1px solid rgba(224,80,80,0.3)`,color:C.red,cursor:"pointer",borderRadius:2,fontSize:10,marginLeft:8,flexShrink:0}}>✕</button>
                </div>
                {a.classe&&(
                  <div style={{marginTop:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.gray3,marginBottom:3}}>
                      <span>PV {a.pv_atual}/{pvMax}{transAtiva&&a.transformacao.pv_temp>0?` (+${a.transformacao.pv_temp})`:""}</span>
                      <span>SAN {a.san_atual}/{calcSAN(a.classe,a.nex)}</span>
                    </div>
                    <div style={{height:2,background:C.border,borderRadius:1,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:C.red,transition:"width 0.3s"}} />
                    </div>
                  </div>
                )}
                {a.criacao_step<4&&<div style={{marginTop:8,fontSize:9,color:C.gold,letterSpacing:1}}>⚠ CRIAÇÃO INCOMPLETA — Passo {a.criacao_step}/3</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── FICHA VIEW ───────────────────────────────────────────────────────────────
function FichaView({ficha:fichaInit,onSave,onBack}) {
  const [ficha,setFicha]   = useState(fichaInit);
  const [aba,setAba]       = useState(fichaInit.criacao_step<4?"criar":"identidade");
  const [log,setLog]       = useState([]);
  const [diceFormula,setDiceFormula] = useState("");
  const [showRoller,setShowRoller]   = useState(false);

  // modais
  const [showTransformModal, setShowTransformModal] = useState(false); // "add" | "remove" | false
  const [transForm, setTransForm] = useState({nome:"",pv_temp:0,pe_temp:0,bonus_defesa:0,bonus_pericias:{}});
  const [penForm,   setPenForm]   = useState({pv_pen:0,pe_pen:0,san_pen:0});

  // forms
  const [novoItem,setNovoItem]         = useState({nome:"",tipo:"Arma",qtd:1,peso:"1",desc:""});
  const [novoRitual,setNovoRitual]     = useState({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});
  const [novoBonus,setNovoBonus]       = useState({nome:"",alvo:"Todas",valor:0,ativo:true,desc:""});
  const [novaHab,setNovaHab]           = useState({nome:"",desc:""});
  const [novoBonusDef,setNovoBonusDef] = useState({nome:"",valor:0,ativo:true});

  const upd = (k,v) => setFicha(f=>({...f,[k]:v}));

  // ── CRIAÇÃO ──
  const PONTOS_TOTAL=4;
  const pontosGastos = Object.values(ficha.atributos).reduce((a,v)=>a+(v-1),0);
  const pontosRestantes = PONTOS_TOTAL-pontosGastos;

  const setAttrCriacao=(attr,val)=>{
    if(val>3||val<0)return;
    const novos={...ficha.atributos,[attr]:val};
    const gasto=Object.values(novos).reduce((a,v)=>a+(v-1),0);
    if(gasto>PONTOS_TOTAL)return;
    setFicha(f=>({...f,atributos:novos}));
  };

  const confirmarOrigem=(nome)=>{
    const o=ORIGENS.find(o=>o.nome===nome); if(!o)return;
    const np={...ficha.pericias};
    o.pericias.forEach(pn=>{if(PERICIAS.find(p=>p.nome===pn)&&np[pn]==="Destreinado")np[pn]="Treinado";});
    setFicha(f=>({...f,origem:nome,pericias:np,criacao_step:3}));
  };

  const confirmarClasse=(nome)=>{
    const pvMax=calcPV(nome,ficha.atributos,0);
    const peMax=calcPE(nome,ficha.atributos,0);
    const sanMax=calcSAN(nome,0);
    setFicha(f=>({...f,classe:nome,criacao_step:4,pv_atual:pvMax,pe_atual:peMax,san_atual:sanMax}));
    setAba("identidade");
  };

  // ── RECURSOS ──
  const pvMax  = calcPV(ficha.classe,ficha.atributos,ficha.nex);
  const peMax  = calcPE(ficha.classe,ficha.atributos,ficha.nex);
  const sanMax = calcSAN(ficha.classe,ficha.nex);
  const defesa = calcDEF(ficha.atributos,ficha);

  // PV e PE com temporários
  const pvTemp = ficha.transformacao?.ativa ? Number(ficha.transformacao.pv_temp)||0 : 0;
  const peTemp = ficha.transformacao?.ativa ? Number(ficha.transformacao.pe_temp)||0 : 0;
  const pvTotal  = pvMax  + pvTemp;
  const peTotal  = peMax  + peTemp;

  // ── TRANSFORMAÇÃO ──
  const ativarTransformacao = () => {
    setFicha(f=>({...f,transformacao:{...transForm,ativa:true}}));
    setShowTransformModal(false);
    setTransForm({nome:"",pv_temp:0,pe_temp:0,bonus_defesa:0,bonus_pericias:{}});
  };
  const removerTransformacao = () => {
    const penPV  = Number(penForm.pv_pen)||0;
    const penPE  = Number(penForm.pe_pen)||0;
    const penSAN = Number(penForm.san_pen)||0;
    setFicha(f=>({
      ...f,
      transformacao: null,
      pv_atual:  Math.max(0,f.pv_atual  - penPV),
      pe_atual:  Math.max(0,f.pe_atual  - penPE),
      san_atual: Math.max(0,f.san_atual - penSAN),
    }));
    setShowTransformModal(false);
    setPenForm({pv_pen:0,pe_pen:0,san_pen:0});
  };

  // ── ROLAR ──
  const rolar = useCallback((formula,rotulo)=>{
    const {total,rolls}=parseDice(formula||"1d20");
    setLog(l=>[{rotulo:rotulo||formula||"1d20",total,rolls,ts:new Date().toLocaleTimeString()},...l].slice(0,60));
    setShowRoller(true);
  },[]);

  // ── CRUD ──
  const addItem  = ()=>{if(!novoItem.nome.trim())return;setFicha(f=>({...f,inventario:[...f.inventario,{...novoItem,id:Date.now()}]}));setNovoItem({nome:"",tipo:"Arma",qtd:1,peso:"1",desc:""});};
  const rmItem   = id=>setFicha(f=>({...f,inventario:f.inventario.filter(i=>i.id!==id)}));
  const addRitual= ()=>{if(!novoRitual.nome.trim())return;setFicha(f=>({...f,rituais:[...f.rituais,{...novoRitual,id:Date.now()}]}));setNovoRitual({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});};
  const rmRitual = id=>setFicha(f=>({...f,rituais:f.rituais.filter(r=>r.id!==id)}));
  const addBonus = ()=>{if(!novoBonus.nome.trim())return;setFicha(f=>({...f,bonus_extras:[...(f.bonus_extras||[]),{...novoBonus,id:Date.now()}]}));setNovoBonus({nome:"",alvo:"Todas",valor:0,ativo:true,desc:""});};
  const rmBonus  = id=>setFicha(f=>({...f,bonus_extras:f.bonus_extras.filter(b=>b.id!==id)}));
  const togBonus = id=>setFicha(f=>({...f,bonus_extras:f.bonus_extras.map(b=>b.id===id?{...b,ativo:!b.ativo}:b)}));
  const addHab   = ()=>{if(!novaHab.nome.trim())return;setFicha(f=>({...f,habilidades:[...(f.habilidades||[]),{...novaHab,id:Date.now()}]}));setNovaHab({nome:"",desc:""});};
  const rmHab    = id=>setFicha(f=>({...f,habilidades:f.habilidades.filter(h=>h.id!==id)}));
  // bônus de defesa manuais
  const addBonusDef = ()=>{ if(!novoBonusDef.nome.trim())return; setFicha(f=>({...f,bonus_defesa:[...(f.bonus_defesa||[]),{...novoBonusDef,id:Date.now()}]}));setNovoBonusDef({nome:"",valor:0,ativo:true});};
  const rmBonusDef  = id=>setFicha(f=>({...f,bonus_defesa:f.bonus_defesa.filter(b=>b.id!==id)}));
  const togBonusDef = id=>setFicha(f=>({...f,bonus_defesa:f.bonus_defesa.map(b=>b.id===id?{...b,ativo:!b.ativo}:b)}));

  const totalPeso = ficha.inventario.reduce((a,i)=>a+(parseFloat(i.peso)*i.qtd),0);

  const abas = ficha.criacao_step<4
    ? [{id:"criar",label:"Criação",icon:"◈"}]
    : [
        {id:"identidade",label:"Identidade",icon:"◈"},
        {id:"atributos",label:"Atributos",icon:"◆"},
        {id:"pericias",label:"Perícias",icon:"▣"},
        {id:"bonus",label:"Bônus",icon:"⊕"},
        {id:"habilidades",label:"Habilidades",icon:"◉"},
        {id:"recursos",label:"Recursos",icon:"◍"},
        {id:"inventario",label:"Inventário",icon:"◫"},
        {id:"rituais",label:"Rituais",icon:"◌"},
        {id:"notas",label:"Notas",icon:"▤"},
      ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.gray1,fontFamily:"'Courier New',monospace",fontSize:13,paddingBottom:64}}>

      {/* MODAL TRANSFORMAÇÃO — ADICIONAR */}
      {showTransformModal==="add" && (
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.surface,border:`1px solid ${C.lime}`,borderRadius:4,padding:24,width:480,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:10,letterSpacing:3,color:C.lime,marginBottom:14}}>◬ ADICIONAR TRANSFORMAÇÃO</div>
            <Inp label="Nome da Transformação" v={transForm.nome} s={v=>setTransForm(t=>({...t,nome:v}))} ph="Ex: Forma Bestial, Transe Paranormal..." />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
              <Inp label="PV Temporários" v={transForm.pv_temp} s={v=>setTransForm(t=>({...t,pv_temp:v}))} type="number" ph="+20..." />
              <Inp label="PE Temporários" v={transForm.pe_temp} s={v=>setTransForm(t=>({...t,pe_temp:v}))} type="number" ph="+10..." />
              <Inp label="Bônus de Defesa" v={transForm.bonus_defesa} s={v=>setTransForm(t=>({...t,bonus_defesa:v}))} type="number" ph="+5..." />
            </div>
            <div style={{marginTop:14}}>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>BÔNUS EM PERÍCIAS ESPECÍFICAS (opcional)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))",gap:6,maxHeight:180,overflowY:"auto",padding:4,background:C.surface2,borderRadius:2,border:`1px solid ${C.border}`}}>
                {PERICIAS.map(p=>(
                  <div key={p.nome} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:9,color:C.gray3,flex:1}}>{p.nome}</span>
                    <input type="number" defaultValue={0}
                      onChange={e=>setTransForm(t=>({...t,bonus_pericias:{...t.bonus_pericias,[p.nome]:Number(e.target.value)}}))}
                      style={{width:44,padding:"3px 5px",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none",textAlign:"center"}} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>setShowTransformModal(false)} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>CANCELAR</button>
              <button onClick={ativarTransformacao} disabled={!transForm.nome.trim()}
                style={{flex:2,padding:"8px 0",background:transForm.nome.trim()?C.limeFade2:"transparent",border:`1px solid ${transForm.nome.trim()?C.lime:C.gray4}`,color:transForm.nome.trim()?C.lime:C.gray4,cursor:transForm.nome.trim()?"pointer":"not-allowed",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                ◬ ATIVAR TRANSFORMAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSFORMAÇÃO — REMOVER */}
      {showTransformModal==="remove" && (
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.surface,border:`1px solid ${C.orange}`,borderRadius:4,padding:24,width:400,maxWidth:"96vw"}}>
            <div style={{fontSize:10,letterSpacing:3,color:C.orange,marginBottom:14}}>◬ REMOVER TRANSFORMAÇÃO</div>
            <div style={{fontSize:12,color:C.white,marginBottom:4}}>
              Encerrando: <strong style={{color:C.lime}}>{ficha.transformacao?.nome}</strong>
            </div>
            <div style={{fontSize:11,color:C.gray3,marginBottom:14,lineHeight:1.7}}>
              Os bônus de PV, PE e Defesa serão removidos. Determine as penalidades sofridas ao retornar (deixe 0 se nenhuma):
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <Inp label="Penalidade PV" v={penForm.pv_pen} s={v=>setPenForm(p=>({...p,pv_pen:v}))} type="number" ph="0" />
              <Inp label="Penalidade PE" v={penForm.pe_pen} s={v=>setPenForm(p=>({...p,pe_pen:v}))} type="number" ph="0" />
              <Inp label="Penalidade SAN" v={penForm.san_pen} s={v=>setPenForm(p=>({...p,san_pen:v}))} type="number" ph="0" />
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>setShowTransformModal(false)} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>CANCELAR</button>
              <button onClick={removerTransformacao}
                style={{flex:2,padding:"8px 0",background:"rgba(224,128,58,0.15)",border:`1px solid ${C.orange}`,color:C.orange,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                ENCERRAR TRANSFORMAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={onBack} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← BIBLIOTECA</button>
            <div>
              <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:C.lime}}>⬡ ORDEM PARANORMAL</div>
              {ficha.nome&&<div style={{fontSize:9,color:C.gray3,letterSpacing:2}}>AGT. {ficha.nome.toUpperCase()} · {ficha.patente} · NEX {ficha.nex}% · Nv.{ficha.nivel}</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {ficha.criacao_step>=4 && (
              ficha.transformacao?.ativa
                ? <button onClick={()=>setShowTransformModal("remove")}
                    style={{padding:"6px 12px",background:"rgba(224,128,58,0.15)",border:`1px solid ${C.orange}`,color:C.orange,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                    ◬ {ficha.transformacao.nome} — ENCERRAR
                  </button>
                : <button onClick={()=>setShowTransformModal("add")}
                    style={{padding:"6px 12px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>
                    ◬ TRANSFORMAÇÃO
                  </button>
            )}
            <button onClick={()=>setShowRoller(s=>!s)} style={{padding:"6px 12px",background:showRoller?C.limeFade2:C.surface2,border:`1px solid ${showRoller?C.lime:C.border}`,color:showRoller?C.lime:C.gray2,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit",letterSpacing:1}}>⬡ DADOS</button>
            <button onClick={()=>onSave(ficha)} style={btnLime}>SALVAR</button>
          </div>
        </div>
      </div>

      {/* ROLADOR */}
      {showRoller && (
        <div style={{position:"fixed",top:64,right:12,width:300,zIndex:200,background:C.surface,border:`1px solid ${C.lime}`,borderRadius:3,padding:12,boxShadow:`0 0 40px rgba(200,245,90,0.12)`}}>
          <div style={{fontSize:8,letterSpacing:4,color:C.lime,marginBottom:8}}>◈ ROLADOR</div>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <input value={diceFormula} onChange={e=>setDiceFormula(e.target.value)} onKeyDown={e=>e.key==="Enter"&&rolar(diceFormula)} placeholder="1d20 · 2d6+3"
              style={{flex:1,padding:"6px 9px",background:C.bg,border:`1px solid ${C.border2}`,color:C.white,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}} />
            <button onClick={()=>rolar(diceFormula)} style={{padding:"6px 10px",background:C.lime,color:C.bg,border:"none",borderRadius:2,cursor:"pointer",fontWeight:700,fontSize:11}}>▶</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {["d4","d6","d8","d10","d12","d20","d100"].map(d=>(
              <button key={d} onClick={()=>rolar(`1${d}`,d)} style={{padding:"2px 7px",background:C.surface2,border:`1px solid ${C.border}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>{d}</button>
            ))}
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {log.length===0&&<div style={{color:C.gray4,fontSize:10,textAlign:"center",padding:10}}>Nenhuma rolagem.</div>}
            {log.map((l,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:5,alignItems:"center",padding:"3px 7px",background:C.surface2,borderRadius:2}}>
                <div>
                  <div style={{fontSize:8,color:C.lime,letterSpacing:1}}>{l.rotulo}</div>
                  <div style={{fontSize:7,color:C.gray4}}>{l.rolls.join(", ")}</div>
                </div>
                <div style={{fontSize:18,fontWeight:900,color:C.white}}>{l.total}</div>
                <div style={{fontSize:7,color:C.gray5}}>{l.ts}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        <div style={{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 8px"}}>
          {abas.map(a=>(
            <button key={a.id} onClick={()=>setAba(a.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 13px",background:"transparent",border:"none",borderBottom:`2px solid ${aba===a.id?C.lime:"transparent"}`,color:aba===a.id?C.lime:C.gray4,cursor:"pointer",fontSize:12,whiteSpace:"nowrap",fontFamily:"inherit",transition:"all 0.15s"}}>
              <span>{a.icon}</span>
              <span style={{fontSize:7,letterSpacing:1}}>{a.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TRANSFORMAÇÃO BANNER */}
      {ficha.transformacao?.ativa && (
        <div style={{background:"rgba(200,245,90,0.06)",borderBottom:`1px solid ${C.lime}`,padding:"6px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:C.lime,letterSpacing:2,fontWeight:700}}>◬ TRANSFORMAÇÃO ATIVA:</span>
          <span style={{fontSize:11,color:C.white,fontWeight:700}}>{ficha.transformacao.nome}</span>
          {pvTemp>0&&<span style={{fontSize:9,color:C.red,border:`1px solid rgba(224,80,80,0.3)`,padding:"1px 6px",borderRadius:2}}>+{pvTemp} PV TEMP</span>}
          {peTemp>0&&<span style={{fontSize:9,color:C.blue,border:`1px solid rgba(80,200,224,0.3)`,padding:"1px 6px",borderRadius:2}}>+{peTemp} PE TEMP</span>}
          {ficha.transformacao.bonus_defesa>0&&<span style={{fontSize:9,color:C.gold,border:`1px solid rgba(208,160,64,0.3)`,padding:"1px 6px",borderRadius:2}}>+{ficha.transformacao.bonus_defesa} DEFESA</span>}
        </div>
      )}

      {/* CONTEÚDO */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 16px"}}>

        {/* ── CRIAÇÃO GUIADA ── */}
        {aba==="criar" && (
          <div>
            <StepCard step={1} title="DISTRIBUIR ATRIBUTOS" active={ficha.criacao_step===1} done={ficha.criacao_step>1}>
              <p style={{fontSize:11,color:C.gray3,marginBottom:16,lineHeight:1.8}}>
                Todos os atributos começam em <strong style={{color:C.white}}>1</strong>. Você tem <strong style={{color:C.lime}}>{pontosRestantes} ponto{pontosRestantes!==1?"s":""}</strong> para distribuir.
                Reduzir para <strong style={{color:C.white}}>0</strong> concede +1 ponto bônus. Máximo <strong style={{color:C.white}}>3</strong> na criação.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))",gap:10,marginBottom:20}}>
                {Object.entries(ficha.atributos).map(([attr,val])=>{
                  const gasto=Object.values(ficha.atributos).reduce((a,v)=>a+(v-1),0);
                  const podeSubir=val<3&&gasto<PONTOS_TOTAL;
                  const podeBaixar=val>0;
                  return (
                    <div key={attr} style={{padding:14,background:C.surface2,border:`1px solid ${C.border}`,borderTop:`2px solid ${attrCors[attr]}`,borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <div style={{fontSize:8,letterSpacing:3,color:attrCors[attr]}}>{attrNames[attr].toUpperCase()}</div>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <button disabled={!podeBaixar} onClick={()=>setAttrCriacao(attr,val-1)}
                          style={{width:26,height:26,background:podeBaixar?C.surface3:C.gray5,border:`1px solid ${C.border2}`,color:podeBaixar?C.gray2:C.gray4,cursor:podeBaixar?"pointer":"not-allowed",borderRadius:2,fontSize:15,fontFamily:"inherit"}}>−</button>
                        <span style={{fontSize:28,fontWeight:900,color:val===0?C.red:val===3?C.lime:attrCors[attr],minWidth:28,textAlign:"center"}}>{val}</span>
                        <button disabled={!podeSubir} onClick={()=>setAttrCriacao(attr,val+1)}
                          style={{width:26,height:26,background:podeSubir?C.surface3:C.gray5,border:`1px solid ${C.border2}`,color:podeSubir?C.gray2:C.gray4,cursor:podeSubir?"pointer":"not-allowed",borderRadius:2,fontSize:15,fontFamily:"inherit"}}>+</button>
                      </div>
                      {val===0&&<div style={{fontSize:8,color:C.red,letterSpacing:1}}>+1 PT BÔNUS</div>}
                      {val===3&&<div style={{fontSize:8,color:C.lime,letterSpacing:1}}>MÁXIMO</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{fontSize:11,color:C.gray3}}>
                  Distribuído: <strong style={{color:C.white}}>{pontosGastos}</strong>/{PONTOS_TOTAL}
                  {pontosRestantes>0&&<span style={{color:C.gold}}> — {pontosRestantes} restante{pontosRestantes!==1?"s":""}</span>}
                </div>
                <button onClick={()=>setFicha(f=>({...f,criacao_step:2}))} style={btnLime}>CONFIRMAR ATRIBUTOS →</button>
              </div>
            </StepCard>

            <StepCard step={2} title="ESCOLHER ORIGEM" active={ficha.criacao_step===2} done={ficha.criacao_step>2}>
              {ficha.criacao_step<2&&<div style={{fontSize:11,color:C.gray4}}>Complete o passo anterior primeiro.</div>}
              {ficha.criacao_step>=2&&(<>
                <p style={{fontSize:11,color:C.gray3,marginBottom:14,lineHeight:1.8}}>Sua origem determina <strong style={{color:C.white}}>2 perícias treinadas</strong> e uma habilidade especial.</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))",gap:7,maxHeight:400,overflowY:"auto",paddingRight:4}}>
                  {ORIGENS.map(o=>(
                    <div key={o.nome} onClick={()=>setFicha(f=>({...f,origem:o.nome}))}
                      style={{padding:"10px 12px",background:ficha.origem===o.nome?C.limeFade2:C.surface2,border:`1px solid ${ficha.origem===o.nome?C.lime:C.border}`,borderRadius:2,cursor:"pointer",transition:"all 0.12s"}}>
                      <div style={{fontSize:12,fontWeight:700,color:ficha.origem===o.nome?C.lime:C.white}}>{o.nome}</div>
                      <div style={{fontSize:9,color:C.gray3,marginTop:3}}>{o.pericias.join(" · ")}</div>
                      <div style={{fontSize:8,color:C.gold,marginTop:2,letterSpacing:1}}>{o.habilidade}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:14,display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
                  <button onClick={()=>setFicha(f=>({...f,criacao_step:1}))} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← VOLTAR</button>
                  <button disabled={!ficha.origem} onClick={()=>confirmarOrigem(ficha.origem)}
                    style={{...btnLime,opacity:ficha.origem?1:0.4,cursor:ficha.origem?"pointer":"not-allowed"}}>CONFIRMAR ORIGEM →</button>
                </div>
              </>)}
            </StepCard>

            <StepCard step={3} title="ESCOLHER CLASSE" active={ficha.criacao_step===3} done={ficha.criacao_step>3}>
              {ficha.criacao_step<3&&<div style={{fontSize:11,color:C.gray4}}>Complete os passos anteriores primeiro.</div>}
              {ficha.criacao_step>=3&&(<>
                <p style={{fontSize:11,color:C.gray3,marginBottom:14,lineHeight:1.8}}>Sua classe define recursos iniciais e progressão por NEX.</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(290px,1fr))",gap:10}}>
                  {Object.entries(CLASSES).map(([nome,cls])=>{
                    const pvI=calcPV(nome,ficha.atributos,0),peI=calcPE(nome,ficha.atributos,0),sanI=calcSAN(nome,0);
                    const ativo=ficha.classe===nome;
                    return (
                      <div key={nome} onClick={()=>setFicha(f=>({...f,classe:nome}))}
                        style={{padding:16,background:ativo?C.limeFade2:C.surface2,border:`1px solid ${ativo?C.lime:C.border}`,borderRadius:3,cursor:"pointer",transition:"all 0.12s"}}>
                        <div style={{fontSize:14,fontWeight:700,color:ativo?C.lime:C.white,marginBottom:6}}>{nome}</div>
                        <div style={{fontSize:10,color:C.gray3,lineHeight:1.7,marginBottom:10}}>{cls.desc}</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                          {[["PV",pvI,C.red],["PE",peI,C.blue],["SAN",sanI,C.purple]].map(([l,v,c])=>(
                            <div key={l} style={{padding:"6px 8px",background:C.surface,borderRadius:2,textAlign:"center",border:`1px solid ${C.border}`}}>
                              <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                              <div style={{fontSize:8,color:C.gray4,letterSpacing:1}}>{l} INICIAL</div>
                            </div>
                          ))}
                        </div>
                        <div style={{fontSize:9,color:C.gray4,lineHeight:1.7}}>
                          <div>Perícias fixas: <span style={{color:C.gray2}}>{cls.pericias_fixas.join(", ")||"—"}</span></div>
                          <div>+ {cls.pericias_livre_formula} à escolha</div>
                          <div style={{marginTop:4,color:C.gray4}}>Por nível: +{cls.pv_nex} PV (+VIG) · +{cls.pe_nex} PE (+PRE) · +{cls.san_nex} SAN</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{marginTop:14,display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
                  <button onClick={()=>setFicha(f=>({...f,criacao_step:2}))} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← VOLTAR</button>
                  <button disabled={!ficha.classe} onClick={()=>confirmarClasse(ficha.classe)}
                    style={{...btnLime,opacity:ficha.classe?1:0.4,cursor:ficha.classe?"pointer":"not-allowed"}}>CONFIRMAR CLASSE E INICIAR →</button>
                </div>
              </>)}
            </StepCard>
          </div>
        )}

        {/* ── IDENTIDADE ── */}
        {aba==="identidade"&&(
          <Sec title="◈ IDENTIDADE DO AGENTE">
            <G2><Inp label="Nome do Agente" v={ficha.nome} s={v=>upd("nome",v)} ph="Nome completo"/><Inp label="Nome do Jogador" v={ficha.jogador} s={v=>upd("jogador",v)}/><Inp label="Idade" v={ficha.idade} s={v=>upd("idade",v)} type="number"/><Inp label="Gênero" v={ficha.genero} s={v=>upd("genero",v)}/></G2>
            <G2 mt><Slc label="Patente" v={ficha.patente} s={v=>upd("patente",v)} opts={PATENTES}/><Inp label="XP Total" v={ficha.xp} s={v=>upd("xp",Number(v))} type="number"/></G2>
            {ficha.origem&&(()=>{const o=ORIGENS.find(o=>o.nome===ficha.origem);return(<div style={{marginTop:12,padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}><div style={{fontSize:9,color:C.lime,letterSpacing:2,marginBottom:3}}>{ficha.origem.toUpperCase()} — {o.habilidade}</div><div style={{fontSize:11,color:C.gray2}}>Perícias: <strong style={{color:C.white}}>{o.pericias.join(" e ")}</strong></div></div>);})()}
            {ficha.classe&&(<div style={{marginTop:10,padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}><div style={{fontSize:9,color:C.lime,letterSpacing:2,marginBottom:3}}>CLASSE: {ficha.classe.toUpperCase()}</div><div style={{fontSize:10,color:C.gray3,lineHeight:1.7}}>{CLASSES[ficha.classe].desc}</div><div style={{fontSize:10,color:C.gray4,marginTop:4}}>Por nível de NEX: +{CLASSES[ficha.classe].pv_nex} PV (+VIG) · +{CLASSES[ficha.classe].pe_nex} PE (+PRE) · +{CLASSES[ficha.classe].san_nex} SAN</div></div>)}
            <div style={{marginTop:18}}><TxtA label="Aparência física" v={ficha.aparencia} s={v=>upd("aparencia",v)} rows={3}/><TxtA label="História / Background" v={ficha.historia} s={v=>upd("historia",v)} rows={4}/><TxtA label="Motivação" v={ficha.motivacao} s={v=>upd("motivacao",v)} rows={3}/></div>
          </Sec>
        )}

        {/* ── ATRIBUTOS ── */}
        {aba==="atributos"&&(
          <Sec title="◆ ATRIBUTOS">
            <div style={{fontSize:10,color:C.gray4,marginBottom:16,lineHeight:1.8}}>Atributos podem ser negativados. Os valores <strong style={{color:C.gray2}}>não somam</strong> ao bônus de perícia — apenas graus e modificadores contam.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))",gap:10,marginBottom:24}}>
              {Object.entries(ficha.atributos).map(([attr,val])=>(
                <div key={attr} style={{padding:16,background:C.surface2,border:`1px solid ${C.border}`,borderTop:`2px solid ${attrCors[attr]}`,borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,letterSpacing:3,color:attrCors[attr]}}>{attrNames[attr].toUpperCase()}</div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button onClick={()=>setFicha(f=>({...f,atributos:{...f.atributos,[attr]:val-1}}))} style={{width:26,height:26,background:C.surface3,border:`1px solid ${C.border2}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:15}}>−</button>
                    <span style={{fontSize:28,fontWeight:900,color:val<0?C.red:val===0?C.gray3:attrCors[attr],minWidth:34,textAlign:"center"}}>{val}</span>
                    <button onClick={()=>setFicha(f=>({...f,atributos:{...f.atributos,[attr]:val+1}}))} style={{width:26,height:26,background:C.surface3,border:`1px solid ${C.border2}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:15}}>+</button>
                  </div>
                  <button onClick={()=>rolar("1d20",`Teste de ${attrNames[attr]}`)} style={{padding:"4px 10px",background:"transparent",border:`1px solid ${C.border}`,color:C.gray4,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",letterSpacing:1}}>⬡ TESTAR</button>
                </div>
              ))}
            </div>
            <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>VALORES DERIVADOS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px,1fr))",gap:8}}>
              {[
                {label:"PV Máximo",val:pvTotal,color:C.red,sub:pvTemp>0?`${pvMax} + ${pvTemp} temp`:`${CLASSES[ficha.classe]?.pv_base||0}+VIG+NEX`},
                {label:"PE Máximo",val:peTotal,color:C.blue,sub:peTemp>0?`${peMax} + ${peTemp} temp`:`${CLASSES[ficha.classe]?.pe_base||0}+PRE+NEX`},
                {label:"SAN Máxima",val:sanMax,color:C.purple,sub:`${CLASSES[ficha.classe]?.san_base||0}+NEX`},
                {label:"Defesa",val:defesa,color:C.gold,sub:`10+AGI(${ficha.atributos.AGI})+bônus`},
                {label:"Deslocamento",val:"9m",color:C.green,sub:"Base padrão"},
              ].map(d=>(
                <div key={d.label} style={{padding:"12px 10px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${d.color}`,borderRadius:3,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:d.color}}>{d.val}</div>
                  <div style={{fontSize:8,color:C.gray3,letterSpacing:1,marginTop:2}}>{d.label.toUpperCase()}</div>
                  <div style={{fontSize:8,color:C.gray5,marginTop:2}}>{d.sub}</div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── PERÍCIAS ── */}
        {aba==="pericias"&&(
          <Sec title="▣ PERÍCIAS">
            <div style={{fontSize:10,color:C.gray4,marginBottom:14,lineHeight:1.8}}>
              Graus: <span style={{color:C.blue}}>T</span> +5 · <span style={{color:C.gold}}>V</span> +10 · <span style={{color:C.lime}}>E</span> +15. Atributos <strong>não somam</strong>.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {PERICIAS.map(p=>{
                const grau=ficha.pericias[p.nome]||"Destreinado";
                const grauIdx=GRAUS.indexOf(grau);
                const bonus=calcBonusP(ficha,p.nome);
                const manual=ficha.bonus_pericia?.[p.nome]||0;
                const transB=ficha.transformacao?.ativa&&ficha.transformacao?.bonus_pericias?.[p.nome]?Number(ficha.transformacao.bonus_pericias[p.nome]):0;
                return (
                  <div key={p.nome} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:10,alignItems:"center",padding:"7px 11px",background:bonus>0?C.limeFade:C.surface2,border:`1px solid ${bonus>0?"rgba(200,245,90,0.12)":C.border}`,borderRadius:2}}>
                    <div>
                      <div style={{fontSize:12,color:C.white,display:"flex",alignItems:"center",gap:6}}>
                        {p.nome}
                        {transB!==0&&<span style={{fontSize:8,color:C.lime,border:`1px solid ${C.lime}`,padding:"0 4px",borderRadius:2}}>◬{transB>0?"+":""}{transB}</span>}
                      </div>
                      <div style={{fontSize:8,letterSpacing:2,color:attrCors[p.at]}}>{p.at}</div>
                    </div>
                    <div style={{display:"flex",gap:3}}>
                      {GRAUS.map((g,gi)=>(
                        <button key={g} title={`${g} (+${GRAU_BONUS[g]})`}
                          onClick={()=>setFicha(f=>({...f,pericias:{...f.pericias,[p.nome]:GRAUS[(grauIdx+1)%GRAUS.length]}}))}
                          style={{width:20,height:20,borderRadius:2,border:`1px solid ${GRAU_COR[g]}`,background:gi<=grauIdx?GRAU_COR[g]:"transparent",color:gi<=grauIdx?C.bg:C.gray5,cursor:"pointer",fontSize:8,fontWeight:700}}>
                          {GRAU_SH[g]}
                        </button>
                      ))}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontSize:7,color:C.gray5,letterSpacing:1}}>BÔNUS</span>
                      <input type="number" value={manual} onChange={e=>setFicha(f=>({...f,bonus_pericia:{...f.bonus_pericia,[p.nome]:Number(e.target.value)}}))}
                        style={{width:36,padding:"2px 4px",textAlign:"center",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}} />
                    </div>
                    <div style={{fontSize:16,fontWeight:900,color:bonus>0?C.lime:C.gray3,minWidth:28,textAlign:"center"}}>{bonus>0?`+${bonus}`:bonus}</div>
                    <button onClick={()=>rolar(`1d20+${bonus}`,`${p.nome} (${grau})`)} style={{padding:"4px 7px",background:"transparent",border:`1px solid ${C.border}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:11}}>⬡</button>
                  </div>
                );
              })}
            </div>
          </Sec>
        )}

        {/* ── BÔNUS ── */}
        {aba==="bonus"&&(
          <Sec title="⊕ BÔNUS & MODIFICADORES">
            <FormBx>
              <G2><Inp label="Nome / Fonte" v={novoBonus.nome} s={v=>setNovoBonus(b=>({...b,nome:v}))} ph="Ex: Faro para Pistas..."/><Slc label="Aplica-se a" v={novoBonus.alvo} s={v=>setNovoBonus(b=>({...b,alvo:v}))} opts={["Todas",...PERICIAS.map(p=>p.nome)]}/></G2>
              <G2 mt><Inp label="Valor (+/−)" v={novoBonus.valor} s={v=>setNovoBonus(b=>({...b,valor:Number(v)}))} type="number" ph="+5, -2..."/><Inp label="Notas" v={novoBonus.desc} s={v=>setNovoBonus(b=>({...b,desc:v}))} ph="Permanente / Até fim da cena..."/></G2>
              <Btn onClick={addBonus}>+ ADICIONAR</Btn>
            </FormBx>
            {(ficha.bonus_extras||[]).length===0&&<Empty>Nenhum modificador registrado.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(ficha.bonus_extras||[]).map(b=>(
                <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${b.valor>=0?C.lime:C.red}`,borderRadius:2,opacity:b.ativo?1:0.45}}>
                  <div><div style={{fontSize:13,color:C.white,fontWeight:700}}>{b.nome}</div><div style={{fontSize:8,color:C.gray3,letterSpacing:1}}>{b.alvo==="Todas"?"TODAS AS PERÍCIAS":b.alvo.toUpperCase()}</div>{b.desc&&<div style={{fontSize:10,color:C.gray4}}>{b.desc}</div>}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:22,fontWeight:900,color:b.valor>=0?C.lime:C.red}}>{b.valor>=0?"+":""}{b.valor}</span>
                    <button onClick={()=>togBonus(b.id)} style={{padding:"3px 8px",background:"transparent",border:`1px solid ${C.border}`,color:b.ativo?C.lime:C.gray4,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit"}}>{b.ativo?"ATIVO":"OFF"}</button>
                    <button onClick={()=>rmBonus(b.id)} style={btnRm}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── HABILIDADES ── */}
        {aba==="habilidades"&&(
          <Sec title="◉ HABILIDADES">
            <FormBx>
              <Inp label="Nome da Habilidade" v={novaHab.nome} s={v=>setNovaHab(h=>({...h,nome:v}))} ph="Ex: Mão Pesada, Traços do Outro Lado..."/>
              <div style={{marginTop:10}}><TxtA label="Descrição / Efeito" v={novaHab.desc} s={v=>setNovaHab(h=>({...h,desc:v}))} rows={3}/></div>
              <Btn onClick={addHab}>+ ADICIONAR HABILIDADE</Btn>
            </FormBx>
            {(ficha.habilidades||[]).length===0&&<Empty>Nenhuma habilidade registrada.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(ficha.habilidades||[]).map(h=>(
                <div key={h.id} style={{padding:"12px 16px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontSize:14,color:C.lime,fontWeight:700}}>{h.nome}</div>
                    <button onClick={()=>rmHab(h.id)} style={btnRm}>✕</button>
                  </div>
                  {h.desc&&<div style={{fontSize:11,color:C.gray2,lineHeight:1.7,marginTop:6}}>{h.desc}</div>}
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── RECURSOS ── */}
        {aba==="recursos"&&(
          <Sec title="◍ RECURSOS & STATUS">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px,1fr))",gap:12,marginBottom:20}}>
              <RecCard label="PONTOS DE VIDA"    color={C.red}    atual={ficha.pv_atual}  max={pvTotal}  temp={pvTemp}  onChange={v=>upd("pv_atual",  Math.max(0,Math.min(pvTotal, v)))} />
              <RecCard label="PONTOS DE ESFORÇO" color={C.blue}   atual={ficha.pe_atual}  max={peTotal}  temp={peTemp}  onChange={v=>upd("pe_atual",  Math.max(0,Math.min(peTotal, v)))} />
              <RecCard label="SANIDADE"           color={C.purple} atual={ficha.san_atual} max={sanMax}   temp={0}       onChange={v=>upd("san_atual", Math.max(0,Math.min(sanMax,  v)))} />
            </div>

            {/* DEFESA EXPANDIDA */}
            <div style={{marginBottom:20,padding:16,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:3}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:9,color:C.gray4,letterSpacing:3}}>DEFESA</div>
                <div style={{fontSize:28,fontWeight:900,color:C.gold}}>{defesa}</div>
              </div>
              <div style={{fontSize:9,color:C.gray4,marginBottom:10}}>
                Base: 10 + AGI({ficha.atributos.AGI})
                {ficha.transformacao?.ativa&&ficha.transformacao?.bonus_defesa>0&&<span style={{color:C.lime}}> + {ficha.transformacao.bonus_defesa} (transformação)</span>}
                {(ficha.bonus_defesa||[]).filter(b=>b.ativo).map(b=><span key={b.id} style={{color:C.gold}}> + {b.valor} ({b.nome})</span>)}
              </div>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>BÔNUS DE DEFESA MANUAIS</div>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                <input value={novoBonusDef.nome} onChange={e=>setNovoBonusDef(b=>({...b,nome:e.target.value}))} placeholder="Nome do bônus"
                  style={{flex:2,minWidth:120,padding:"6px 9px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}} />
                <input type="number" value={novoBonusDef.valor} onChange={e=>setNovoBonusDef(b=>({...b,valor:Number(e.target.value)}))}
                  style={{width:56,padding:"6px 8px",textAlign:"center",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}} />
                <button onClick={addBonusDef} style={{padding:"6px 12px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:1}}>+ ADD</button>
              </div>
              {(ficha.bonus_defesa||[]).length===0&&<div style={{fontSize:10,color:C.gray5}}>Nenhum bônus de defesa manual.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {(ficha.bonus_defesa||[]).map(b=>(
                  <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:C.surface3,border:`1px solid ${C.border}`,borderRadius:2,opacity:b.ativo?1:0.5}}>
                    <span style={{flex:1,fontSize:11,color:C.white}}>{b.nome}</span>
                    <span style={{fontSize:14,fontWeight:700,color:b.valor>=0?C.gold:C.red}}>{b.valor>=0?"+":""}{b.valor}</span>
                    <button onClick={()=>togBonusDef(b.id)} style={{padding:"2px 7px",background:"transparent",border:`1px solid ${C.border}`,color:b.ativo?C.gold:C.gray4,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit"}}>{b.ativo?"ATIVO":"OFF"}</button>
                    <button onClick={()=>rmBonusDef(b.id)} style={btnRm}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <G2>
              <Inp label="Dinheiro (R$)" v={ficha.dinheiro} s={v=>upd("dinheiro",Number(v))} type="number"/>
              <Inp label="XP Total" v={ficha.xp} s={v=>upd("xp",Number(v))} type="number"/>
            </G2>
            <div style={{marginTop:16}}>
              <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>PROGRESSÃO</div>
              <G2>
                <div>
                  <div style={{fontSize:9,color:C.gray4,letterSpacing:2,marginBottom:5}}>NEX — <span style={{color:C.lime,fontWeight:700}}>{ficha.nex}%</span></div>
                  <input type="range" min={0} max={99} step={5} value={ficha.nex} onChange={e=>upd("nex",Number(e.target.value))} style={{width:"100%",accentColor:C.lime,marginBottom:4}} />
                  <div style={{display:"flex",justifyContent:"space-between"}}>{[0,10,25,50,75,99].map(n=><span key={n} style={{fontSize:7,color:ficha.nex>=n?C.lime:C.gray5}}>{n}%</span>)}</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:C.gray4,letterSpacing:2,marginBottom:5}}>NÍVEL — <span style={{color:C.lime,fontWeight:700}}>{ficha.nivel}</span></div>
                  <input type="range" min={1} max={20} step={1} value={ficha.nivel} onChange={e=>upd("nivel",Number(e.target.value))} style={{width:"100%",accentColor:C.lime,marginBottom:4}} />
                  <div style={{display:"flex",justifyContent:"space-between"}}>{[1,5,10,15,20].map(n=><span key={n} style={{fontSize:7,color:ficha.nivel>=n?C.lime:C.gray5}}>Nv.{n}</span>)}</div>
                </div>
              </G2>
            </div>
            {ficha.classe&&(
              <div style={{marginTop:14,padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:2}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:3,marginBottom:8}}>PROGRESSÃO POR NÍVEL DE EXPOSIÇÃO (A cada 5% NEX)</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  {[[`+${CLASSES[ficha.classe].pv_nex} PV (+VIG)`,C.red],[`+${CLASSES[ficha.classe].pe_nex} PE (+PRE)`,C.blue],[`+${CLASSES[ficha.classe].san_nex} SAN`,C.purple]].map(([txt,cor])=>(
                    <div key={txt} style={{padding:"6px 12px",background:C.surface,border:`1px solid ${C.border}`,borderBottom:`2px solid ${cor}`,borderRadius:2}}>
                      <span style={{fontSize:12,fontWeight:700,color:cor}}>{txt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginTop:16}}>
              <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>CONDIÇÕES</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>
                {Object.entries(ficha.status).map(([cond,ativo])=>(
                  <button key={cond} onClick={()=>setFicha(f=>({...f,status:{...f.status,[cond]:!ativo}}))}
                    style={{padding:"6px 12px",background:ativo?"rgba(224,80,80,0.15)":C.surface2,border:`1px solid ${ativo?C.red:C.border}`,color:ativo?C.red:C.gray4,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",letterSpacing:1}}>
                    {ativo?"⚠":"○"} {cond.toUpperCase()}
                  </button>
                ))}
              </div>
              <TxtA label="Condições especiais" v={ficha.condicoes} s={v=>upd("condicoes",v)} rows={3}/>
            </div>
          </Sec>
        )}

        {/* ── INVENTÁRIO ── */}
        {aba==="inventario"&&(
          <Sec title="◫ INVENTÁRIO">
            <div style={{fontSize:11,color:C.gray3,marginBottom:14}}>
              Peso: <strong style={{color:C.white}}>{totalPeso.toFixed(1)} kg</strong> / Cap.: <strong style={{color:C.white}}>{ficha.atributos.FOR*5} kg</strong>
              {totalPeso>ficha.atributos.FOR*5&&<span style={{color:C.red,marginLeft:10,fontSize:9,letterSpacing:1}}>⚠ SOBRECARREGADO</span>}
            </div>
            <FormBx>
              <G2><Inp label="Nome" v={novoItem.nome} s={v=>setNovoItem(i=>({...i,nome:v}))} ph="Nome do item"/><Slc label="Tipo" v={novoItem.tipo} s={v=>setNovoItem(i=>({...i,tipo:v}))} opts={["Arma","Proteção","Equipamento","Consumível","Relíquia","Munição","Outro"]}/></G2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px,1fr))",gap:10,marginTop:10}}>
                <Inp label="Qtd" v={novoItem.qtd} s={v=>setNovoItem(i=>({...i,qtd:Number(v)}))} type="number"/><Inp label="Peso (kg)" v={novoItem.peso} s={v=>setNovoItem(i=>({...i,peso:v}))}/><Inp label="Detalhes / Dano" v={novoItem.desc} s={v=>setNovoItem(i=>({...i,desc:v}))} ph="2d6+2..."/>
              </div>
              <Btn onClick={addItem}>+ ADICIONAR</Btn>
            </FormBx>
            {ficha.inventario.length===0&&<Empty>Inventário vazio.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ficha.inventario.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}>
                  <div><span style={{fontSize:13,color:C.white,fontWeight:700}}>{item.nome}</span><span style={{fontSize:8,color:C.lime,letterSpacing:2,marginLeft:10}}>{item.tipo.toUpperCase()}</span>{item.desc&&<div style={{fontSize:9,color:C.gray4,marginTop:2}}>{item.desc}</div>}</div>
                  <div style={{display:"flex",gap:10,alignItems:"center",color:C.gray4,fontSize:11}}><span>×{item.qtd}</span><span>{(parseFloat(item.peso)*item.qtd).toFixed(1)} kg</span><button onClick={()=>rmItem(item.id)} style={btnRm}>✕</button></div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── RITUAIS ── */}
        {aba==="rituais"&&(
          <Sec title="◌ RITUAIS CONHECIDOS">
            <FormBx>
              <G2><Inp label="Nome do Ritual" v={novoRitual.nome} s={v=>setNovoRitual(r=>({...r,nome:v}))}/><Slc label="Elemento" v={novoRitual.elemento} s={v=>setNovoRitual(r=>({...r,elemento:v}))} opts={["Morte","Energia","Medo","Conhecimento","Sangue"]}/></G2>
              <G2 mt><Slc label="Círculo" v={String(novoRitual.circulo)} s={v=>setNovoRitual(r=>({...r,circulo:Number(v)}))} opts={["1","2","3"]}/><Inp label="Execução" v={novoRitual.execucao} s={v=>setNovoRitual(r=>({...r,execucao:v}))} ph="Padrão, Movimento, Livre..."/></G2>
              <G2 mt><Inp label="Alcance" v={novoRitual.alcance} s={v=>setNovoRitual(r=>({...r,alcance:v}))} ph="Pessoal, 9m..."/><Inp label="Área" v={novoRitual.area} s={v=>setNovoRitual(r=>({...r,area:v}))} ph="Cubo 3m, Esfera..."/></G2>
              <G2 mt><Inp label="Alvo" v={novoRitual.alvo} s={v=>setNovoRitual(r=>({...r,alvo:v}))} ph="1 criatura..."/><Inp label="Duração" v={novoRitual.duracao} s={v=>setNovoRitual(r=>({...r,duracao:v}))} ph="Instantâneo, 1 cena..."/></G2>
              <G2 mt><Inp label="Resistência" v={novoRitual.resistencia} s={v=>setNovoRitual(r=>({...r,resistencia:v}))} ph="Fortitude, Vontade..."/><Inp label="Dados Base" v={novoRitual.dados} s={v=>setNovoRitual(r=>({...r,dados:v}))} ph="2d6, 1d10+3..."/></G2>
              <G2 mt><Inp label="Dados Discente" v={novoRitual.dados_discente} s={v=>setNovoRitual(r=>({...r,dados_discente:v}))} ph="Variante Discente..."/><Inp label="Dados Verdadeiro" v={novoRitual.dados_verdadeiro} s={v=>setNovoRitual(r=>({...r,dados_verdadeiro:v}))} ph="Variante Verdadeiro..."/></G2>
              <div style={{marginTop:10}}><TxtA label="Efeito / Descrição Completa" v={novoRitual.efeito} s={v=>setNovoRitual(r=>({...r,efeito:v}))} rows={3}/></div>
              <Btn onClick={addRitual}>+ REGISTRAR RITUAL</Btn>
            </FormBx>
            {ficha.rituais.length===0&&<Empty>Nenhum ritual registrado.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {ficha.rituais.map(r=>{
                const ec=ELEMENTO_COR[r.elemento]||{border:C.gray3,bg:"transparent",text:C.gray3};
                return (
                  <div key={r.id} style={{padding:"14px 16px",background:ec.bg,border:`1px solid ${ec.border}`,borderLeft:`3px solid ${ec.border}`,borderRadius:3}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div><div style={{fontSize:14,fontWeight:700,color:C.white}}>{r.nome}</div><div style={{fontSize:8,color:ec.text,letterSpacing:3,marginTop:2}}>CÍRCULO {r.circulo} · {r.elemento.toUpperCase()}</div></div>
                      <button onClick={()=>rmRitual(r.id)} style={btnRm}>✕</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px,1fr))",gap:5}}>
                      {[["Execução",r.execucao],["Alcance",r.alcance],["Área",r.area],["Alvo",r.alvo],["Duração",r.duracao],["Resistência",r.resistencia],["Dados",r.dados],["Discente",r.dados_discente],["Verdadeiro",r.dados_verdadeiro]].filter(([,v])=>v).map(([label,val])=>(
                        <div key={label} style={{padding:"5px 8px",background:"rgba(0,0,0,0.4)",borderRadius:2,border:`1px solid rgba(255,255,255,0.06)`}}>
                          <div style={{fontSize:7,color:C.gray4,letterSpacing:1}}>{label.toUpperCase()}</div>
                          <div style={{fontSize:11,color:C.gray1,marginTop:1}}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {r.efeito&&<div style={{marginTop:8,padding:"8px 10px",background:"rgba(0,0,0,0.4)",borderRadius:2,border:`1px solid rgba(255,255,255,0.05)`}}><div style={{fontSize:7,color:C.gray4,letterSpacing:1,marginBottom:3}}>EFEITO</div><div style={{fontSize:11,color:C.gray2,lineHeight:1.7}}>{r.efeito}</div></div>}
                    {r.dados&&<div style={{marginTop:8}}><button onClick={()=>rolar(r.dados,`${r.nome} (${r.elemento})`)} style={{padding:"5px 12px",background:ec.bg,border:`1px solid ${ec.border}`,color:ec.text,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",letterSpacing:1}}>⬡ ROLAR {r.dados}</button></div>}
                  </div>
                );
              })}
            </div>
          </Sec>
        )}

        {/* ── NOTAS ── */}
        {aba==="notas"&&(
          <Sec title="▤ NOTAS & ANOTAÇÕES">
            <TxtA label="Anotações livres — contatos, segredos, pistas, eventos..." v={ficha.notas} s={v=>upd("notas",v)} rows={20}/>
            <div style={{marginTop:24}}>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:3,marginBottom:10}}>EXPORTAR / IMPORTAR</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <Btn onClick={()=>{const blob=new Blob([JSON.stringify(ficha,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${ficha.nome||"agente"}_op.json`;a.click();}}>⬇ EXPORTAR JSON</Btn>
                <label style={{marginTop:10,padding:"7px 14px",background:"transparent",border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2}}>
                  ⬆ IMPORTAR JSON
                  <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{setFicha(JSON.parse(ev.target.result));}catch{alert("Arquivo inválido.");}};reader.readAsText(file);}}/>
                </label>
              </div>
            </div>
          </Sec>
        )}
      </div>

      {/* BARRA INFERIOR */}
      {ficha.classe&&ficha.criacao_step>=4&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"5px 18px",display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          {[{l:"PV",a:ficha.pv_atual,m:pvTotal,c:C.red},{l:"PE",a:ficha.pe_atual,m:peTotal,c:C.blue},{l:"SAN",a:ficha.san_atual,m:sanMax,c:C.purple}].map(r=>(
            <div key={r.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:8,color:r.c,fontWeight:700,minWidth:24,letterSpacing:1}}>{r.l}</span>
              <div style={{width:50,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}>
                <div style={{width:`${r.m>0?Math.min(100,(r.a/r.m)*100):0}%`,height:"100%",background:r.c,transition:"width 0.3s"}} />
              </div>
              <span style={{fontSize:8,color:C.gray4}}>{r.a}/{r.m}</span>
            </div>
          ))}
          <div style={{fontSize:8,color:C.gold}}>DEF {defesa}</div>
          <span style={{flex:1}} />
          {ficha.transformacao?.ativa&&<span style={{fontSize:8,color:C.lime,border:`1px solid ${C.lime}`,padding:"1px 6px",borderRadius:2,letterSpacing:1}}>◬ {ficha.transformacao.nome}</span>}
          <span style={{fontSize:8,color:C.lime,letterSpacing:2}}>NEX {ficha.nex}%</span>
          <span style={{fontSize:8,color:C.gray4,letterSpacing:1}}>NV.{ficha.nivel}</span>
          <span style={{fontSize:8,color:C.gray5,letterSpacing:2}}>{ficha.classe?.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

// ─── MICRO COMPONENTES ────────────────────────────────────────────────────────
function StepCard({step,title,active,done,children}) {
  return (
    <div style={{marginBottom:14,padding:20,background:C.surface2,border:`1px solid ${done?C.lime:active?C.lime:C.border}`,borderLeft:`3px solid ${done?C.lime:active?C.lime:C.gray5}`,borderRadius:3,opacity:!active&&!done?0.5:1}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:done?C.lime:active?C.limeFade2:C.gray5,border:`1px solid ${done||active?C.lime:C.gray4}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:done?C.bg:active?C.lime:C.gray4,flexShrink:0}}>{done?"✓":step}</div>
        <div style={{fontSize:10,letterSpacing:3,color:done||active?C.lime:C.gray4}}>PASSO {step} — {title}</div>
        {done&&<div style={{fontSize:9,color:C.lime,marginLeft:"auto",letterSpacing:1}}>✓ CONCLUÍDO</div>}
      </div>
      {children}
    </div>
  );
}
function Sec({title,children}) {
  return <div><div style={{fontSize:10,fontWeight:700,letterSpacing:4,color:C.lime,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>{title}</div>{children}</div>;
}
function FormBx({children}) {
  return <div style={{padding:14,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:2,marginBottom:16}}>{children}</div>;
}
function G2({children,mt}) {
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))",gap:10,...(mt?{marginTop:10}:{})}}>{children}</div>;
}
function Inp({label,v,s,type="text",ph=""}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:7,letterSpacing:2,color:C.gray4,textTransform:"uppercase"}}>{label}</label>}
      <input type={type} value={v} onChange={e=>s(e.target.value)} placeholder={ph}
        style={{padding:"7px 9px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}} />
    </div>
  );
}
function Slc({label,v,s,opts,ph}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:7,letterSpacing:2,color:C.gray4,textTransform:"uppercase"}}>{label}</label>}
      <select value={v} onChange={e=>s(e.target.value)}
        style={{padding:"7px 9px",background:C.bg,border:`1px solid ${C.border}`,color:v?C.white:C.gray4,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}}>
        {ph&&<option value="">{ph}</option>}
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function TxtA({label,v,s,rows=3}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
      {label&&<label style={{fontSize:7,letterSpacing:2,color:C.gray4,textTransform:"uppercase"}}>{label}</label>}
      <textarea value={v} onChange={e=>s(e.target.value)} rows={rows}
        style={{padding:"7px 9px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.7}} />
    </div>
  );
}
function Btn({children,onClick,style:st}) {
  return <button onClick={onClick} style={{marginTop:10,padding:"7px 14px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2,...st}}>{children}</button>;
}
function Empty({children}) {
  return <div style={{padding:24,textAlign:"center",color:C.gray5,fontSize:12}}>{children}</div>;
}
function RecCard({label,color,atual,max,temp,onChange}) {
  const pct=max>0?Math.min(100,(atual/max)*100):0;
  return (
    <div style={{padding:14,background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${color}`,borderRadius:3}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <div>
          <span style={{fontSize:8,letterSpacing:3,color}}>{label}</span>
          {temp>0&&<span style={{fontSize:8,color:color,border:`1px solid ${color}`,padding:"0 5px",borderRadius:2,marginLeft:8,opacity:0.7}}>+{temp} TEMP</span>}
        </div>
        <span style={{fontSize:14,fontWeight:900,color}}>{atual} <span style={{color:C.gray4}}>/ {max}</span></span>
      </div>
      <div style={{height:3,background:C.border,borderRadius:1,overflow:"hidden",marginBottom:9}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,transition:"width 0.3s"}} />
      </div>
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
        {[[-5,"−5"],[-1,"−1"]].map(([val,lbl])=>(<button key={lbl} onClick={()=>onChange(atual+val)} style={{padding:"4px 7px",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>{lbl}</button>))}
        <input type="number" value={atual} onChange={e=>onChange(Number(e.target.value))} min={0} max={max}
          style={{width:48,padding:"4px 5px",textAlign:"center",background:C.bg,border:`1px solid ${C.border2}`,color:C.white,borderRadius:2,fontSize:13,fontFamily:"inherit",outline:"none"}} />
        {[[1,"+1"],[5,"+5"]].map(([val,lbl])=>(<button key={lbl} onClick={()=>onChange(atual+val)} style={{padding:"4px 7px",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>{lbl}</button>))}
        <button onClick={()=>onChange(max)} style={{padding:"4px 9px",background:"transparent",border:`1px solid ${color}`,color,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit",letterSpacing:1,marginLeft:3}}>MAX</button>
      </div>
    </div>
  );
}

const btnLime = {padding:"7px 14px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2};
const btnRm   = {padding:"3px 6px",background:"transparent",border:`1px solid rgba(224,80,80,0.25)`,color:C.red,cursor:"pointer",borderRadius:2,fontSize:10};
