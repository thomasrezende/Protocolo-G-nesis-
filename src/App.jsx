import { useState, useCallback, useEffect, useRef } from "react";

// ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────────
const STORAGE_KEY  = "op_agentes_v3";
const ARSENAL_KEY  = "op_arsenal_v1";
const loadAgentes  = () => { try { const r=localStorage.getItem(STORAGE_KEY);  return r?JSON.parse(r):[]; } catch{return[];} };
const saveAgentes  = (l) => { try { localStorage.setItem(STORAGE_KEY,  JSON.stringify(l)); } catch{} };
const loadArsenal  = () => { try { const r=localStorage.getItem(ARSENAL_KEY);  return r?JSON.parse(r):{habilidades:[],rituais:[]}; } catch{return{habilidades:[],rituais:[]};} };
const saveArsenal  = (a) => { try { localStorage.setItem(ARSENAL_KEY,  JSON.stringify(a)); } catch{} };

// ─── PALETA ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0a0a0a",surface:"#111",surface2:"#161616",surface3:"#1c1c1c",
  border:"#222",border2:"#333",
  lime:"#c8f55a",limeD:"#a8d040",limeFade:"rgba(200,245,90,0.08)",limeFade2:"rgba(200,245,90,0.18)",
  white:"#f0f0f0",gray1:"#c0c0c0",gray2:"#888",gray3:"#555",gray4:"#333",gray5:"#222",
  red:"#e05050",blue:"#50c8e0",purple:"#9060d0",gold:"#d0a040",green:"#50c050",orange:"#e0803a",
};
const ELEMENTO_COR = {
  Morte:        {border:"#9090c0",bg:"rgba(26,26,46,0.5)",   text:"#9090c0"},
  Energia:      {border:"#00c8e0",bg:"rgba(0,200,224,0.08)", text:"#00c8e0"},
  Medo:         {border:"#c8c8d0",bg:"rgba(200,200,208,0.06)",text:"#c8c8d0"},
  Conhecimento: {border:"#d0a040",bg:"rgba(208,160,64,0.08)",text:"#d0a040"},
  Sangue:       {border:"#e03030",bg:"rgba(224,48,48,0.1)",  text:"#e03030"},
};

const HAB_CLASSE = {
  Combatente: [
    {nome:"Armamento Pesado",        prereq:"For 2",                                    desc:"Você recebe proficiência com armas pesadas."},
    {nome:"Ataque de Oportunidade",  prereq:"—",                                        desc:"Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, você pode gastar uma reação e 1 PE para fazer um ataque corpo a corpo contra ele."},
    {nome:"Combate Defensivo",       prereq:"Int 2",                                    desc:"Quando usa a ação agredir, você pode combater defensivamente. Se fizer isso, até seu próximo turno sofre –5 em todos os testes de ataque, mas recebe +5 na Defesa."},
    {nome:"Golpe Demolidor",         prereq:"For 2, Treinado em Luta",                  desc:"Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 1 PE para causar dois dados de dano extra do mesmo tipo de sua arma."},
    {nome:"Golpe Pesado",            prereq:"—",                                        desc:"O dano de suas armas corpo a corpo aumenta em mais um dado do mesmo tipo."},
    {nome:"Incansável",              prereq:"—",                                        desc:"Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional, mas deve usar Força ou Agilidade como atributo-base do teste."},
    {nome:"Presteza Atlética",       prereq:"—",                                        desc:"Quando faz um teste de facilitar a investigação, você pode gastar 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia. Se passar no teste, o próximo aliado que usar seu bônus também recebe +5 no teste."},
    {nome:"Proteção Pesada",         prereq:"NEX 30%",                                  desc:"Você recebe proficiência com Proteções Pesadas."},
    {nome:"Reflexos Defensivos",     prereq:"Agi 2",                                    desc:"Você recebe +2 em Defesa e em testes de resistência."},
    {nome:"Saque Rápido",            prereq:"Treinado em Iniciativa",                   desc:"Você pode sacar ou guardar itens como uma ação livre. Além disso, uma vez por rodada pode recarregar uma arma de disparo como uma ação livre."},
    {nome:"Segurar o Gatilho",       prereq:"NEX 60%",                                  desc:"Sempre que acerta um ataque com uma arma de fogo, pode fazer outro ataque com a mesma arma contra o mesmo alvo, pagando 2 PE por cada ataque já realizado no turno (2 PE pelo 1º extra, +4 PE pelo 2º, e assim por diante)."},
    {nome:"Sentido Tático",          prereq:"Int 2, Treinado em Percepção e Tática",    desc:"Você pode gastar uma ação de movimento e 2 PE para analisar o ambiente. Se fizer isso, recebe um bônus em Defesa e em testes de resistência igual ao seu Intelecto até o final da cena."},
    {nome:"Tanque de Guerra",        prereq:"Proteção Pesada",                          desc:"Se estiver usando uma proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2."},
    {nome:"Tiro Certeiro",           prereq:"Treinado em Pontaria",                     desc:"Se estiver usando uma arma de disparo, você soma sua Agilidade nas rolagens de dano e ignora a penalidade contra alvos envolvidos em combate corpo a corpo, mesmo sem usar a ação mirar."},
    {nome:"Tiro de Cobertura",       prereq:"—",                                        desc:"Você pode gastar uma ação padrão e 1 PE para disparar em um personagem e forçá-lo a se proteger. Faça Pontaria vs. Vontade do alvo. Se vencer, até o início do seu próximo turno o alvo não pode sair do lugar e sofre –5 em testes de ataque. Este é um efeito de medo."},
    {nome:"Apego Angustiado",        prereq:"—",                                        desc:"Você não fica inconsciente por estar morrendo, mas sempre que terminar uma rodada nessa condição e consciente, perde 2 pontos de Sanidade."},
    {nome:"Caminho para a Forca",    prereq:"—",                                        desc:"Quando usa a ação sacrifício em perseguição, pode gastar 1 PE para fornecer +10 extra (total +20) nos testes dos aliados. Quando usa chamar atenção em furtividade, pode gastar 1 PE para diminuir a visibilidade de todos os aliados próximos em –2 (em vez de –1)."},
    {nome:"Ciente das Cicatrizes",   prereq:"Treinado em Luta ou Pontaria",             desc:"Quando faz um teste para encontrar pistas relacionadas a armas ou ferimentos (necropsia, identificar arma amaldiçoada etc.), você pode usar Luta ou Pontaria no lugar da perícia original."},
    {nome:"Correria Desesperada",    prereq:"—",                                        desc:"Você recebe +3m em seu deslocamento e +5 em testes de perícia para fugir em uma perseguição."},
    {nome:"Engolir o Choro",         prereq:"—",                                        desc:"Você não sofre penalidades por condições em testes de perícia para fugir e em testes de Furtividade."},
    {nome:"Instinto de Fuga",        prereq:"Treinado em Intuição",                     desc:"Quando uma cena de perseguição tem início, você recebe +2 em todos os testes de perícia que fizer durante a cena."},
    {nome:"Mochileiro",              prereq:"Vig 2",                                    desc:"Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de uma vestimenta adicional."},
    {nome:"Paranoia Defensiva",      prereq:"—",                                        desc:"Uma vez por cena, você pode gastar uma rodada e 3 PE. Você e cada aliado presente escolhe entre +5 na Defesa contra o próximo ataque ou +5 em um único teste de perícia até o fim da cena."},
    {nome:"Sacrificar os Joelhos",   prereq:"Treinado em Atletismo",                    desc:"Uma vez por cena de perseguição, quando faz a ação esforço extra, você pode gastar 2 PE para passar automaticamente no teste de perícia."},
    {nome:"Sem Tempo, Irmão",        prereq:"—",                                        desc:"Uma vez por cena de investigação, quando usa a ação facilitar investigação, você passa automaticamente no teste para auxiliar seus aliados, mas faz uma rolagem adicional na tabela de eventos de investigação."},
    {nome:"Valentão",                prereq:"—",                                        desc:"Você pode usar Força no lugar de Presença para Intimidação. Além disso, uma vez por cena, pode gastar 1 PE para fazer um teste de Intimidação para assustar como uma ação livre."},
  ],
  Especialista: [
    {nome:"Balística Avançada",      prereq:"—",                                        desc:"Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com armas de fogo."},
    {nome:"Conhecimento Aplicado",   prereq:"Int 2",                                    desc:"Quando faz um teste de perícia (exceto Luta e Pontaria), você pode gastar 2 PE para mudar o atributo-base da perícia para Int."},
    {nome:"Hacker",                  prereq:"Treinado em Tecnologia",                   desc:"Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo necessário para hackear qualquer sistema para uma ação completa."},
    {nome:"Mãos Rápidas",            prereq:"Agi 3, Treinado em Crime",                 desc:"Ao fazer um teste de Crime, você pode pagar 1 PE para fazê-lo como uma ação livre."},
    {nome:"Mochila de Utilidades",   prereq:"—",                                        desc:"Um item à sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos."},
    {nome:"Movimento Tático",        prereq:"Treinado em Atletismo",                    desc:"Você pode gastar 1 PE para ignorar a penalidade em deslocamento por terreno difícil e por escalar até o final do turno."},
    {nome:"Na Trilha Certa",         prereq:"—",                                        desc:"Sempre que tiver sucesso em um teste para procurar pistas, você pode gastar 1 PE para receber +5 no próximo teste. Os custos e bônus são cumulativos."},
    {nome:"Nerd",                    prereq:"—",                                        desc:"Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena (dica de pista, fraqueza de inimigo, etc.)."},
    {nome:"Ninja Urbano",            prereq:"—",                                        desc:"Você recebe proficiência com armas táticas de ataque corpo a corpo e de disparo (exceto de fogo) e +2 em rolagens de dano com essas armas."},
    {nome:"Pensamento Ágil",         prereq:"—",                                        desc:"Uma vez por rodada, durante uma cena de investigação, você pode gastar 2 PE para fazer uma ação de procurar pistas adicional."},
    {nome:"Perito em Explosivos",    prereq:"—",                                        desc:"Você soma seu Intelecto na DT para resistir aos seus explosivos e pode excluir dos efeitos da explosão um número de alvos igual ao seu valor de Intelecto."},
    {nome:"Primeira Impressão",      prereq:"—",                                        desc:"Você recebe +10 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena."},
    {nome:"Acolher o Terror",        prereq:"—",                                        desc:"Você pode se entregar para o medo uma vez por sessão de jogo adicional."},
    {nome:"Contatos Oportunos",      prereq:"Treinado em Crime",                        desc:"Você pode usar uma ação de interlúdio para acionar seus contatos locais e receber um aliado de um tipo à sua escolha, que lhe acompanha até o fim da missão ou até ser dispensado. Só pode ter um aliado desse tipo por vez."},
    {nome:"Disfarce Sutil",          prereq:"Pre 2, Treinado em Enganação",             desc:"Quando faz um disfarce em si mesmo usando Enganação, você pode gastar 1 PE para se disfarçar como uma ação completa sem necessidade de kit de disfarces (com kit, recebe +5 no teste)."},
    {nome:"Esconderijo Desesperado", prereq:"—",                                        desc:"Você não sofre –5 em testes de Furtividade por se mover ao seu deslocamento normal. Em cenas de furtividade, sempre que passa em um teste para esconder-se, sua visibilidade diminui em –2 (em vez de –1)."},
    {nome:"Especialista Diletante",  prereq:"NEX 30%",                                  desc:"Você aprende um poder que não pertença à sua classe (exceto poderes de trilha ou paranormais), à sua escolha, cujos pré-requisitos você possa cumprir."},
    {nome:"Flashback",               prereq:"—",                                        desc:"Escolha uma origem que não seja a sua. Você recebe o poder dessa origem."},
    {nome:"Leitura Fria",            prereq:"Treinado em Intuição",                     desc:"Uma vez por interlúdio, você pode fazer até 3 perguntas pessoais sobre um NPC. Para cada pergunta que o mestre se negar a responder, você recebe 2 PE temporários que duram até o fim da missão."},
    {nome:"Mãos Firmes",             prereq:"Treinado em Furtividade",                  desc:"Quando faz um teste de Furtividade para esconder-se ou executar uma ação discreta que envolva manipular um objeto, você pode gastar 2 PE para receber +5 nesse teste."},
    {nome:"Plano de Fuga",           prereq:"—",                                        desc:"Você pode usar Intelecto no lugar de Força para a ação criar obstáculos em uma perseguição. Além disso, uma vez por cena, pode gastar 2 PE para dispensar o teste e ser bem-sucedido nessa ação."},
    {nome:"Remoer Memórias",         prereq:"Int 1",                                    desc:"Uma vez por cena, quando faz um teste de perícia baseada em Intelecto ou Presença, você pode gastar 2 PE para substituir esse teste por um teste de Intelecto com DT 15."},
    {nome:"Resistir à Pressão",      prereq:"Treinado em Investigação",                 desc:"Uma vez por cena de investigação, você pode gastar 5 PE para coordenar os esforços dos companheiros. A urgência aumenta em 1 rodada, e durante essa rodada adicional todos recebem +2 em testes de perícia."},
  ],
  Ocultista: [
    {nome:"Camuflar Ocultismo",      prereq:"—",                                        desc:"Você pode gastar uma ação livre para esconder símbolos e sigilos que estejam desenhados em objetos ou em sua pele. Além disso, ao lançar um ritual, pode gastar +2 PE para lançá-lo sem componentes e sem gesticular. Outros só percebem com Ocultismo (DT 25)."},
    {nome:"Criar Selo",              prereq:"—",                                        desc:"Você sabe fabricar selos paranormais de rituais que conhece. Fabricar um selo gasta uma ação de interlúdio e PE iguais ao custo de conjurar o ritual. Máximo de selos ativos igual à sua Presença."},
    {nome:"Envolto em Mistério",     prereq:"—",                                        desc:"Você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Ocultismo."},
    {nome:"Especialista em Elemento",prereq:"—",                                        desc:"Escolha um elemento. A DT para resistir aos seus rituais desse elemento aumenta em +2."},
    {nome:"Guiado pelo Paranormal",  prereq:"—",                                        desc:"Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional."},
    {nome:"Identificação Paranormal",prereq:"—",                                        desc:"Você recebe +10 em testes de Ocultismo para identificar criaturas, objetos ou rituais."},
    {nome:"Improvisar Componentes",  prereq:"—",                                        desc:"Uma vez por cena, você pode gastar uma ação completa para fazer um teste de Investigação (DT 15). Se passar, encontra objetos que servem como componentes ritualísticos de um elemento à sua escolha."},
    {nome:"Intuição Paranormal",     prereq:"—",                                        desc:"Sempre que usa a ação facilitar investigação, você soma seu Intelecto ou Presença no teste (à sua escolha)."},
    {nome:"Mestre em Elemento",      prereq:"Especialista no Elemento escolhido, NEX 45%", desc:"Escolha um elemento. O custo para lançar rituais desse elemento diminui em –1 PE."},
    {nome:"Ritual Potente",          prereq:"Int 2",                                    desc:"Você soma seu Intelecto nas rolagens de dano ou nos efeitos de cura de seus rituais."},
    {nome:"Ritual Predileto",        prereq:"—",                                        desc:"Escolha um ritual que você conhece. Você reduz em –1 PE o custo do ritual. Essa redução se acumula com reduções de outras fontes."},
    {nome:"Tatuagem Ritualística",   prereq:"—",                                        desc:"Símbolos marcados em sua pele reduzem em –1 PE o custo de rituais de alcance pessoal que têm você como alvo."},
    {nome:"Deixe os Sussurros Guiarem",prereq:"—",                                      desc:"Uma vez por cena, você pode gastar 2 PE e uma rodada para receber +2 em testes de perícia para investigação até o fim da cena. Enquanto ativo, sempre que falha em um teste de perícia, perde 1 ponto de Sanidade."},
    {nome:"Domínio Esotérico",       prereq:"Int 3",                                    desc:"Ao lançar um ritual, você pode combinar os efeitos de até dois catalisadores ritualísticos diferentes ao mesmo tempo."},
    {nome:"Estalos Macabros",        prereq:"—",                                        desc:"Quando faz uma ação para atrapalhar a atenção de outro ser (distrair em furtividade ou fintar em combate), você pode gastar 1 PE para usar Ocultismo em vez da perícia original. Contra pessoas ou animais, recebe +5 no teste."},
    {nome:"Minha Dor me Impulsiona", prereq:"Vig 2",                                    desc:"Quando faz um teste de Acrobacia, Atletismo ou Furtividade, você pode gastar 1 PE para receber +1d6 no teste. Só pode usar este poder se estiver com pelo menos 5 pontos de dano nos PV."},
    {nome:"Nos Olhos do Monstro",    prereq:"—",                                        desc:"Se estiver em uma cena com uma criatura paranormal, pode gastar uma rodada e 3 PE para encará-la. Se fizer isso, recebe +5 em testes contra a criatura (exceto testes de ataque) até o fim da cena."},
    {nome:"Olhar Sinistro",          prereq:"Pre 1",                                    desc:"Você pode usar Presença no lugar de Intelecto para Ocultismo e pode usar esta perícia para coagir (como Intimidação)."},
    {nome:"Sentido Premonitório",    prereq:"—",                                        desc:"Você pode gastar 3 PE para ativar um sentido premonitório. Enquanto ativo, você tem um déjà vu do futuro próximo (equivalente a uma rodada), permitindo saber com antecedência eventos de investigação, ações de inimigos em furtividade/perseguição, etc. Manter ativo custa 1 PE por rodada. Não funciona em combate."},
    {nome:"Sincronia Paranormal",    prereq:"Pre 2",                                    desc:"Você pode gastar uma ação padrão e 2 PE para estabelecer sincronia mental com aliados (em alcance médio) com quem já sobreviveu a um encontro paranormal. No início de cada rodada, distribua dados de bônus iguais à sua Presença entre os participantes para testes de perícias de Int ou Pre. Manter custa 1 PE por rodada."},
    {nome:"Traçado Conjuratório",    prereq:"—",                                        desc:"Você pode gastar 1 PE e uma ação completa para traçar um símbolo paranormal em um quadrado de 1,5m. Dentro dele, você recebe +2 em testes de Ocultismo e de resistência, e a DT para resistir aos seus rituais aumenta em +2. O símbolo dura até o fim da cena."},
  ],
};

// ─── ORIGENS ──────────────────────────────────────────────────────────────────
const ORIGENS = [
  {nome:"Acadêmico",              pericias:["Ciências","Investigação"],            habilidade:"Saber é Poder"},
  {nome:"Agente de Saúde",        pericias:["Intuição","Medicina"],                habilidade:"Técnica Medicinal"},
  {nome:"Amigo dos Animais",      pericias:["Adestramento","Percepção"],           habilidade:"Companheiro Animal"},
  {nome:"Amnésico",               pericias:["Duas à escolha do mestre"],           habilidade:"Vislumbres do Passado"},
  {nome:"Artista",                pericias:["Artes","Enganação"],                  habilidade:"Magnum Opus"},
  {nome:"Astronauta",             pericias:["Ciências","Fortitude"],               habilidade:"Acostumado ao Extremo"},
  {nome:"Atleta",                 pericias:["Acrobacia","Atletismo"],              habilidade:"110%"},
  {nome:"Chef",                   pericias:["Fortitude","Profissão (cozinheiro)"], habilidade:"Ingrediente Secreto"},
  {nome:"Chef do Outro Lado",     pericias:["Ocultismo","Profissão (cozinheiro)"], habilidade:"Fome do Outro Lado"},
  {nome:"Colegial",               pericias:["Atualidades","Tecnologia"],           habilidade:"Poder da Amizade"},
  {nome:"Cosplayer",              pericias:["Artes","Vontade"],                    habilidade:"Não é fantasia, é cosplay!"},
  {nome:"Criminoso",              pericias:["Crime","Furtividade"],                habilidade:"O Crime Compensa"},
  {nome:"Cultista Arrependido",   pericias:["Ocultismo","Religião"],               habilidade:"Traços do Outro Lado"},
  {nome:"Desgarrado",             pericias:["Fortitude","Sobrevivência"],          habilidade:"Calejado"},
  {nome:"Diplomata",              pericias:["Atualidades","Diplomacia"],           habilidade:"Conexões"},
  {nome:"Engenheiro",             pericias:["Profissão","Tecnologia"],             habilidade:"Ferramenta Favorita"},
  {nome:"Executivo",              pericias:["Diplomacia","Profissão"],             habilidade:"Processo Otimizado"},
  {nome:"Experimento",            pericias:["Atletismo","Fortitude"],              habilidade:"Mutação"},
  {nome:"Explorador",             pericias:["Fortitude","Sobrevivência"],          habilidade:"Manual do Sobrevivente"},
  {nome:"Fanático por Criaturas", pericias:["Investigação","Ocultismo"],           habilidade:"Conhecimento Oculto"},
  {nome:"Fotógrafo",              pericias:["Artes","Percepção"],                  habilidade:"Através da Lente"},
  {nome:"Inventor Paranormal",    pericias:["Profissão (engenheiro)","Vontade"],   habilidade:"Invenção Paranormal"},
  {nome:"Investigador",           pericias:["Investigação","Percepção"],           habilidade:"Faro para Pistas"},
  {nome:"Jovem Místico",          pericias:["Ocultismo","Religião"],               habilidade:"A Culpa é das Estrelas"},
  {nome:"Legista do Turno da Noite",pericias:["Ciências","Medicina"],             habilidade:"Luto Habitual"},
  {nome:"Lutador",                pericias:["Luta","Reflexos"],                    habilidade:"Mão Pesada"},
  {nome:"Magnata",                pericias:["Diplomacia","Pilotagem"],             habilidade:"Patrocinador da Ordem"},
  {nome:"Mateiro",                pericias:["Percepção","Sobrevivência"],          habilidade:"Mapa Celeste"},
  {nome:"Mercenário",             pericias:["Iniciativa","Intimidação"],           habilidade:"Posição de Combate"},
  {nome:"Mergulhador",            pericias:["Atletismo","Fortitude"],              habilidade:"Fôlego de Nadador"},
  {nome:"Militar",                pericias:["Pontaria","Tática"],                  habilidade:"Para Bellum"},
  {nome:"Motorista",              pericias:["Pilotagem","Reflexos"],               habilidade:"Mãos no Volante"},
  {nome:"Nerd Entusiasta",        pericias:["Ciências","Tecnologia"],              habilidade:"O Inteligentão"},
  {nome:"Operário",               pericias:["Fortitude","Profissão"],              habilidade:"Ferramenta de Trabalho"},
  {nome:"Policial",               pericias:["Percepção","Pontaria"],               habilidade:"Patrulha"},
  {nome:"Profetizado",            pericias:["Vontade","+1 à escolha"],             habilidade:"Luta ou Fuga"},
  {nome:"Psicólogo",              pericias:["Intuição","Profissão (psicólogo)"],   habilidade:"Terapia"},
  {nome:"Religioso",              pericias:["Religião","Vontade"],                 habilidade:"Acalentar"},
  {nome:"Repórter Investigativo", pericias:["Atualidades","Investigação"],         habilidade:"Encontrar a Verdade"},
  {nome:"Servidor Público",       pericias:["Intuição","Vontade"],                 habilidade:"Espírito Cívico"},
  {nome:"T.I.",                   pericias:["Investigação","Tecnologia"],          habilidade:"Motor de Busca"},
  {nome:"Teórico da Conspiração", pericias:["Investigação","Ocultismo"],           habilidade:"Eu Já Sabia"},
  {nome:"Trabalhador Rural",      pericias:["Adestramento","Sobrevivência"],       habilidade:"Desbravador"},
  {nome:"Trambiqueiro",           pericias:["Crime","Enganação"],                  habilidade:"Impostor"},
  {nome:"Universitário",          pericias:["Atualidades","Investigação"],         habilidade:"Dedicação"},
  {nome:"Vítima",                 pericias:["Reflexos","Vontade"],                 habilidade:"Cicatrizes Psicológicas"},
];

const CLASSES = {
  Combatente: {
    desc:"Treinado para lutar com todo tipo de armas e encarar os perigos de frente. Prefere abordagens diretas.",
    pv_base:20,pv_nex:4,pe_base:2,pe_nex:2,san_base:12,san_nex:3,
    pericias_fixas:["Luta ou Pontaria","Fortitude ou Reflexos"],
    pericias_livre_formula:"1 + Intelecto",pericias_livre:(INT)=>1+INT,
    pericias_classe:["Atletismo","Fortitude","Intimidação","Luta","Pontaria","Reflexos","Tática"],
  },
  Especialista: {
    desc:"Confia em esperteza, conhecimento técnico ou lábia para resolver mistérios e enfrentar o paranormal.",
    pv_base:16,pv_nex:3,pe_base:3,pe_nex:3,san_base:16,san_nex:4,
    pericias_fixas:[],
    pericias_livre_formula:"7 + Intelecto",pericias_livre:(INT)=>7+INT,
    pericias_classe:["Acrobacia","Crime","Diplomacia","Enganação","Furtividade","Pilotagem","Tecnologia"],
  },
  Ocultista: {
    desc:"Possui talento para se conectar com o paranormal. Domina os mistérios do Outro Lado para combatê-los.",
    pv_base:12,pv_nex:2,pe_base:4,pe_nex:4,san_base:20,san_nex:5,
    pericias_fixas:["Ocultismo","Vontade"],
    pericias_livre_formula:"3 + Intelecto",pericias_livre:(INT)=>3+INT,
    pericias_classe:["Ciências","Investigação","Medicina","Ocultismo","Religião","Vontade"],
  },
};

const PATENTES=["Recruta","Operador","Agente Especial","Oficial de Operações","Agente de Elite"];

const PERICIAS=[
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

const GRAUS=["Destreinado","Treinado","Veterano","Expert"];
const GRAU_BONUS={Destreinado:0,Treinado:5,Veterano:10,Expert:15};
const GRAU_SH={Destreinado:"—",Treinado:"T",Veterano:"V",Expert:"E"};
const GRAU_COR={Destreinado:C.gray4,Treinado:C.blue,Veterano:C.gold,Expert:C.lime};
const attrNames={FOR:"Força",AGI:"Agilidade",VIG:"Vigor",PRE:"Presença",INT:"Intelecto"};
const attrCors={FOR:C.red,AGI:C.blue,VIG:C.green,PRE:C.gold,INT:C.purple};

// ─── CÁLCULOS ─────────────────────────────────────────────────────────────────
const calcPV =(cls,attrs,nex)=>{const c=CLASSES[cls];if(!c)return 0;return c.pv_base+(attrs.VIG||0)+c.pv_nex*Math.floor(nex/5);};
const calcPE =(cls,attrs,nex)=>{const c=CLASSES[cls];if(!c)return 0;return c.pe_base+(attrs.PRE||0)+c.pe_nex*Math.floor(nex/5);};
const calcSAN=(cls,nex)=>{const c=CLASSES[cls];if(!c)return 0;return c.san_base+c.san_nex*Math.floor(nex/5);};
const calcDEF=(attrs,f)=>{
  const base=10+(attrs.AGI||0);
  const manB=(f.bonus_defesa||[]).filter(b=>b.ativo).reduce((a,b)=>a+(Number(b.valor)||0),0);
  const trB=(f.transformacao?.ativa&&f.transformacao?.bonus_defesa)?Number(f.transformacao.bonus_defesa)||0:0;
  return base+manB+trB;
};
const calcBonusP=(f,nome)=>{
  const grauB=GRAU_BONUS[f.pericias[nome]||"Destreinado"];
  const manB=f.bonus_pericia?.[nome]||0;
  const extB=(f.bonus_extras||[]).filter(b=>b.ativo&&(b.alvo==="Todas"||b.alvo===nome)).reduce((a,b)=>a+(Number(b.valor)||0),0);
  const trB=(f.transformacao?.ativa&&f.transformacao?.bonus_pericias?.[nome])?Number(f.transformacao.bonus_pericias[nome])||0:0;
  return grauB+manB+extB+trB;
};

const rolarDado=l=>Math.floor(Math.random()*l)+1;
const parseDice=formula=>{
  const rx=/(\d*)d(\d+)([+-]\d+)?/gi;let total=0,rolls=[],m;
  while((m=rx.exec(formula))!==null){
    const q=parseInt(m[1]||"1"),l=parseInt(m[2]),mod=parseInt(m[3]||"0");
    for(let i=0;i<q;i++){const r=rolarDado(l);rolls.push(`d${l}:${r}`);total+=r;}total+=mod;
  }
  if(!rolls.length)return{total:0,rolls:["inválido"]};
  return{total,rolls};
};

// ─── FICHA BLANK ──────────────────────────────────────────────────────────────
const fichaBlank=()=>({
  id:Date.now(),criacao_step:1,
  nome:"",jogador:"",patente:"Recruta",nivel:1,nex:0,prestigio:0,limite_credito:"Baixo",idade:"",genero:"",
  aparencia:"",historia:"",motivacao:"",
  foto:null, // base64
  atributos:{FOR:1,AGI:1,VIG:1,PRE:1,INT:1},
  origem:"",classe:"",
  pericias:Object.fromEntries(PERICIAS.map(p=>[p.nome,"Destreinado"])),
  bonus_pericia:Object.fromEntries(PERICIAS.map(p=>[p.nome,0])),
  bonus_extras:[],
  pv_atual:0,pe_atual:0,san_atual:0,
  habilidades:[],habilidades_classe:[],
  rituais:[],inventario:[],notas:"",dinheiro:500,
  status:{Sangrando:false,Abalado:false,Vulnerável:false,Enfraquecido:false,"Em Surto":false,Catatônico:false},
  condicoes:"",
  transformacao:null,
  bonus_defesa:[],
});

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tela,setTela]=useState("biblioteca");
  const [agentes,setAgentes]=useState(()=>loadAgentes());
  const [fichaAtiva,setFichaAtiva]=useState(null);
  const [arsenal,setArsenal]=useState(()=>loadArsenal());
  const [deletandoId,setDeletandoId]=useState(null);
  const [confirmaTexto,setConfirmaTexto]=useState("");

  useEffect(()=>{saveAgentes(agentes);},[agentes]);
  useEffect(()=>{saveArsenal(arsenal);},[arsenal]);

  const novoAgente=()=>{const f=fichaBlank();setFichaAtiva(f);setTela("ficha");};
  const abrirAgente=(id)=>{const f=agentes.find(a=>a.id===id);if(f){setFichaAtiva({...f});setTela("ficha");}};
  const salvarAgente=(ficha)=>{
    setAgentes(prev=>{const idx=prev.findIndex(a=>a.id===ficha.id);return idx>=0?prev.map((a,i)=>i===idx?ficha:a):[...prev,ficha];});
    setFichaAtiva(null);setTela("biblioteca");
  };
  const iniciarDeletar=(id)=>{setDeletandoId(id);setConfirmaTexto("");};
  const cancelarDeletar=()=>{setDeletandoId(null);setConfirmaTexto("");};
  const confirmarDeletar=()=>{
    if(confirmaTexto.trim().toUpperCase()==="REMOVER"){setAgentes(prev=>prev.filter(a=>a.id!==deletandoId));cancelarDeletar();}
  };

  if(tela==="ficha"&&fichaAtiva) return <FichaView ficha={fichaAtiva} onSave={salvarAgente} onBack={()=>setTela("biblioteca")} arsenal={arsenal} setArsenal={setArsenal}/>;
  if(tela==="arsenal") return <ArsenalView arsenal={arsenal} setArsenal={setArsenal} onBack={()=>setTela("biblioteca")}/>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.gray1,fontFamily:"'Courier New',monospace",fontSize:13}}>
      {deletandoId&&(
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.red}`,borderRadius:4,padding:28,width:380,maxWidth:"92vw"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.red,marginBottom:10}}>⚠ OPERAÇÃO IRREVERSÍVEL</div>
            <div style={{fontSize:13,color:C.white,marginBottom:4}}><strong style={{color:C.red}}>{agentes.find(a=>a.id===deletandoId)?.nome||"Agente"}</strong> será removido permanentemente.</div>
            <div style={{fontSize:11,color:C.gray3,marginBottom:14,lineHeight:1.7}}>Para confirmar, digite <strong style={{color:C.white,letterSpacing:2}}>REMOVER</strong> abaixo:</div>
            <input autoFocus value={confirmaTexto} onChange={e=>setConfirmaTexto(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")confirmarDeletar();if(e.key==="Escape")cancelarDeletar();}}
              placeholder="Digite REMOVER"
              style={{width:"100%",padding:"9px 12px",background:C.bg,border:`1px solid ${confirmaTexto.toUpperCase()==="REMOVER"?C.red:C.border2}`,color:C.white,borderRadius:2,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",letterSpacing:2,marginBottom:14}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={cancelarDeletar} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>CANCELAR</button>
              <button disabled={confirmaTexto.trim().toUpperCase()!=="REMOVER"} onClick={confirmarDeletar}
                style={{flex:1,padding:"8px 0",background:confirmaTexto.trim().toUpperCase()==="REMOVER"?"rgba(224,80,80,0.15)":"transparent",border:`1px solid ${confirmaTexto.trim().toUpperCase()==="REMOVER"?C.red:C.gray4}`,color:confirmaTexto.trim().toUpperCase()==="REMOVER"?C.red:C.gray4,cursor:confirmaTexto.trim().toUpperCase()==="REMOVER"?"pointer":"not-allowed",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700}}>CONFIRMAR</button>
            </div>
          </div>
        </div>
      )}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,letterSpacing:5,color:C.lime}}>⬡ ORDEM PARANORMAL</div>
          <div style={{fontSize:9,color:C.gray3,letterSpacing:4,marginTop:2}}>BIBLIOTECA DE AGENTES</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setTela("arsenal")} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.gold}`,color:C.gold,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2}}>◈ ARMAZÉM</button>
          <button onClick={novoAgente} style={btnLime}>+ NOVO AGENTE</button>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px"}}>
        {agentes.length===0&&(
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:40,marginBottom:16,opacity:0.15}}>◈</div>
            <div style={{fontSize:13,color:C.gray3,letterSpacing:2,marginBottom:8}}>NENHUM AGENTE REGISTRADO</div>
            <div style={{fontSize:11,color:C.gray4,marginBottom:24}}>Crie seu primeiro agente para começar.</div>
            <button onClick={novoAgente} style={btnLime}>+ CRIAR PRIMEIRO AGENTE</button>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(270px,1fr))",gap:12}}>
          {agentes.map(a=>{
            const pvMax=calcPV(a.classe,a.atributos,a.nex);
            const pct=pvMax>0?Math.min(100,(a.pv_atual/pvMax)*100):0;
            const transAtiva=a.transformacao?.ativa;
            const clsCor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[a.classe]||C.lime;
            return (
              <div key={a.id} style={{background:C.surface2,border:`1px solid ${transAtiva?C.lime:C.border}`,borderRadius:3,overflow:"hidden",cursor:"pointer",transition:"all 0.15s"}}
                onClick={()=>abrirAgente(a.id)}>
                {/* Foto / Header */}
                <div style={{height:90,background:a.foto?`url(${a.foto}) center/cover`:`linear-gradient(135deg,${C.surface3} 0%,${C.bg} 100%)`,display:"flex",alignItems:"flex-end",padding:"8px 12px",position:"relative"}}>
                  {a.foto&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)"}}/>}
                  <div style={{position:"relative",flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.white,textShadow:"0 1px 4px #000"}}>{a.nome||"Sem nome"}</div>
                    <div style={{fontSize:8,color:clsCor,letterSpacing:2}}>{a.classe||"—"} · {a.patente}</div>
                    {(a.prestigio||0)>0&&<div style={{fontSize:8,color:C.purple,letterSpacing:1}}>{a.prestigio} ★ prestígio</div>}
                  </div>
                  <button onClick={e=>{e.stopPropagation();iniciarDeletar(a.id);}} style={{position:"relative",padding:"3px 7px",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(224,80,80,0.4)`,color:C.red,cursor:"pointer",borderRadius:2,fontSize:10}}>✕</button>
                </div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.gray3,marginBottom:2}}>
                    <span>NEX {a.nex}% · Nv.{a.nivel}</span>
                    {transAtiva&&<span style={{color:C.lime,letterSpacing:1}}>◬ TRANSF.</span>}
                  </div>
                  {a.origem&&<div style={{fontSize:9,color:C.gray4,marginBottom:6}}>{a.origem}</div>}
                  {a.classe&&(
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.gray3,marginBottom:3}}>
                        <span>PV {a.pv_atual}/{pvMax}</span><span>SAN {a.san_atual}/{calcSAN(a.classe,a.nex)}</span>
                      </div>
                      <div style={{height:2,background:C.border,borderRadius:1,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:C.red}}/>
                      </div>
                    </div>
                  )}
                  {a.criacao_step<4&&<div style={{marginTop:6,fontSize:8,color:C.gold,letterSpacing:1}}>⚠ CRIAÇÃO INCOMPLETA</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ARMAZÉM ──────────────────────────────────────────────────────────────────
function ArsenalView({arsenal,setArsenal,onBack}) {
  const [aba,setAba]=useState("habilidades");
  const [novaHab,setNovaHab]=useState({nome:"",classe:"Combatente",desc:""});
  const [novoRitual,setNovoRitual]=useState({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});
  const [log,setLog]=useState([]);
  const [diceFormula,setDiceFormula]=useState("");

  const rolar=(formula,rotulo)=>{
    const {total,rolls}=parseDice(formula||"1d20");
    setLog(l=>[{rotulo:rotulo||formula,total,rolls,ts:new Date().toLocaleTimeString()},...l].slice(0,40));
  };

  const addHab=()=>{if(!novaHab.nome.trim())return;setArsenal(a=>({...a,habilidades:[...a.habilidades,{...novaHab,id:Date.now()}]}));setNovaHab({nome:"",classe:"Combatente",desc:""});};
  const rmHab=id=>setArsenal(a=>({...a,habilidades:a.habilidades.filter(h=>h.id!==id)}));
  const addRitual=()=>{if(!novoRitual.nome.trim())return;setArsenal(a=>({...a,rituais:[...a.rituais,{...novoRitual,id:Date.now()}]}));setNovoRitual({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});};
  const rmRitual=id=>setArsenal(a=>({...a,rituais:a.rituais.filter(r=>r.id!==id)}));

  const classCor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple,Geral:C.lime};

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.gray1,fontFamily:"'Courier New',monospace",fontSize:13}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← BIBLIOTECA</button>
          <div>
            <div style={{fontSize:14,fontWeight:700,letterSpacing:4,color:C.gold}}>◈ ARMAZÉM PESSOAL</div>
            <div style={{fontSize:9,color:C.gray3,letterSpacing:3,marginTop:1}}>HABILIDADES & RITUAIS GLOBAIS</div>
          </div>
        </div>
      </div>

      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",maxWidth:900,margin:"0 auto",padding:"0 8px"}}>
          {[{id:"habilidades",label:"Habilidades",icon:"◉"},{id:"rituais",label:"Rituais",icon:"◌"},{id:"biblioteca_classe",label:"Habilidades de Classe",icon:"◆"}].map(a=>(
            <button key={a.id} onClick={()=>setAba(a.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 14px",background:"transparent",border:"none",borderBottom:`2px solid ${aba===a.id?C.gold:"transparent"}`,color:aba===a.id?C.gold:C.gray4,cursor:"pointer",fontSize:12,fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <span>{a.icon}</span><span style={{fontSize:7,letterSpacing:1}}>{a.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>

        {aba==="habilidades"&&(
          <div>
            <FormBx>
              <div style={{fontSize:8,color:C.gold,letterSpacing:3,marginBottom:10}}>NOVA HABILIDADE</div>
              <G2><Inp label="Nome" v={novaHab.nome} s={v=>setNovaHab(h=>({...h,nome:v}))} ph="Nome da habilidade"/>
                <Slc label="Classe / Tipo" v={novaHab.classe} s={v=>setNovaHab(h=>({...h,classe:v}))} opts={["Combatente","Especialista","Ocultista","Geral"]}/>
              </G2>
              <div style={{marginTop:10}}><TxtA label="Descrição" v={novaHab.desc} s={v=>setNovaHab(h=>({...h,desc:v}))} rows={3}/></div>
              <Btn onClick={addHab} col={C.gold}>+ ADICIONAR</Btn>
            </FormBx>
            {arsenal.habilidades.length===0&&<Empty>Nenhuma habilidade no armazém.</Empty>}
            {["Combatente","Especialista","Ocultista","Geral"].map(cls=>{
              const habs=arsenal.habilidades.filter(h=>h.classe===cls);
              if(!habs.length)return null;
              return (
                <div key={cls} style={{marginBottom:16}}>
                  <div style={{fontSize:9,letterSpacing:3,color:classCor[cls],marginBottom:8,borderBottom:`1px solid ${C.border}`,paddingBottom:6}}>{cls.toUpperCase()}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {habs.map(h=>(
                      <div key={h.id} style={{padding:"10px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${classCor[cls]}`,borderRadius:2}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <div style={{fontSize:13,color:C.white,fontWeight:700}}>{h.nome}</div>
                          <button onClick={()=>rmHab(h.id)} style={btnRm}>✕</button>
                        </div>
                        {h.desc&&<div style={{fontSize:11,color:C.gray2,lineHeight:1.7,marginTop:4}}>{h.desc}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {aba==="rituais"&&(
          <div>
            <FormBx>
              <div style={{fontSize:8,color:C.gold,letterSpacing:3,marginBottom:10}}>NOVO RITUAL</div>
              <G2><Inp label="Nome" v={novoRitual.nome} s={v=>setNovoRitual(r=>({...r,nome:v}))}/>
                <Slc label="Elemento" v={novoRitual.elemento} s={v=>setNovoRitual(r=>({...r,elemento:v}))} opts={["Morte","Energia","Medo","Conhecimento","Sangue"]}/>
              </G2>
              <G2 mt><Slc label="Círculo" v={String(novoRitual.circulo)} s={v=>setNovoRitual(r=>({...r,circulo:Number(v)}))} opts={["1","2","3"]}/>
                <Inp label="Execução" v={novoRitual.execucao} s={v=>setNovoRitual(r=>({...r,execucao:v}))} ph="Padrão, Livre..."/>
              </G2>
              <G2 mt><Inp label="Alcance" v={novoRitual.alcance} s={v=>setNovoRitual(r=>({...r,alcance:v}))} ph="9m, Toque..."/>
                <Inp label="Área" v={novoRitual.area} s={v=>setNovoRitual(r=>({...r,area:v}))} ph="Cubo 3m..."/>
              </G2>
              <G2 mt><Inp label="Alvo" v={novoRitual.alvo} s={v=>setNovoRitual(r=>({...r,alvo:v}))} ph="1 criatura..."/>
                <Inp label="Duração" v={novoRitual.duracao} s={v=>setNovoRitual(r=>({...r,duracao:v}))} ph="Instantâneo..."/>
              </G2>
              <G2 mt><Inp label="Resistência" v={novoRitual.resistencia} s={v=>setNovoRitual(r=>({...r,resistencia:v}))} ph="Fortitude..."/>
                <Inp label="Dados Base" v={novoRitual.dados} s={v=>setNovoRitual(r=>({...r,dados:v}))} ph="2d6..."/>
              </G2>
              <G2 mt><Inp label="Dados Discente" v={novoRitual.dados_discente} s={v=>setNovoRitual(r=>({...r,dados_discente:v}))} ph="Discente..."/>
                <Inp label="Dados Verdadeiro" v={novoRitual.dados_verdadeiro} s={v=>setNovoRitual(r=>({...r,dados_verdadeiro:v}))} ph="Verdadeiro..."/>
              </G2>
              <div style={{marginTop:10}}><TxtA label="Efeito" v={novoRitual.efeito} s={v=>setNovoRitual(r=>({...r,efeito:v}))} rows={3}/></div>
              <Btn onClick={addRitual} col={C.gold}>+ ADICIONAR RITUAL</Btn>
            </FormBx>
            {arsenal.rituais.length===0&&<Empty>Nenhum ritual no armazém.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {arsenal.rituais.map(r=>{
                const ec=ELEMENTO_COR[r.elemento]||{border:C.gray3,bg:"transparent",text:C.gray3};
                return (
                  <div key={r.id} style={{padding:"12px 14px",background:ec.bg,border:`1px solid ${ec.border}`,borderLeft:`3px solid ${ec.border}`,borderRadius:3}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:13,fontWeight:700,color:C.white}}>{r.nome}</div><div style={{fontSize:8,color:ec.text,letterSpacing:2}}>CÍRCULO {r.circulo} · {r.elemento.toUpperCase()}</div></div>
                      <button onClick={()=>rmRitual(r.id)} style={btnRm}>✕</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px,1fr))",gap:4}}>
                      {[["Execução",r.execucao],["Alcance",r.alcance],["Área",r.area],["Alvo",r.alvo],["Duração",r.duracao],["Resistência",r.resistencia],["Dados",r.dados],["Discente",r.dados_discente],["Verdadeiro",r.dados_verdadeiro]].filter(([,v])=>v).map(([l,v])=>(
                        <div key={l} style={{padding:"4px 7px",background:"rgba(0,0,0,0.4)",borderRadius:2}}><div style={{fontSize:7,color:C.gray4}}>{l.toUpperCase()}</div><div style={{fontSize:10,color:C.gray1}}>{v}</div></div>
                      ))}
                    </div>
                    {r.efeito&&<div style={{marginTop:7,padding:"7px 9px",background:"rgba(0,0,0,0.4)",borderRadius:2}}><div style={{fontSize:10,color:C.gray2,lineHeight:1.7}}>{r.efeito}</div></div>}
                    {r.dados&&<div style={{marginTop:6}}><button onClick={()=>rolar(r.dados,`${r.nome}`)} style={{padding:"4px 10px",background:ec.bg,border:`1px solid ${ec.border}`,color:ec.text,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>⬡ ROLAR {r.dados}</button></div>}
                  </div>
                );
              })}
            </div>
            {/* mini log */}
            {log.length>0&&<div style={{marginTop:16,padding:10,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:2}}>{log.slice(0,5).map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray3,padding:"2px 0"}}><span>{l.rotulo}</span><span style={{color:C.white,fontWeight:700}}>{l.total}</span></div>)}</div>}
          </div>
        )}

        {aba==="biblioteca_classe"&&(
          <div>
            <div style={{fontSize:10,color:C.gray4,marginBottom:16,lineHeight:1.8}}>
              Todas as habilidades de classe disponíveis no sistema. Consulte aqui durante a criação do personagem para decidir quais adquirir, e registre as adquiridas na aba de Habilidades de cada agente.
            </div>
            {Object.entries(HAB_CLASSE).map(([cls,habs])=>{
              const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[cls];
              return (
                <div key={cls} style={{marginBottom:24}}>
                  <div style={{fontSize:10,letterSpacing:4,color:cor,fontWeight:700,marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>{cls.toUpperCase()} — {habs.length} HABILIDADES</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))",gap:8}}>
                    {habs.map(h=>(
                      <div key={h.nome} style={{padding:"10px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${cor}`,borderRadius:2}}>
                        <div style={{fontSize:12,color:C.white,fontWeight:700,marginBottom:3}}>{h.nome}</div>
                        {h.prereq&&h.prereq!=="—"&&<div style={{fontSize:8,color:cor,letterSpacing:1,marginBottom:4}}>Pré-req: {h.prereq}</div>}
                        <div style={{fontSize:10,color:C.gray3,lineHeight:1.65}}>{h.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FICHA VIEW ───────────────────────────────────────────────────────────────
function FichaView({ficha:fichaInit,onSave,onBack,arsenal,setArsenal}) {
  const [ficha,setFicha]=useState(fichaInit);
  const [aba,setAba]=useState(fichaInit.criacao_step<4?"criar":"identidade");
  const [log,setLog]=useState([]);
  const [diceFormula,setDiceFormula]=useState("");
  const [showRoller,setShowRoller]=useState(false);
  const [showTransformModal,setShowTransformModal]=useState(false);
  const [transForm,setTransForm]=useState({nome:"",pv_temp:0,pe_temp:0,bonus_defesa:0,bonus_pericias:{}});
  const [penForm,setPenForm]=useState({pv_pen:0,pe_pen:0,san_pen:0});
  const [fotoInput]=useState(()=>document.createElement("input"));
  const [fotoExpanded,setFotoExpanded]=useState(false);

  const [novoItem,setNovoItem]=useState({nome:"",tipo:"Arma",qtd:1,peso:"1",desc:""});
  const [novoRitual,setNovoRitual]=useState({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});
  const [novoBonus,setNovoBonus]=useState({nome:"",alvo:"Todas",valor:0,ativo:true,desc:""});
  const [novaHab,setNovaHab]=useState({nome:"",desc:""});
  const [novoBonusDef,setNovoBonusDef]=useState({nome:"",valor:0,ativo:true});
  // filtro de habilidades de classe
  const [filtroHab,setFiltroHab]=useState("");
  // aba de habilidades de classe selecionada (dentro da ficha)
  const [abaCls,setAbaCls]=useState(fichaInit.classe||"Combatente");

  const upd=(k,v)=>setFicha(f=>({...f,[k]:v}));

  // FOTO
  const handleFoto=()=>{
    fotoInput.type="file"; fotoInput.accept="image/*";
    fotoInput.onchange=e=>{
      const file=e.target.files[0]; if(!file)return;
      const reader=new FileReader();
      reader.onload=ev=>upd("foto",ev.target.result);
      reader.readAsDataURL(file);
    };
    fotoInput.click();
  };

  // CRIAÇÃO
  const PONTOS_TOTAL=4;
  const pontosGastos=Object.values(ficha.atributos).reduce((a,v)=>a+(v-1),0);
  const pontosRestantes=PONTOS_TOTAL-pontosGastos;
  const setAttrCriacao=(attr,val)=>{
    if(val>3||val<0)return;
    const novos={...ficha.atributos,[attr]:val};
    if(Object.values(novos).reduce((a,v)=>a+(v-1),0)>PONTOS_TOTAL)return;
    setFicha(f=>({...f,atributos:novos}));
  };
  const confirmarOrigem=(nome)=>{
    const o=ORIGENS.find(o=>o.nome===nome); if(!o)return;
    const np={...ficha.pericias};
    o.pericias.forEach(pn=>{if(PERICIAS.find(p=>p.nome===pn)&&np[pn]==="Destreinado")np[pn]="Treinado";});
    setFicha(f=>({...f,origem:nome,pericias:np,criacao_step:3}));
  };
  const confirmarClasse=(nome)=>{
    const pvMax=calcPV(nome,ficha.atributos,0),peMax=calcPE(nome,ficha.atributos,0),sanMax=calcSAN(nome,0);
    setFicha(f=>({...f,classe:nome,criacao_step:4,pv_atual:pvMax,pe_atual:peMax,san_atual:sanMax}));
    setAbaCls(nome); setAba("identidade");
  };

  // RECURSOS
  const pvMax=calcPV(ficha.classe,ficha.atributos,ficha.nex);
  const peMax=calcPE(ficha.classe,ficha.atributos,ficha.nex);
  const sanMax=calcSAN(ficha.classe,ficha.nex);
  const defesa=calcDEF(ficha.atributos,ficha);
  const pvTemp=ficha.transformacao?.ativa?Number(ficha.transformacao.pv_temp)||0:0;
  const peTemp=ficha.transformacao?.ativa?Number(ficha.transformacao.pe_temp)||0:0;
  const pvTotal=pvMax+pvTemp, peTotal=peMax+peTemp;

  // TRANSFORMAÇÃO
  const ativarTransformacao=()=>{setFicha(f=>({...f,transformacao:{...transForm,ativa:true}}));setShowTransformModal(false);setTransForm({nome:"",pv_temp:0,pe_temp:0,bonus_defesa:0,bonus_pericias:{}});};
  const removerTransformacao=()=>{
    setFicha(f=>({...f,transformacao:null,pv_atual:Math.max(0,f.pv_atual-(Number(penForm.pv_pen)||0)),pe_atual:Math.max(0,f.pe_atual-(Number(penForm.pe_pen)||0)),san_atual:Math.max(0,f.san_atual-(Number(penForm.san_pen)||0))}));
    setShowTransformModal(false); setPenForm({pv_pen:0,pe_pen:0,san_pen:0});
  };

  const rolar=useCallback((formula,rotulo)=>{
    const {total,rolls}=parseDice(formula||"1d20");
    setLog(l=>[{rotulo:rotulo||formula,total,rolls,ts:new Date().toLocaleTimeString()},...l].slice(0,60));
    setShowRoller(true);
  },[]);

  // CRUD
  const addItem=()=>{if(!novoItem.nome.trim())return;setFicha(f=>({...f,inventario:[...f.inventario,{...novoItem,id:Date.now()}]}));setNovoItem({nome:"",tipo:"Arma",qtd:1,peso:"1",desc:""});};
  const rmItem=id=>setFicha(f=>({...f,inventario:f.inventario.filter(i=>i.id!==id)}));
  const addRitual=()=>{if(!novoRitual.nome.trim())return;setFicha(f=>({...f,rituais:[...f.rituais,{...novoRitual,id:Date.now()}]}));setNovoRitual({nome:"",elemento:"Morte",circulo:1,execucao:"",alcance:"",area:"",alvo:"",duracao:"",efeito:"",resistencia:"",dados:"",dados_discente:"",dados_verdadeiro:""});};
  const rmRitual=id=>setFicha(f=>({...f,rituais:f.rituais.filter(r=>r.id!==id)}));
  const addBonus=()=>{if(!novoBonus.nome.trim())return;setFicha(f=>({...f,bonus_extras:[...(f.bonus_extras||[]),{...novoBonus,id:Date.now()}]}));setNovoBonus({nome:"",alvo:"Todas",valor:0,ativo:true,desc:""});};
  const rmBonus=id=>setFicha(f=>({...f,bonus_extras:f.bonus_extras.filter(b=>b.id!==id)}));
  const togBonus=id=>setFicha(f=>({...f,bonus_extras:f.bonus_extras.map(b=>b.id===id?{...b,ativo:!b.ativo}:b)}));
  const addHab=()=>{if(!novaHab.nome.trim())return;setFicha(f=>({...f,habilidades:[...(f.habilidades||[]),{...novaHab,id:Date.now()}]}));setNovaHab({nome:"",desc:""});};
  const rmHab=id=>setFicha(f=>({...f,habilidades:f.habilidades.filter(h=>h.id!==id)}));
  const addBonusDef=()=>{if(!novoBonusDef.nome.trim())return;setFicha(f=>({...f,bonus_defesa:[...(f.bonus_defesa||[]),{...novoBonusDef,id:Date.now()}]}));setNovoBonusDef({nome:"",valor:0,ativo:true});};
  const rmBonusDef=id=>setFicha(f=>({...f,bonus_defesa:f.bonus_defesa.filter(b=>b.id!==id)}));
  const togBonusDef=id=>setFicha(f=>({...f,bonus_defesa:f.bonus_defesa.map(b=>b.id===id?{...b,ativo:!b.ativo}:b)}));

  // toggle habilidade de classe adquirida — sincroniza com lista de habilidades
  const togHabClasse=(habNome)=>{
    const lista=ficha.habilidades_classe||[];
    const jaAdq=lista.includes(habNome);
    const novaLista=jaAdq?lista.filter(h=>h!==habNome):[...lista,habNome];
    // se adquirindo, adiciona à lista de habilidades gerais com desc completa
    if(!jaAdq){
      const habData=Object.values(HAB_CLASSE).flat().find(h=>h.nome===habNome);
      const jaExiste=(ficha.habilidades||[]).some(h=>h.nome===habNome);
      if(habData&&!jaExiste){
        setFicha(f=>({...f,habilidades_classe:novaLista,habilidades:[...(f.habilidades||[]),{id:Date.now(),nome:habData.nome,desc:habData.desc,prereq:habData.prereq,fonte:"classe"}]}));
        return;
      }
    } else {
      // se removendo, remove também da lista de habilidades (somente as de fonte "classe")
      setFicha(f=>({...f,habilidades_classe:novaLista,habilidades:(f.habilidades||[]).filter(h=>!(h.nome===habNome&&h.fonte==="classe"))}));
      return;
    }
    upd("habilidades_classe",novaLista);
  };

  const totalPeso=ficha.inventario.reduce((a,i)=>a+(parseFloat(i.peso)*i.qtd),0);

  const abas=ficha.criacao_step<4
    ?[{id:"criar",label:"Criação",icon:"◈"}]
    :[
        {id:"identidade",label:"Identidade",icon:"◈"},
        {id:"atributos",label:"Atributos",icon:"◆"},
        {id:"pericias",label:"Perícias",icon:"▣"},
        {id:"bonus",label:"Bônus",icon:"⊕"},
        {id:"hab_gerais",label:"Habilidades",icon:"◉"},
        {id:"hab_classe",label:"Hab. Classe",icon:"◬"},
        {id:"recursos",label:"Recursos",icon:"◍"},
        {id:"inventario",label:"Inventário",icon:"◫"},
        {id:"rituais",label:"Rituais",icon:"◌"},
        {id:"notas",label:"Notas",icon:"▤"},
      ];

  const clsCor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[ficha.classe]||C.lime;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.gray1,fontFamily:"'Courier New',monospace",fontSize:13,paddingBottom:64}}>

      {/* FOTO FULLSCREEN */}
      {fotoExpanded&&ficha.foto&&(
        <div onClick={()=>setFotoExpanded(false)} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={ficha.foto} alt="Foto do agente" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:4,boxShadow:"0 0 60px rgba(200,245,90,0.15)"}}/>
          <div style={{position:"absolute",top:16,right:20,fontSize:10,color:C.gray3,letterSpacing:2}}>clique para fechar</div>
        </div>
      )}

      {/* MODAL TRANSFORMAÇÃO ADD */}
      {showTransformModal==="add"&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.surface,border:`1px solid ${C.lime}`,borderRadius:4,padding:24,width:480,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.lime,marginBottom:14}}>◬ ADICIONAR TRANSFORMAÇÃO</div>
            <Inp label="Nome da Transformação" v={transForm.nome} s={v=>setTransForm(t=>({...t,nome:v}))} ph="Forma Bestial, Transe..."/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
              <Inp label="PV Temporários" v={transForm.pv_temp} s={v=>setTransForm(t=>({...t,pv_temp:v}))} type="number"/>
              <Inp label="PE Temporários" v={transForm.pe_temp} s={v=>setTransForm(t=>({...t,pe_temp:v}))} type="number"/>
              <Inp label="Bônus Defesa" v={transForm.bonus_defesa} s={v=>setTransForm(t=>({...t,bonus_defesa:v}))} type="number"/>
            </div>
            <div style={{marginTop:12}}>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>BÔNUS POR PERÍCIA (opcional)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))",gap:5,maxHeight:160,overflowY:"auto",padding:6,background:C.surface2,borderRadius:2,border:`1px solid ${C.border}`}}>
                {PERICIAS.map(p=>(
                  <div key={p.nome} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:9,color:C.gray3,flex:1}}>{p.nome}</span>
                    <input type="number" defaultValue={0} onChange={e=>setTransForm(t=>({...t,bonus_pericias:{...t.bonus_pericias,[p.nome]:Number(e.target.value)}}))}
                      style={{width:44,padding:"3px 5px",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setShowTransformModal(false)} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>CANCELAR</button>
              <button onClick={ativarTransformacao} disabled={!transForm.nome.trim()} style={{flex:2,padding:"8px 0",background:transForm.nome.trim()?C.limeFade2:"transparent",border:`1px solid ${transForm.nome.trim()?C.lime:C.gray4}`,color:transForm.nome.trim()?C.lime:C.gray4,cursor:transForm.nome.trim()?"pointer":"not-allowed",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700}}>◬ ATIVAR</button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL TRANSFORMAÇÃO REMOVE */}
      {showTransformModal==="remove"&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:C.surface,border:`1px solid ${C.orange}`,borderRadius:4,padding:24,width:380,maxWidth:"96vw"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.orange,marginBottom:12}}>◬ ENCERRAR TRANSFORMAÇÃO</div>
            <div style={{fontSize:12,color:C.white,marginBottom:12}}>Encerrando: <strong style={{color:C.lime}}>{ficha.transformacao?.nome}</strong><br/><span style={{fontSize:10,color:C.gray3}}>Determine penalidades ao retornar (0 = nenhuma):</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <Inp label="Pen. PV" v={penForm.pv_pen} s={v=>setPenForm(p=>({...p,pv_pen:v}))} type="number"/>
              <Inp label="Pen. PE" v={penForm.pe_pen} s={v=>setPenForm(p=>({...p,pe_pen:v}))} type="number"/>
              <Inp label="Pen. SAN" v={penForm.san_pen} s={v=>setPenForm(p=>({...p,san_pen:v}))} type="number"/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setShowTransformModal(false)} style={{flex:1,padding:"8px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>CANCELAR</button>
              <button onClick={removerTransformacao} style={{flex:2,padding:"8px 0",background:"rgba(224,128,58,0.15)",border:`1px solid ${C.orange}`,color:C.orange,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:700}}>ENCERRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50}}>
        {/* Foto banner */}
        {ficha.foto&&<div style={{height:48,background:`url(${ficha.foto}) center 30%/cover`,position:"relative"}}><div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)"}}/></div>}
        <div style={{maxWidth:1100,margin:"0 auto",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,justifyContent:"space-between",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={onBack} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← BIBLIOTECA</button>
            {/* Avatar */}
            <div onClick={ficha.foto?()=>setFotoExpanded(true):handleFoto} style={{width:38,height:38,borderRadius:2,background:ficha.foto?`url(${ficha.foto}) center/cover`:C.surface2,border:`1px solid ${C.lime}`,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {!ficha.foto&&<span style={{fontSize:16,color:C.gray4}}>◈</span>}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,letterSpacing:3,color:C.lime}}>⬡ {ficha.nome||"ORDEM PARANORMAL"}</div>
              {ficha.classe&&<div style={{fontSize:9,color:clsCor,letterSpacing:2}}>{ficha.classe} · {ficha.patente} · NEX {ficha.nex}% · {(ficha.prestigio||0)} ★</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {ficha.criacao_step>=4&&(
              ficha.transformacao?.ativa
                ?<button onClick={()=>setShowTransformModal("remove")} style={{padding:"6px 12px",background:"rgba(224,128,58,0.15)",border:`1px solid ${C.orange}`,color:C.orange,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700}}>◬ {ficha.transformacao.nome} — ENCERRAR</button>
                :<button onClick={()=>setShowTransformModal("add")} style={{padding:"6px 12px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700}}>◬ TRANSFORMAÇÃO</button>
            )}
            <button onClick={()=>setShowRoller(s=>!s)} style={{padding:"6px 12px",background:showRoller?C.limeFade2:C.surface2,border:`1px solid ${showRoller?C.lime:C.border}`,color:showRoller?C.lime:C.gray2,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>⬡ DADOS</button>
            <button onClick={()=>onSave(ficha)} style={btnLime}>SALVAR</button>
          </div>
        </div>
      </div>

      {/* ROLADOR */}
      {showRoller&&(
        <div style={{position:"fixed",top:64,right:12,width:290,zIndex:200,background:C.surface,border:`1px solid ${C.lime}`,borderRadius:3,padding:12,boxShadow:`0 0 30px rgba(200,245,90,0.1)`}}>
          <div style={{fontSize:8,letterSpacing:4,color:C.lime,marginBottom:8}}>◈ ROLADOR</div>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <input value={diceFormula} onChange={e=>setDiceFormula(e.target.value)} onKeyDown={e=>e.key==="Enter"&&rolar(diceFormula)} placeholder="1d20 · 2d6+3"
              style={{flex:1,padding:"6px 9px",background:C.bg,border:`1px solid ${C.border2}`,color:C.white,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
            <button onClick={()=>rolar(diceFormula)} style={{padding:"6px 10px",background:C.lime,color:C.bg,border:"none",borderRadius:2,cursor:"pointer",fontWeight:700,fontSize:11}}>▶</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {["d4","d6","d8","d10","d12","d20","d100"].map(d=><button key={d} onClick={()=>rolar(`1${d}`,d)} style={{padding:"2px 7px",background:C.surface2,border:`1px solid ${C.border}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>{d}</button>)}
          </div>
          <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {log.length===0&&<div style={{color:C.gray4,fontSize:10,textAlign:"center",padding:10}}>Nenhuma rolagem.</div>}
            {log.map((l,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",padding:"3px 7px",background:C.surface2,borderRadius:2}}>
                <div><div style={{fontSize:8,color:C.lime}}>{l.rotulo}</div><div style={{fontSize:7,color:C.gray4}}>{l.rolls.join(", ")}</div></div>
                <div style={{fontSize:18,fontWeight:900,color:C.white}}>{l.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        <div style={{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 6px"}}>
          {abas.map(a=>(
            <button key={a.id} onClick={()=>setAba(a.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"7px 11px",background:"transparent",border:"none",borderBottom:`2px solid ${aba===a.id?C.lime:"transparent"}`,color:aba===a.id?C.lime:C.gray4,cursor:"pointer",fontSize:12,whiteSpace:"nowrap",fontFamily:"inherit",transition:"all 0.15s"}}>
              <span>{a.icon}</span><span style={{fontSize:7,letterSpacing:1}}>{a.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TRANSFORMAÇÃO BANNER */}
      {ficha.transformacao?.ativa&&(
        <div style={{background:"rgba(200,245,90,0.05)",borderBottom:`1px solid ${C.lime}`,padding:"5px 18px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:C.lime,letterSpacing:2,fontWeight:700}}>◬</span>
          <span style={{fontSize:11,color:C.white,fontWeight:700}}>{ficha.transformacao.nome}</span>
          {pvTemp>0&&<span style={{fontSize:8,color:C.red,border:`1px solid rgba(224,80,80,0.3)`,padding:"1px 5px",borderRadius:2}}>+{pvTemp} PV</span>}
          {peTemp>0&&<span style={{fontSize:8,color:C.blue,border:`1px solid rgba(80,200,224,0.3)`,padding:"1px 5px",borderRadius:2}}>+{peTemp} PE</span>}
          {Number(ficha.transformacao.bonus_defesa)>0&&<span style={{fontSize:8,color:C.gold,border:`1px solid rgba(208,160,64,0.3)`,padding:"1px 5px",borderRadius:2}}>+{ficha.transformacao.bonus_defesa} DEF</span>}
        </div>
      )}

      <div style={{maxWidth:1100,margin:"0 auto",padding:"18px 14px"}}>

        {/* ── CRIAÇÃO ── */}
        {aba==="criar"&&(
          <div>
            <StepCard step={1} title="DISTRIBUIR ATRIBUTOS" active={ficha.criacao_step===1} done={ficha.criacao_step>1}>
              <p style={{fontSize:11,color:C.gray3,marginBottom:14,lineHeight:1.8}}>Todos começam em <b style={{color:C.white}}>1</b>. Você tem <b style={{color:C.lime}}>{pontosRestantes}</b> ponto(s). Reduzir para <b style={{color:C.white}}>0</b> dá +1 ponto bônus. Máximo <b style={{color:C.white}}>3</b>.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))",gap:10,marginBottom:18}}>
                {Object.entries(ficha.atributos).map(([attr,val])=>{
                  const g=Object.values(ficha.atributos).reduce((a,v)=>a+(v-1),0);
                  const pS=val<3&&g<PONTOS_TOTAL,pB=val>0;
                  return(
                    <div key={attr} style={{padding:12,background:C.surface2,border:`1px solid ${C.border}`,borderTop:`2px solid ${attrCors[attr]}`,borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <div style={{fontSize:8,letterSpacing:3,color:attrCors[attr]}}>{attrNames[attr].toUpperCase()}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button disabled={!pB} onClick={()=>setAttrCriacao(attr,val-1)} style={{width:26,height:26,background:pB?C.surface3:C.gray5,border:`1px solid ${C.border2}`,color:pB?C.gray2:C.gray4,cursor:pB?"pointer":"not-allowed",borderRadius:2,fontSize:15}}>−</button>
                        <span style={{fontSize:26,fontWeight:900,color:val===0?C.red:val===3?C.lime:attrCors[attr],minWidth:28,textAlign:"center"}}>{val}</span>
                        <button disabled={!pS} onClick={()=>setAttrCriacao(attr,val+1)} style={{width:26,height:26,background:pS?C.surface3:C.gray5,border:`1px solid ${C.border2}`,color:pS?C.gray2:C.gray4,cursor:pS?"pointer":"not-allowed",borderRadius:2,fontSize:15}}>+</button>
                      </div>
                      {val===0&&<div style={{fontSize:8,color:C.red}}>+1 PT</div>}
                      {val===3&&<div style={{fontSize:8,color:C.lime}}>MÁX</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <span style={{fontSize:11,color:C.gray3}}>Distribuído: <b style={{color:C.white}}>{pontosGastos}</b>/{PONTOS_TOTAL}</span>
                <button onClick={()=>setFicha(f=>({...f,criacao_step:2}))} style={btnLime}>CONFIRMAR ATRIBUTOS →</button>
              </div>
            </StepCard>

            <StepCard step={2} title="ESCOLHER ORIGEM" active={ficha.criacao_step===2} done={ficha.criacao_step>2}>
              {ficha.criacao_step<2&&<Empty>Complete o passo anterior.</Empty>}
              {ficha.criacao_step>=2&&(<>
                <p style={{fontSize:11,color:C.gray3,marginBottom:12,lineHeight:1.8}}>Sua origem define 2 perícias treinadas e uma habilidade especial.</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(210px,1fr))",gap:6,maxHeight:380,overflowY:"auto"}}>
                  {ORIGENS.map(o=>(
                    <div key={o.nome} onClick={()=>setFicha(f=>({...f,origem:o.nome}))} style={{padding:"9px 11px",background:ficha.origem===o.nome?C.limeFade2:C.surface2,border:`1px solid ${ficha.origem===o.nome?C.lime:C.border}`,borderRadius:2,cursor:"pointer",transition:"all 0.12s"}}>
                      <div style={{fontSize:12,fontWeight:700,color:ficha.origem===o.nome?C.lime:C.white}}>{o.nome}</div>
                      <div style={{fontSize:9,color:C.gray3,marginTop:2}}>{o.pericias.join(" · ")}</div>
                      <div style={{fontSize:8,color:C.gold,marginTop:2}}>{o.habilidade}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
                  <button onClick={()=>setFicha(f=>({...f,criacao_step:1}))} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← VOLTAR</button>
                  <button disabled={!ficha.origem} onClick={()=>confirmarOrigem(ficha.origem)} style={{...btnLime,opacity:ficha.origem?1:0.4,cursor:ficha.origem?"pointer":"not-allowed"}}>CONFIRMAR ORIGEM →</button>
                </div>
              </>)}
            </StepCard>

            <StepCard step={3} title="ESCOLHER CLASSE" active={ficha.criacao_step===3} done={ficha.criacao_step>3}>
              {ficha.criacao_step<3&&<Empty>Complete os passos anteriores.</Empty>}
              {ficha.criacao_step>=3&&(<>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))",gap:10}}>
                  {Object.entries(CLASSES).map(([nome,cls])=>{
                    const pvI=calcPV(nome,ficha.atributos,0),peI=calcPE(nome,ficha.atributos,0),sanI=calcSAN(nome,0);
                    const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[nome];
                    const ativo=ficha.classe===nome;
                    return(
                      <div key={nome} onClick={()=>setFicha(f=>({...f,classe:nome}))} style={{padding:14,background:ativo?C.limeFade2:C.surface2,border:`1px solid ${ativo?C.lime:C.border}`,borderTop:`2px solid ${cor}`,borderRadius:3,cursor:"pointer",transition:"all 0.12s"}}>
                        <div style={{fontSize:14,fontWeight:700,color:ativo?C.lime:C.white,marginBottom:5}}>{nome}</div>
                        <div style={{fontSize:10,color:C.gray3,lineHeight:1.7,marginBottom:8}}>{cls.desc}</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:8}}>
                          {[["PV",pvI,C.red],["PE",peI,C.blue],["SAN",sanI,C.purple]].map(([l,v,c])=>(
                            <div key={l} style={{padding:"5px 6px",background:C.surface,borderRadius:2,textAlign:"center",border:`1px solid ${C.border}`}}>
                              <div style={{fontSize:15,fontWeight:900,color:c}}>{v}</div>
                              <div style={{fontSize:7,color:C.gray4,letterSpacing:1}}>{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{fontSize:9,color:C.gray4,lineHeight:1.7}}>
                          <div>Fixas: <span style={{color:C.gray2}}>{cls.pericias_fixas.join(", ")||"—"}</span></div>
                          <div>+ {cls.pericias_livre_formula} à escolha</div>
                          <div>Por NEX: +{cls.pv_nex}PV +{cls.pe_nex}PE +{cls.san_nex}SAN</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{marginTop:12,display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
                  <button onClick={()=>setFicha(f=>({...f,criacao_step:2}))} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>← VOLTAR</button>
                  <button disabled={!ficha.classe} onClick={()=>confirmarClasse(ficha.classe)} style={{...btnLime,opacity:ficha.classe?1:0.4,cursor:ficha.classe?"pointer":"not-allowed"}}>CONFIRMAR E INICIAR →</button>
                </div>
              </>)}
            </StepCard>
          </div>
        )}

        {/* ── IDENTIDADE ── */}
        {aba==="identidade"&&(
          <Sec title="◈ IDENTIDADE DO AGENTE">
            <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap",marginBottom:18}}>
              {/* Foto */}
              <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                <div onClick={ficha.foto?()=>setFotoExpanded(true):handleFoto}
                  title={ficha.foto?"Clique para expandir":"Clique para adicionar foto"}
                  style={{width:110,height:130,borderRadius:3,background:ficha.foto?`url(${ficha.foto}) center/cover`:C.surface2,border:`1px dashed ${C.lime}`,cursor:ficha.foto?"zoom-in":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {!ficha.foto&&<><span style={{fontSize:28,color:C.gray4}}>◈</span><span style={{fontSize:8,color:C.gray4,marginTop:4,letterSpacing:1}}>FOTO</span></>}
                </div>
                {ficha.foto&&<button onClick={handleFoto} style={{padding:"3px 0",background:"transparent",border:`1px solid ${C.border2}`,color:C.gray4,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit",letterSpacing:1}}>ALTERAR</button>}
              </div>
              <div style={{flex:1,minWidth:200}}>
                <G2><Inp label="Nome do Agente" v={ficha.nome} s={v=>upd("nome",v)} ph="Nome completo"/><Inp label="Jogador" v={ficha.jogador} s={v=>upd("jogador",v)}/></G2>
                <G2 mt><Inp label="Idade" v={ficha.idade} s={v=>upd("idade",v)} type="number"/><Inp label="Gênero" v={ficha.genero} s={v=>upd("genero",v)}/></G2>
                <G2 mt><Slc label="Patente" v={ficha.patente} s={v=>upd("patente",v)} opts={PATENTES}/><Slc label="Limite de Crédito" v={ficha.limite_credito||"Baixo"} s={v=>upd("limite_credito",v)} opts={["Baixo","Médio","Alto","Ilimitado"]}/></G2>
                <div style={{marginTop:10}}>
                  <label style={{fontSize:7,letterSpacing:2,color:C.gray4,textTransform:"uppercase",display:"block",marginBottom:4}}>Pontos de Prestígio — <span style={{color:C.gold,fontWeight:700}}>{ficha.prestigio||0}</span></label>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="range" min={0} max={200} step={1} value={ficha.prestigio||0} onChange={e=>upd("prestigio",Number(e.target.value))} style={{flex:1,accentColor:C.gold}}/>
                    <input type="number" min={0} max={200} value={ficha.prestigio||0} onChange={e=>upd("prestigio",Math.max(0,Math.min(200,Number(e.target.value))))}
                      style={{width:50,padding:"4px 6px",textAlign:"center",background:C.bg,border:`1px solid ${C.border}`,color:C.gold,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
                  </div>
                </div>
              </div>
            </div>
            {ficha.origem&&(()=>{const o=ORIGENS.find(o=>o.nome===ficha.origem);return(<div style={{marginBottom:10,padding:"9px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}><div style={{fontSize:9,color:C.lime,letterSpacing:2,marginBottom:2}}>{ficha.origem.toUpperCase()} — {o.habilidade}</div><div style={{fontSize:11,color:C.gray2}}>Perícias: <b style={{color:C.white}}>{o.pericias.join(" e ")}</b></div></div>);})()}
            {ficha.classe&&(<div style={{marginBottom:14,padding:"9px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${clsCor}`,borderRadius:2}}><div style={{fontSize:9,color:clsCor,letterSpacing:2,marginBottom:2}}>CLASSE: {ficha.classe.toUpperCase()}</div><div style={{fontSize:10,color:C.gray3,lineHeight:1.7}}>{CLASSES[ficha.classe].desc}</div><div style={{fontSize:9,color:C.gray4,marginTop:3}}>Por NEX: +{CLASSES[ficha.classe].pv_nex}PV(+VIG) · +{CLASSES[ficha.classe].pe_nex}PE(+PRE) · +{CLASSES[ficha.classe].san_nex}SAN</div></div>)}
            <TxtA label="Aparência física" v={ficha.aparencia} s={v=>upd("aparencia",v)} rows={3}/>
            <TxtA label="História / Background" v={ficha.historia} s={v=>upd("historia",v)} rows={4}/>
            <TxtA label="Motivação" v={ficha.motivacao} s={v=>upd("motivacao",v)} rows={3}/>
          </Sec>
        )}

        {/* ── ATRIBUTOS ── */}
        {aba==="atributos"&&(
          <Sec title="◆ ATRIBUTOS">
            <div style={{fontSize:10,color:C.gray4,marginBottom:14,lineHeight:1.8}}>Atributos podem ser negativados. <strong style={{color:C.gray2}}>Não somam</strong> ao bônus de perícia.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(148px,1fr))",gap:10,marginBottom:22}}>
              {Object.entries(ficha.atributos).map(([attr,val])=>(
                <div key={attr} style={{padding:14,background:C.surface2,border:`1px solid ${C.border}`,borderTop:`2px solid ${attrCors[attr]}`,borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,letterSpacing:3,color:attrCors[attr]}}>{attrNames[attr].toUpperCase()}</div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button onClick={()=>setFicha(f=>({...f,atributos:{...f.atributos,[attr]:val-1}}))} style={{width:26,height:26,background:C.surface3,border:`1px solid ${C.border2}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:15}}>−</button>
                    <span style={{fontSize:26,fontWeight:900,color:val<0?C.red:val===0?C.gray3:attrCors[attr],minWidth:32,textAlign:"center"}}>{val}</span>
                    <button onClick={()=>setFicha(f=>({...f,atributos:{...f.atributos,[attr]:val+1}}))} style={{width:26,height:26,background:C.surface3,border:`1px solid ${C.border2}`,color:C.gray2,cursor:"pointer",borderRadius:2,fontSize:15}}>+</button>
                  </div>
                  <button onClick={()=>rolar("1d20",`Teste de ${attrNames[attr]}`)} style={{padding:"3px 9px",background:"transparent",border:`1px solid ${C.border}`,color:C.gray4,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>⬡ TESTAR</button>
                </div>
              ))}
            </div>
            <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>DERIVADOS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(128px,1fr))",gap:8}}>
              {[{label:"PV Máximo",val:pvTotal,color:C.red,sub:pvTemp>0?`${pvMax}+${pvTemp}temp`:`base+VIG+NEX`},
                {label:"PE Máximo",val:peTotal,color:C.blue,sub:peTemp>0?`${peMax}+${peTemp}temp`:`base+PRE+NEX`},
                {label:"SAN Máxima",val:sanMax,color:C.purple,sub:"base+NEX"},
                {label:"Defesa",val:defesa,color:C.gold,sub:`10+AGI(${ficha.atributos.AGI})+bônus`},
                {label:"Desl.",val:"9m",color:C.green,sub:"padrão"},
              ].map(d=>(
                <div key={d.label} style={{padding:"10px 8px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${d.color}`,borderRadius:3,textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:900,color:d.color}}>{d.val}</div>
                  <div style={{fontSize:8,color:C.gray3,letterSpacing:1,marginTop:1}}>{d.label.toUpperCase()}</div>
                  <div style={{fontSize:7,color:C.gray5,marginTop:1}}>{d.sub}</div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── PERÍCIAS ── */}
        {aba==="pericias"&&(
          <Sec title="▣ PERÍCIAS">
            <div style={{fontSize:10,color:C.gray4,marginBottom:12}}>Graus: <span style={{color:C.blue}}>T</span>+5 · <span style={{color:C.gold}}>V</span>+10 · <span style={{color:C.lime}}>E</span>+15. Atributos <b>não somam</b>.</div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {PERICIAS.map(p=>{
                const grau=ficha.pericias[p.nome]||"Destreinado";
                const gi=GRAUS.indexOf(grau);
                const bonus=calcBonusP(ficha,p.nome);
                const manual=ficha.bonus_pericia?.[p.nome]||0;
                const trB=ficha.transformacao?.ativa&&ficha.transformacao?.bonus_pericias?.[p.nome]?Number(ficha.transformacao.bonus_pericias[p.nome]):0;
                return(
                  <div key={p.nome} style={{display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:10,alignItems:"center",padding:"6px 10px",background:bonus>0?C.limeFade:C.surface2,border:`1px solid ${bonus>0?"rgba(200,245,90,0.12)":C.border}`,borderRadius:2}}>
                    <div>
                      <div style={{fontSize:12,color:C.white,display:"flex",alignItems:"center",gap:5}}>{p.nome}{trB!==0&&<span style={{fontSize:7,color:C.lime,border:`1px solid ${C.lime}`,padding:"0 3px",borderRadius:2}}>◬{trB>0?"+":""}{trB}</span>}</div>
                      <div style={{fontSize:7,letterSpacing:2,color:attrCors[p.at]}}>{p.at}</div>
                    </div>
                    <div style={{display:"flex",gap:3}}>
                      {GRAUS.map((g,gii)=>(
                        <button key={g} title={`${g} (+${GRAU_BONUS[g]})`} onClick={()=>setFicha(f=>({...f,pericias:{...f.pericias,[p.nome]:GRAUS[(gi+1)%GRAUS.length]}}))}
                          style={{width:19,height:19,borderRadius:2,border:`1px solid ${GRAU_COR[g]}`,background:gii<=gi?GRAU_COR[g]:"transparent",color:gii<=gi?C.bg:C.gray5,cursor:"pointer",fontSize:7,fontWeight:700}}>{GRAU_SH[g]}</button>
                      ))}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontSize:7,color:C.gray5}}>BÔN.</span>
                      <input type="number" value={manual} onChange={e=>setFicha(f=>({...f,bonus_pericia:{...f.bonus_pericia,[p.nome]:Number(e.target.value)}}))}
                        style={{width:34,padding:"2px 3px",textAlign:"center",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                    </div>
                    <div style={{fontSize:15,fontWeight:900,color:bonus>0?C.lime:C.gray3,minWidth:26,textAlign:"center"}}>{bonus>0?`+${bonus}`:bonus}</div>
                    <button onClick={()=>rolar(`1d20+${bonus}`,`${p.nome} (${grau})`)} style={{padding:"3px 6px",background:"transparent",border:`1px solid ${C.border}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:11}}>⬡</button>
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
              <G2><Inp label="Nome / Fonte" v={novoBonus.nome} s={v=>setNovoBonus(b=>({...b,nome:v}))} ph="Ex: Faro para Pistas..."/>
                <Slc label="Aplica-se a" v={novoBonus.alvo} s={v=>setNovoBonus(b=>({...b,alvo:v}))} opts={["Todas",...PERICIAS.map(p=>p.nome)]}/>
              </G2>
              <G2 mt><Inp label="Valor" v={novoBonus.valor} s={v=>setNovoBonus(b=>({...b,valor:Number(v)}))} type="number" ph="+5, -2..."/>
                <Inp label="Notas" v={novoBonus.desc} s={v=>setNovoBonus(b=>({...b,desc:v}))} ph="Permanente..."/>
              </G2>
              <Btn onClick={addBonus}>+ ADICIONAR</Btn>
            </FormBx>
            {(ficha.bonus_extras||[]).length===0&&<Empty>Nenhum modificador.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {(ficha.bonus_extras||[]).map(b=>(
                <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${b.valor>=0?C.lime:C.red}`,borderRadius:2,opacity:b.ativo?1:0.45}}>
                  <div><div style={{fontSize:13,color:C.white,fontWeight:700}}>{b.nome}</div><div style={{fontSize:8,color:C.gray3,letterSpacing:1}}>{b.alvo==="Todas"?"TODAS":b.alvo.toUpperCase()}</div>{b.desc&&<div style={{fontSize:9,color:C.gray4}}>{b.desc}</div>}</div>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <span style={{fontSize:20,fontWeight:900,color:b.valor>=0?C.lime:C.red}}>{b.valor>=0?"+":""}{b.valor}</span>
                    <button onClick={()=>togBonus(b.id)} style={{padding:"2px 7px",background:"transparent",border:`1px solid ${C.border}`,color:b.ativo?C.lime:C.gray4,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit"}}>{b.ativo?"ON":"OFF"}</button>
                    <button onClick={()=>rmBonus(b.id)} style={btnRm}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── HABILIDADES GERAIS ── */}
        {aba==="hab_gerais"&&(
          <Sec title="◉ HABILIDADES DO AGENTE">
            <FormBx>
              <Inp label="Nome da Habilidade" v={novaHab.nome} s={v=>setNovaHab(h=>({...h,nome:v}))} ph="Habilidade personalizada..."/>
              <div style={{marginTop:10}}><TxtA label="Descrição / Efeito" v={novaHab.desc} s={v=>setNovaHab(h=>({...h,desc:v}))} rows={3}/></div>
              <Btn onClick={addHab}>+ ADICIONAR HABILIDADE</Btn>
            </FormBx>
            <div style={{fontSize:10,color:C.gray4,marginBottom:10,lineHeight:1.7}}>
              Habilidades adquiridas na aba <span style={{color:C.lime}}>Hab. Classe</span> aparecem aqui automaticamente com badge de origem.
            </div>
            {(ficha.habilidades||[]).length===0&&<Empty>Nenhuma habilidade registrada.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {(ficha.habilidades||[]).map(h=>{
                const isClasse=h.fonte==="classe";
                const cls=isClasse?Object.entries(HAB_CLASSE).find(([,habs])=>habs.find(hh=>hh.nome===h.nome))?.[0]:null;
                const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[cls]||C.lime;
                return(
                  <div key={h.id} style={{padding:"11px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${isClasse?cor:C.lime}`,borderRadius:2}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <div style={{fontSize:14,color:isClasse?cor:C.lime,fontWeight:700}}>{h.nome}</div>
                        {isClasse&&<span style={{fontSize:8,color:cor,border:`1px solid ${cor}`,padding:"1px 6px",borderRadius:2,letterSpacing:1,opacity:0.8}}>{cls?.toUpperCase()}</span>}
                      </div>
                      <button onClick={()=>isClasse?togHabClasse(h.nome):rmHab(h.id)} style={btnRm} title={isClasse?"Remove da lista de classe":"Apagar"}>✕</button>
                    </div>
                    {h.prereq&&h.prereq!=="—"&&<div style={{fontSize:8,color:C.gold,letterSpacing:1,marginTop:3}}>Pré-req: {h.prereq}</div>}
                    {h.desc&&<div style={{fontSize:11,color:C.gray2,lineHeight:1.7,marginTop:5}}>{h.desc}</div>}
                  </div>
                );
              })}
            </div>
          </Sec>
        )}

        {/* ── HABILIDADES DE CLASSE ── */}
        {aba==="hab_classe"&&(
          <Sec title="◬ HABILIDADES DE CLASSE">
            <div style={{fontSize:10,color:C.gray4,marginBottom:14,lineHeight:1.8}}>
              Clique em uma habilidade para marcar como <span style={{color:C.lime}}>adquirida</span>. As adquiridas ficam destacadas.
            </div>
            {/* Sub-tabs por classe */}
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {Object.keys(HAB_CLASSE).map(cls=>{
                const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[cls];
                const adq=(ficha.habilidades_classe||[]).filter(h=>HAB_CLASSE[cls].find(hh=>hh.nome===h)).length;
                return(
                  <button key={cls} onClick={()=>setAbaCls(cls)}
                    style={{padding:"6px 14px",background:abaCls===cls?`rgba(${cor==="#e05050"?"224,80,80":cor==="#50c8e0"?"80,200,224":"144,96,208"},0.15)`:C.surface2,border:`1px solid ${abaCls===cls?cor:C.border}`,color:abaCls===cls?cor:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit",fontWeight:abaCls===cls?700:400}}>
                    {cls} {adq>0&&<span style={{fontSize:8,background:cor,color:C.bg,padding:"1px 5px",borderRadius:10,marginLeft:4}}>{adq}</span>}
                  </button>
                );
              })}
            </div>
            {/* Filtro */}
            <input value={filtroHab} onChange={e=>setFiltroHab(e.target.value)} placeholder="Filtrar habilidades..."
              style={{width:"100%",padding:"7px 10px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(290px,1fr))",gap:8}}>
              {(HAB_CLASSE[abaCls]||[]).filter(h=>!filtroHab||h.nome.toLowerCase().includes(filtroHab.toLowerCase())||h.desc.toLowerCase().includes(filtroHab.toLowerCase())).map(h=>{
                const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[abaCls];
                const adq=(ficha.habilidades_classe||[]).includes(h.nome);
                return(
                  <div key={h.nome} onClick={()=>togHabClasse(h.nome)}
                    style={{padding:"10px 12px",background:adq?`rgba(${abaCls==="Combatente"?"224,80,80":abaCls==="Especialista"?"80,200,224":"144,96,208"},0.1)`:C.surface2,border:`1px solid ${adq?cor:C.border}`,borderLeft:`3px solid ${adq?cor:C.gray5}`,borderRadius:2,cursor:"pointer",transition:"all 0.12s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                      <div style={{fontSize:12,color:adq?cor:C.white,fontWeight:adq?700:400}}>{h.nome}</div>
                      <span style={{fontSize:9,color:adq?cor:C.gray5,flexShrink:0}}>{adq?"✓ ADQUIRIDA":"○"}</span>
                    </div>
                    {h.prereq&&h.prereq!=="—"&&<div style={{fontSize:8,color:C.gold,letterSpacing:1,marginTop:3}}>Pré-req: {h.prereq}</div>}
                    <div style={{fontSize:10,color:C.gray3,lineHeight:1.65,marginTop:4}}>{h.desc}</div>
                  </div>
                );
              })}
            </div>
            {/* Resumo adquiridas */}
            {(ficha.habilidades_classe||[]).length>0&&(
              <div style={{marginTop:20,padding:"12px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:3}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>HABILIDADES ADQUIRIDAS ({ficha.habilidades_classe.length})</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ficha.habilidades_classe.map(nome=>{
                    const cls=Object.entries(HAB_CLASSE).find(([,habs])=>habs.find(h=>h.nome===nome))?.[0];
                    const cor={Combatente:C.red,Especialista:C.blue,Ocultista:C.purple}[cls]||C.lime;
                    return(<span key={nome} onClick={()=>togHabClasse(nome)} style={{fontSize:9,color:cor,border:`1px solid ${cor}`,padding:"2px 8px",borderRadius:2,cursor:"pointer",opacity:0.9}}>{nome} ✕</span>);
                  })}
                </div>
              </div>
            )}
          </Sec>
        )}

        {/* ── RECURSOS ── */}
        {aba==="recursos"&&(
          <Sec title="◍ RECURSOS & STATUS">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))",gap:12,marginBottom:18}}>
              <RecCard label="PONTOS DE VIDA"    color={C.red}    atual={ficha.pv_atual}  max={pvTotal}  temp={pvTemp}  onChange={v=>upd("pv_atual",  Math.max(0,Math.min(pvTotal, v)))}/>
              <RecCard label="PONTOS DE ESFORÇO" color={C.blue}   atual={ficha.pe_atual}  max={peTotal}  temp={peTemp}  onChange={v=>upd("pe_atual",  Math.max(0,Math.min(peTotal, v)))}/>
              <RecCard label="SANIDADE"           color={C.purple} atual={ficha.san_atual} max={sanMax}   temp={0}       onChange={v=>upd("san_atual", Math.max(0,Math.min(sanMax,  v)))}/>
            </div>
            {/* Defesa */}
            <div style={{marginBottom:18,padding:14,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:3}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:9,color:C.gray4,letterSpacing:3}}>DEFESA</div>
                <div style={{fontSize:28,fontWeight:900,color:C.gold}}>{defesa}</div>
              </div>
              <div style={{fontSize:9,color:C.gray4,marginBottom:10}}>
                Base: 10+AGI({ficha.atributos.AGI})
                {ficha.transformacao?.ativa&&Number(ficha.transformacao.bonus_defesa)>0&&<span style={{color:C.lime}}> +{ficha.transformacao.bonus_defesa}(transf.)</span>}
                {(ficha.bonus_defesa||[]).filter(b=>b.ativo).map(b=><span key={b.id} style={{color:C.gold}}> +{b.valor}({b.nome})</span>)}
              </div>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>BÔNUS MANUAIS DE DEFESA</div>
              <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
                <input value={novoBonusDef.nome} onChange={e=>setNovoBonusDef(b=>({...b,nome:e.target.value}))} placeholder="Nome do bônus"
                  style={{flex:2,minWidth:110,padding:"6px 8px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <input type="number" value={novoBonusDef.valor} onChange={e=>setNovoBonusDef(b=>({...b,valor:Number(e.target.value)}))}
                  style={{width:52,padding:"6px 7px",textAlign:"center",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={addBonusDef} style={{padding:"6px 11px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700}}>+ ADD</button>
              </div>
              {(ficha.bonus_defesa||[]).map(b=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 9px",background:C.surface3,border:`1px solid ${C.border}`,borderRadius:2,marginBottom:3,opacity:b.ativo?1:0.5}}>
                  <span style={{flex:1,fontSize:11,color:C.white}}>{b.nome}</span>
                  <span style={{fontSize:14,fontWeight:700,color:b.valor>=0?C.gold:C.red}}>{b.valor>=0?"+":""}{b.valor}</span>
                  <button onClick={()=>togBonusDef(b.id)} style={{padding:"2px 6px",background:"transparent",border:`1px solid ${C.border}`,color:b.ativo?C.gold:C.gray4,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit"}}>{b.ativo?"ON":"OFF"}</button>
                  <button onClick={()=>rmBonusDef(b.id)} style={btnRm}>✕</button>
                </div>
              ))}
            </div>
            <G2><Inp label="Dinheiro (R$)" v={ficha.dinheiro} s={v=>upd("dinheiro",Number(v))} type="number"/></G2>
            <div style={{marginTop:14}}>
              <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>PROGRESSÃO</div>
              <G2>
                <div>
                  <div style={{fontSize:9,color:C.gray4,marginBottom:5}}>NEX — <b style={{color:C.lime}}>{ficha.nex}%</b></div>
                  <input type="range" min={0} max={99} step={5} value={ficha.nex} onChange={e=>upd("nex",Number(e.target.value))} style={{width:"100%",accentColor:C.lime,marginBottom:3}}/>
                  <div style={{display:"flex",justifyContent:"space-between"}}>{[0,10,25,50,75,99].map(n=><span key={n} style={{fontSize:7,color:ficha.nex>=n?C.lime:C.gray5}}>{n}%</span>)}</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:C.gray4,marginBottom:5}}>NÍVEL — <b style={{color:C.lime}}>{ficha.nivel}</b></div>
                  <input type="range" min={1} max={20} step={1} value={ficha.nivel} onChange={e=>upd("nivel",Number(e.target.value))} style={{width:"100%",accentColor:C.lime,marginBottom:3}}/>
                  <div style={{display:"flex",justifyContent:"space-between"}}>{[1,5,10,15,20].map(n=><span key={n} style={{fontSize:7,color:ficha.nivel>=n?C.lime:C.gray5}}>Nv.{n}</span>)}</div>
                </div>
              </G2>
            </div>
            {ficha.classe&&(
              <div style={{marginTop:12,padding:"10px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:2}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:7}}>POR NÍVEL DE EXPOSIÇÃO (a cada 5% NEX)</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[[`+${CLASSES[ficha.classe].pv_nex} PV (+VIG)`,C.red],[`+${CLASSES[ficha.classe].pe_nex} PE (+PRE)`,C.blue],[`+${CLASSES[ficha.classe].san_nex} SAN`,C.purple]].map(([t,c])=>(
                    <div key={t} style={{padding:"5px 10px",background:C.surface,border:`1px solid ${C.border}`,borderBottom:`2px solid ${c}`,borderRadius:2}}><span style={{fontSize:12,fontWeight:700,color:c}}>{t}</span></div>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginTop:14}}>
              <div style={{fontSize:9,color:C.gray4,letterSpacing:3,marginBottom:10}}>CONDIÇÕES</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {Object.entries(ficha.status).map(([cond,ativo])=>(
                  <button key={cond} onClick={()=>setFicha(f=>({...f,status:{...f.status,[cond]:!ativo}}))}
                    style={{padding:"5px 11px",background:ativo?"rgba(224,80,80,0.15)":C.surface2,border:`1px solid ${ativo?C.red:C.border}`,color:ativo?C.red:C.gray4,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",letterSpacing:1}}>
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
          <Sec title="◫ INVENTÁRIO & RECURSOS DA ORDEM">
            {/* Cards de status da Ordem */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))",gap:10,marginBottom:18}}>
              {/* Patente */}
              <div style={{padding:"12px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${C.lime}`,borderRadius:3}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>PATENTE</div>
                <select value={ficha.patente} onChange={e=>upd("patente",e.target.value)}
                  style={{width:"100%",padding:"6px 8px",background:C.bg,border:`1px solid ${C.border}`,color:C.lime,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none",fontWeight:700}}>
                  {PATENTES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Limite de Crédito */}
              <div style={{padding:"12px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${C.gold}`,borderRadius:3}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>LIMITE DE CRÉDITO</div>
                <select value={ficha.limite_credito||"Baixo"} onChange={e=>upd("limite_credito",e.target.value)}
                  style={{width:"100%",padding:"6px 8px",background:C.bg,border:`1px solid ${C.border}`,color:C.gold,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none",fontWeight:700}}>
                  {["Baixo","Médio","Alto","Ilimitado"].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {/* Prestígio */}
              <div style={{padding:"12px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${C.purple}`,borderRadius:3}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:8,color:C.gray4,letterSpacing:2}}>PRESTÍGIO</div>
                  <div style={{fontSize:20,fontWeight:900,color:C.purple}}>{ficha.prestigio||0}</div>
                </div>
                <div style={{height:3,background:C.border,borderRadius:1,overflow:"hidden",marginBottom:7}}>
                  <div style={{width:`${((ficha.prestigio||0)/200)*100}%`,height:"100%",background:C.purple,transition:"width 0.3s"}}/>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {[[-5,"−5"],[-1,"−1"]].map(([v,l])=><button key={l} onClick={()=>upd("prestigio",Math.max(0,(ficha.prestigio||0)+v))} style={{flex:1,padding:"3px 0",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>{l}</button>)}
                  <input type="number" min={0} max={200} value={ficha.prestigio||0} onChange={e=>upd("prestigio",Math.max(0,Math.min(200,Number(e.target.value))))}
                    style={{width:42,padding:"3px 4px",textAlign:"center",background:C.bg,border:`1px solid ${C.border2}`,color:C.purple,borderRadius:2,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                  {[[1,"+1"],[5,"+5"]].map(([v,l])=><button key={l} onClick={()=>upd("prestigio",Math.min(200,(ficha.prestigio||0)+v))} style={{flex:1,padding:"3px 0",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>{l}</button>)}
                </div>
              </div>
              {/* Dinheiro */}
              <div style={{padding:"12px 14px",background:C.surface2,border:`1px solid ${C.border}`,borderBottom:`2px solid ${C.green}`,borderRadius:3}}>
                <div style={{fontSize:8,color:C.gray4,letterSpacing:2,marginBottom:8}}>DINHEIRO (R$)</div>
                <input type="number" value={ficha.dinheiro} onChange={e=>upd("dinheiro",Number(e.target.value))}
                  style={{width:"100%",padding:"6px 8px",background:C.bg,border:`1px solid ${C.border}`,color:C.green,borderRadius:2,fontSize:14,fontFamily:"inherit",outline:"none",fontWeight:700,boxSizing:"border-box"}}/>
              </div>
            </div>
            {/* Peso */}
            <div style={{fontSize:11,color:C.gray3,marginBottom:12}}>
              Peso: <b style={{color:C.white}}>{totalPeso.toFixed(1)}kg</b> / Cap.: <b style={{color:C.white}}>{ficha.atributos.FOR*5}kg</b>
              {totalPeso>ficha.atributos.FOR*5&&<span style={{color:C.red,marginLeft:10,fontSize:9}}>⚠ SOBRECARREGADO</span>}
            </div>
            <FormBx>
              <G2><Inp label="Nome" v={novoItem.nome} s={v=>setNovoItem(i=>({...i,nome:v}))} ph="Nome do item"/>
                <Slc label="Tipo" v={novoItem.tipo} s={v=>setNovoItem(i=>({...i,tipo:v}))} opts={["Arma","Proteção","Equipamento","Consumível","Relíquia","Munição","Outro"]}/>
              </G2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(90px,1fr))",gap:10,marginTop:10}}>
                <Inp label="Qtd" v={novoItem.qtd} s={v=>setNovoItem(i=>({...i,qtd:Number(v)}))} type="number"/>
                <Inp label="Peso kg" v={novoItem.peso} s={v=>setNovoItem(i=>({...i,peso:v}))}/>
                <Inp label="Dano / Detalhe" v={novoItem.desc} s={v=>setNovoItem(i=>({...i,desc:v}))} ph="2d6+2..."/>
              </div>
              <Btn onClick={addItem}>+ ADICIONAR</Btn>
            </FormBx>
            {ficha.inventario.length===0&&<Empty>Inventário vazio.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ficha.inventario.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.lime}`,borderRadius:2}}>
                  <div><span style={{fontSize:13,color:C.white,fontWeight:700}}>{item.nome}</span><span style={{fontSize:8,color:C.lime,letterSpacing:2,marginLeft:10}}>{item.tipo.toUpperCase()}</span>{item.desc&&<div style={{fontSize:9,color:C.gray4,marginTop:1}}>{item.desc}</div>}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center",color:C.gray4,fontSize:11}}><span>×{item.qtd}</span><span>{(parseFloat(item.peso)*item.qtd).toFixed(1)}kg</span><button onClick={()=>rmItem(item.id)} style={btnRm}>✕</button></div>
                </div>
              ))}
            </div>
          </Sec>
        )}

        {/* ── RITUAIS ── */}
        {aba==="rituais"&&(
          <Sec title="◌ RITUAIS CONHECIDOS">
            <FormBx>
              <G2><Inp label="Nome do Ritual" v={novoRitual.nome} s={v=>setNovoRitual(r=>({...r,nome:v}))}/>
                <Slc label="Elemento" v={novoRitual.elemento} s={v=>setNovoRitual(r=>({...r,elemento:v}))} opts={["Morte","Energia","Medo","Conhecimento","Sangue"]}/>
              </G2>
              <G2 mt><Slc label="Círculo" v={String(novoRitual.circulo)} s={v=>setNovoRitual(r=>({...r,circulo:Number(v)}))} opts={["1","2","3"]}/>
                <Inp label="Execução" v={novoRitual.execucao} s={v=>setNovoRitual(r=>({...r,execucao:v}))} ph="Padrão, Movimento..."/>
              </G2>
              <G2 mt><Inp label="Alcance" v={novoRitual.alcance} s={v=>setNovoRitual(r=>({...r,alcance:v}))} ph="9m, Toque..."/>
                <Inp label="Área" v={novoRitual.area} s={v=>setNovoRitual(r=>({...r,area:v}))} ph="Cubo 3m..."/>
              </G2>
              <G2 mt><Inp label="Alvo" v={novoRitual.alvo} s={v=>setNovoRitual(r=>({...r,alvo:v}))} ph="1 criatura..."/>
                <Inp label="Duração" v={novoRitual.duracao} s={v=>setNovoRitual(r=>({...r,duracao:v}))} ph="Instantâneo..."/>
              </G2>
              <G2 mt><Inp label="Resistência" v={novoRitual.resistencia} s={v=>setNovoRitual(r=>({...r,resistencia:v}))} ph="Fortitude..."/>
                <Inp label="Dados Base" v={novoRitual.dados} s={v=>setNovoRitual(r=>({...r,dados:v}))} ph="2d6..."/>
              </G2>
              <G2 mt><Inp label="Dados Discente" v={novoRitual.dados_discente} s={v=>setNovoRitual(r=>({...r,dados_discente:v}))} ph="Discente..."/>
                <Inp label="Dados Verdadeiro" v={novoRitual.dados_verdadeiro} s={v=>setNovoRitual(r=>({...r,dados_verdadeiro:v}))} ph="Verdadeiro..."/>
              </G2>
              <div style={{marginTop:10}}><TxtA label="Efeito / Descrição Completa" v={novoRitual.efeito} s={v=>setNovoRitual(r=>({...r,efeito:v}))} rows={3}/></div>
              <Btn onClick={addRitual}>+ REGISTRAR RITUAL</Btn>
            </FormBx>
            {ficha.rituais.length===0&&<Empty>Nenhum ritual registrado.</Empty>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {ficha.rituais.map(r=>{
                const ec=ELEMENTO_COR[r.elemento]||{border:C.gray3,bg:"transparent",text:C.gray3};
                return(
                  <div key={r.id} style={{padding:"12px 14px",background:ec.bg,border:`1px solid ${ec.border}`,borderLeft:`3px solid ${ec.border}`,borderRadius:3}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:14,fontWeight:700,color:C.white}}>{r.nome}</div><div style={{fontSize:8,color:ec.text,letterSpacing:2}}>CÍRCULO {r.circulo} · {r.elemento.toUpperCase()}</div></div>
                      <button onClick={()=>rmRitual(r.id)} style={btnRm}>✕</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px,1fr))",gap:4}}>
                      {[["Execução",r.execucao],["Alcance",r.alcance],["Área",r.area],["Alvo",r.alvo],["Duração",r.duracao],["Resistência",r.resistencia],["Dados",r.dados],["Discente",r.dados_discente],["Verdadeiro",r.dados_verdadeiro]].filter(([,v])=>v).map(([l,v])=>(
                        <div key={l} style={{padding:"4px 6px",background:"rgba(0,0,0,0.4)",borderRadius:2}}><div style={{fontSize:7,color:C.gray4}}>{l.toUpperCase()}</div><div style={{fontSize:10,color:C.gray1}}>{v}</div></div>
                      ))}
                    </div>
                    {r.efeito&&<div style={{marginTop:7,padding:"7px 9px",background:"rgba(0,0,0,0.4)",borderRadius:2,fontSize:11,color:C.gray2,lineHeight:1.7}}>{r.efeito}</div>}
                    {r.dados&&<div style={{marginTop:6}}><button onClick={()=>rolar(r.dados,r.nome)} style={{padding:"4px 10px",background:ec.bg,border:`1px solid ${ec.border}`,color:ec.text,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit"}}>⬡ ROLAR {r.dados}</button></div>}
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
            <div style={{marginTop:22}}>
              <div style={{fontSize:8,color:C.gray4,letterSpacing:3,marginBottom:10}}>EXPORTAR / IMPORTAR</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <Btn onClick={()=>{const blob=new Blob([JSON.stringify(ficha,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${ficha.nome||"agente"}_op.json`;a.click();}}>⬇ EXPORTAR JSON</Btn>
                <label style={{marginTop:10,padding:"7px 13px",background:"transparent",border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2}}>
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
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"5px 16px",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          {[{l:"PV",a:ficha.pv_atual,m:pvTotal,c:C.red},{l:"PE",a:ficha.pe_atual,m:peTotal,c:C.blue},{l:"SAN",a:ficha.san_atual,m:sanMax,c:C.purple}].map(r=>(
            <div key={r.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:8,color:r.c,fontWeight:700,minWidth:20,letterSpacing:1}}>{r.l}</span>
              <div style={{width:46,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}><div style={{width:`${r.m>0?Math.min(100,(r.a/r.m)*100):0}%`,height:"100%",background:r.c}}/></div>
              <span style={{fontSize:8,color:C.gray4}}>{r.a}/{r.m}</span>
            </div>
          ))}
          <span style={{fontSize:8,color:C.gold}}>DEF {defesa}</span>
          <span style={{flex:1}}/>
          {ficha.transformacao?.ativa&&<span style={{fontSize:8,color:C.lime,border:`1px solid ${C.lime}`,padding:"1px 5px",borderRadius:2}}>◬ {ficha.transformacao.nome}</span>}
          <span style={{fontSize:8,color:C.lime,letterSpacing:2}}>NEX {ficha.nex}%</span>
          <span style={{fontSize:8,color:C.purple}}>{ficha.prestigio||0} ★</span>
          <span style={{fontSize:8,color:C.gray4}}>NV.{ficha.nivel}</span>
          <span style={{fontSize:8,color:C.gray5,letterSpacing:2}}>{ficha.classe?.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

// ─── MICRO COMPONENTES ────────────────────────────────────────────────────────
function StepCard({step,title,active,done,children}) {
  return (
    <div style={{marginBottom:14,padding:18,background:C.surface2,border:`1px solid ${done?C.lime:active?C.lime:C.border}`,borderLeft:`3px solid ${done?C.lime:active?C.lime:C.gray5}`,borderRadius:3,opacity:!active&&!done?0.5:1}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:done?C.lime:active?C.limeFade2:C.gray5,border:`1px solid ${done||active?C.lime:C.gray4}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:done?C.bg:active?C.lime:C.gray4,flexShrink:0}}>{done?"✓":step}</div>
        <div style={{fontSize:9,letterSpacing:3,color:done||active?C.lime:C.gray4}}>PASSO {step} — {title}</div>
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
        style={{padding:"7px 9px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
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
        style={{padding:"7px 9px",background:C.bg,border:`1px solid ${C.border}`,color:C.white,borderRadius:2,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.7}}/>
    </div>
  );
}
function Btn({children,onClick,col}) {
  const color=col||C.lime;
  return <button onClick={onClick} style={{marginTop:10,padding:"7px 14px",background:`rgba(${color==="#c8f55a"?"200,245,90":color==="#d0a040"?"208,160,64":"200,245,90"},0.08)`,border:`1px solid ${color}`,color,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2}}>{children}</button>;
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
          {temp>0&&<span style={{fontSize:8,color,border:`1px solid ${color}`,padding:"0 5px",borderRadius:2,marginLeft:8,opacity:0.7}}>+{temp} TEMP</span>}
        </div>
        <span style={{fontSize:14,fontWeight:900,color}}>{atual}<span style={{color:C.gray4}}>/{max}</span></span>
      </div>
      <div style={{height:3,background:C.border,borderRadius:1,overflow:"hidden",marginBottom:9}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,transition:"width 0.3s"}}/>
      </div>
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
        {[[-5,"−5"],[-1,"−1"]].map(([val,lbl])=>(<button key={lbl} onClick={()=>onChange(atual+val)} style={{padding:"4px 7px",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>{lbl}</button>))}
        <input type="number" value={atual} onChange={e=>onChange(Number(e.target.value))} min={0} max={max}
          style={{width:48,padding:"4px 5px",textAlign:"center",background:C.bg,border:`1px solid ${C.border2}`,color:C.white,borderRadius:2,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        {[[1,"+1"],[5,"+5"]].map(([val,lbl])=>(<button key={lbl} onClick={()=>onChange(atual+val)} style={{padding:"4px 7px",background:C.bg,border:`1px solid ${C.border}`,color:C.gray3,cursor:"pointer",borderRadius:2,fontSize:10,fontFamily:"inherit"}}>{lbl}</button>))}
        <button onClick={()=>onChange(max)} style={{padding:"4px 9px",background:"transparent",border:`1px solid ${color}`,color,cursor:"pointer",borderRadius:2,fontSize:8,fontFamily:"inherit",letterSpacing:1,marginLeft:3}}>MAX</button>
      </div>
    </div>
  );
}

const btnLime={padding:"7px 14px",background:C.limeFade,border:`1px solid ${C.lime}`,color:C.lime,cursor:"pointer",borderRadius:2,fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:2};
const btnRm={padding:"3px 6px",background:"transparent",border:`1px solid rgba(224,80,80,0.25)`,color:C.red,cursor:"pointer",borderRadius:2,fontSize:10};
