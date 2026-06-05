// ========================================
// TRONO DAS SOMBRAS - SCRIPT.JS (ATUALIZADO)
// Tema Medieval Premium - Com Ações Universais
// ========================================
window.onerror = function(msg, url, line){
    alert("Erro JS: " + msg + " Linha: " + line);
};

// ------------------------
// CARTAS
// ------------------------
const CARTAS = {
    Cavaleiro: { nome: "Cavaleiro", icone: "⚔️", custo: 3, descricao: "Causa 1 de dano." },
    Guarda: { nome: "Guarda", icone: "🛡️", custo: 0, descricao: "Bloqueia ataques." },
    Mago: { nome: "Mago", icone: "🧙", custo: 4, descricao: "Revela uma carta." },
    Rei: { nome: "Rei", icone: "👑", custo: 3, descricao: "Troca uma carta." },
    Assassino: { nome: "Assassino", icone: "🗡️", custo: 4, descricao: "Remove uma carta." },
    Comerciante: { nome: "Comerciante", icone: "💰", custo: 0, descricao: "Recebe 3 moedas." }
};

// ------------------------
// ESTADO
// ------------------------
let jogador;
let ia;
let turnoJogador = true;
let cartaSelecionada = null;
let cartaDeclaradaAtual = null;

const challengeModal = document.getElementById("challengeModal");
const challengeText = document.getElementById("challengeText");

// ------------------------
// CLASSE JOGADOR
// ------------------------
class Jogador {
    constructor(nome){
        this.nome = nome;
        this.vida = 3;
        this.moedas = 2;
        this.cartas = [];
        this.comprarCarta();
        this.comprarCarta();
    }

    comprarCarta(){
        const nomes = Object.keys(CARTAS);
        const sorteada = nomes[Math.floor(Math.random() * nomes.length)];
        this.cartas.push(sorteada);
    }

    perderCarta(indice){
        if (indice >= 0 && indice < this.cartas.length) {
            this.cartas.splice(indice, 1);
        }
    }
}

// ------------------------
// INICIAR
// ------------------------
window.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    if(startBtn) startBtn.addEventListener("click", iniciarPartida);

    const closeMageBtn = document.getElementById("closeMageModal");
    if(closeMageBtn){
        closeMageBtn.addEventListener("click", () => {
            document.getElementById("mageModal").classList.add("hidden");
        });
    }
});

function iniciarPartida(){
    jogador = new Jogador("Jogador");
    ia = new Jogador("IA");
    
    document.getElementById("menuScreen").classList.remove("active");
    document.getElementById("gameScreen").classList.add("active");
    
    renderizarTudo();
    log("🏰 A disputa pelo trono começou.");
}

// ------------------------
// RENDER
// ------------------------
function renderizarTudo(){
    atualizarStatus();
    renderizarCartasJogador();
    renderizarCartasIA();
}

function atualizarStatus(){
    document.getElementById("playerLife").innerText = "❤️ " + jogador.vida;
    document.getElementById("playerCoins").innerText = "🪙 " + jogador.moedas;
    document.getElementById("aiLife").innerText = "❤️ " + ia.vida;
    document.getElementById("aiCoins").innerText = "🪙 " + ia.moedas;
}

function renderizarCartasJogador(){
    const area = document.getElementById("playerCards");
    area.innerHTML = "";

    jogador.cartas.forEach((carta, index) => {
        const dados = CARTAS[carta];
        const div = document.createElement("div");
        div.className = "card";
        if(cartaSelecionada === index) div.className += " selected";

        div.innerHTML = `
            <div class="card-title">${dados.nome}</div>
            <div class="card-cost">🪙 ${dados.custo}</div>
            <div class="card-icon">${dados.icone}</div>
            <div class="card-desc">${dados.descricao}</div>
        `;
        div.onclick = () => selecionarCarta(index);
        area.appendChild(div);
    });
}

function renderizarCartasIA(){
    const area = document.getElementById("aiCards");
    area.innerHTML = "";
    ia.cartas.forEach(() => {
        const carta = document.createElement("div");
        carta.className = "card back-card";
        area.appendChild(carta);
    });
}

function selecionarCarta(indice){
    cartaSelecionada = indice;
    const nome = jogador.cartas[indice];
    log("🃏 Carta de troca selecionada: " + nome);
    renderizarCartasJogador();
}

function log(texto){
    const logArea = document.getElementById("gameLog");
    const linha = document.createElement("div");
    linha.className = "log-entry";
    linha.innerText = texto;
    logArea.appendChild(linha);
    logArea.scrollTop = logArea.scrollHeight;
}

// ------------------------
// BOTÕES DE AÇÃO (ATUALIZADO)
// ------------------------
document.querySelectorAll(".action-btn").forEach(botao => {
    botao.addEventListener("click", () => {
        if(!turnoJogador) return;

        // Gerencia as novas Ações Universais (sem necessidade de cartas/blefes)
        if(botao.dataset.universal) {
            const acaoUniversal = botao.dataset.universal;
            executarAcaoUniversalJogador(acaoUniversal);
        } else {
            // Ações padrões de cartas
            const carta = botao.dataset.card;
            usarAcao(carta);
        }
    });
});

// --- LÓGICA DAS AÇÕES UNIVERSAIS ---
function executarAcaoUniversalJogador(acao) {
    if(acao === "Taxar") {
        jogador.moedas += 1;
        log("🪙 AÇÃO UNIVERSAL: Você coletou 1 moeda de taxa do vilarejo (Ação segura, sem blefe).");
        finalizarTurnoEstrutura();
    } 
    else if(acao === "Golpe") {
        if(jogador.moedas < 7) {
            log("❌ Moedas insuficientes para o Golpe Supremo. Requer 🪙 7.");
            return;
        }
        if(ia.cartas.length === 0) return;

        jogador.moedas -= 7;
        ia.vida--;
        ia.perderCarta(0); // Remove permanentemente a carta da IA
        log("💥 GOLPE SUPREMO! Você pagou 7 moedas e desferiu um ataque indefensável. IA perdeu 1 vida e 1 carta!");
        
        finalizarTurnoEstrutura();
    }
}

function usarAcao(nomeCarta){
    if(!turnoJogador) return;

    const custo = CARTAS[nomeCarta].custo;
    if(jogador.moedas < custo){
        log(`❌ Moedas insuficientes para usar ${nomeCarta} (Custa 🪙 ${custo}).`);
        return;
    }

    if(nomeCarta === "Rei" && cartaSelecionada === null){
        log("👑 Erro: Selecione uma de suas cartas clicando nela antes de ativar o Rei.");
        return;
    }

    cartaDeclaradaAtual = nomeCarta;
    abrirModalDesafio();
}

function abrirModalDesafio(){
    challengeText.innerText = `Você declarou ${cartaDeclaradaAtual}.\nA IA está avaliando se você está blefando...`;
    challengeModal.classList.remove("hidden");

    setTimeout(() => {
        const desafia = iaDecideDesafio(cartaDeclaradaAtual);
        challengeModal.classList.add("hidden");
        resolverJogadaJogador(cartaDeclaradaAtual, desafia);
    }, 1500);
}

// ------------------------
// INTELIGÊNCIA ARTIFICIAL
// ------------------------
function iaDecideDesafio(carta){
    let possui = jogador.cartas.includes(carta);
    if(possui){
        return Math.random() < 0.15; 
    }
    return Math.random() < 0.60; 
}

// ------------------------
// RESOLUÇÃO DE JOGADAS DO JOGADOR
// ------------------------
function resolverJogadaJogador(carta, desafia){
    let possui = jogador.cartas.includes(carta);

    if(desafia){
        log("🤖 IA desafiou sua declaração!");
        if(possui){
            ia.vida--;
            log("✅ Você falou a verdade! IA perdeu 1 vida pelo desafio errado.");
            executarPoderJogador(carta);
        } else {
            jogador.vida--;
            log("❌ Seu blefe foi descobri! Você perdeu 1 vida.");
            if(jogador.cartas.length > 0) jogador.perderCarta(0);
            finalizarTurnoEstrutura();
        }
    } else {
        log("🤖 IA aceitou sua declaração.");
        executarPoderJogador(carta);
    }
}

function ejecutarPoderJogador(carta){
    jogador.moedas -= CARTAS[carta].custo;

    if(carta === "Cavaleiro" || carta === "Assassino") {
        // Mecânica de Reação do Guarda pela IA
        let iaTemGuarda = ia.cartas.includes("Guarda");
        let iaUsaGuarda = iaTemGuarda ? Math.random() < 0.85 : Math.random() < 0.30; 

        if(iaUsaGuarda) {
            log(`🛡️ REAÇÃO: A IA declarou ter um Guarda para bloquear seu ${carta}!`);
            let desafiarGuarda = confirm(`A IA declarou REAÇÃO de Guarda contra seu ${carta}.\nDeseja desafiar o Guarda dela?`);
            
            if(desafiarGuarda) {
                if(iaTemGuarda) {
                    log("❌ A IA realmente tinha o Guarda! Seu ataque foi bloqueado e você perdeu 1 vida.");
                    jogador.vida--;
                    if(jogador.cartas.length > 0) jogador.perderCarta(0);
                } else {
                    log("✅ Você desmascarou o blefe! A IA não tinha o Guarda. O ataque passa!");
                    ia.vida--;
                    if(ia.cartas.length > 0) ia.perderCarta(0);
                    aplicarEfeitoAtaqueJogador(carta);
                }
            } else {
                log("🛡️ Você aceitou o Guarda da IA. Seu ataque foi mitigado.");
            }
        } else {
            aplicarEfeitoAtaqueJogador(carta);
        }
    } else {
        if(carta === "Comerciante") {
            jogador.moedas += 3;
            log("💰 Você recebeu 3 moedas do Comerciante.");
        } else if(carta === "Mago") {
            usarMago();
        } else if(carta === "Rei") {
            usarRei();
        }
    }

    finalizarTurnoEstrutura();
}

function aplicarEfeitoAtaqueJogador(tipoAtaque) {
    if(ia.cartas.length === 0) return;
    
    if(tipoAtaque === "Cavaleiro") {
        ia.vida--;
        log("⚔️ Cavaleiro desferiu um golpe! IA perdeu 1 vida.");
    } else if(tipoAtaque === "Assassino") {
        ia.vida--;
        ia.perderCarta(0); 
        log("🗡️ O Assassino eliminou com sucesso uma das cartas da IA.");
    }
}

function usarMago(){
    if(ia.cartas.length === 0) return;
    const indice = Math.floor(Math.random() * ia.cartas.length);
    document.getElementById("revealedCard").innerText = `A carta vista foi: ${ia.cartas[indice]}`;
    document.getElementById("mageModal").classList.remove("hidden");
    log("🔮 Mago revelou uma visão dos aposentos da IA.");
}

function usarRei(){
    if(ia.cartas.length === 0 || cartaSelecionada === null) return;

    const indiceIA = Math.floor(Math.random() * ia.cartas.length);
    
    let cartaJogador = jogador.cartas[cartaSelecionada];
    let cartaIA = ia.cartas[indiceIA];

    jogador.cartas[cartaSelecionada] = cartaIA;
    ia.cartas[indiceIA] = cartaJogador;

    log(`👑 Rei realizou a troca da sua carta selecionada por uma da IA.`);
    cartaSelecionada = null;
}

function finalizarTurnoEstrutura() {
    atualizarStatus();
    verificarVitoria();
    if(ia.vida > 0 && jogador.vida > 0) passarTurno();
}

// ------------------------
// FLUXO DE TURNOS (ATUALIZADO PARA IA CONHECER AS NOVAS AÇÕES)
// ------------------------
function passarTurno(){
    turnoJogador = false;
    document.getElementById("turnText").innerText = "Turno da IA";
    setTimeout(turnoIA, 2000);
}

function turnoIA(){
    if(ia.vida <= 0) return;
    
    ia.moedas += 2; 
    
    // Prioridade Absoluta da IA: Se tiver moedas para o Golpe Supremo, ela joga sem hesitar
    if(ia.moedas >= 7) {
        ia.moedas -= 7;
        jogador.vida--;
        jogador.perderCarta(0); // Elimina uma carta sua sem direito a resposta
        log("💥 🤖 IA DESFERIU UM GOLPE SUPREMO! Ataque indefensável: você perdeu 1 vida e 1 carta.");
        
        atualizarStatus();
        verificarVitoria();
        if(jogador.vida > 0 && ia.vida > 0) passarParaProximoTurnoJogador();
        return;
    }

    let chance = Math.random();
    let declarada;

    // Decisão de jogada inteligente baseada em moedas e probabilidades
    if(ia.moedas >= 4 && chance < 0.4){
        declarada = "Assassino";
    } else if(ia.moedas >= 3 && chance < 0.7){
        declarada = "Cavaleiro";
    } else if(chance < 0.85) {
        declarada = "Comerciante";
    } else {
        // IA escolhe usar a ação universal de coletar taxa básica (+1 moeda segura)
        ia.moedas += 1;
        log("🪙 🤖 IA usou a Ação Universal: Coletar Taxa (+1 moeda de forma segura).");
        atualizarStatus();
        passarParaProximoTurnoJogador();
        return;
    }

    log(`🤖 IA declarou agir com: ${declarada}`);

    setTimeout(() => {
        const desafiar = confirm(`A IA declarou usar o ${declarada}.\nDeseja desafiar o blefe dela?`);
        resolverJogadaIA(declarada, desafiar);
    }, 1200);
}

function resolverJogadaIA(carta, desafiar){
    let possui = ia.cartas.includes(carta);

    if(desafiar){
        if(possui){
            log("❌ A IA provou a verdade! Você perdeu o desafio e 1 vida.");
            jogador.vida--;
            if(jogador.cartas.length > 0) jogador.perderCarta(0);
            ejecutarPoderIA(carta);
        } else {
            log("✅ Excelente! Pegou o blefe da IA. Ela perdeu 1 vida.");
            ia.vida--;
            if(ia.cartas.length > 0) ia.perderCarta(0);
            passarParaProximoTurnoJogador();
        }
    } else {
        ejecutarPoderIA(carta);
    }
}

function ejecutarPoderIA(carta){
    ia.moedas -= CARTAS[carta].custo;

    if(carta === "Cavaleiro" || carta === "Assassino") {
        // REAÇÃO MANUAL DO JOGADOR
        let querReagir = confirm(`🤖 IA está te atacando com ${carta}!\nDeseja declarar REAÇÃO com um Guarda para bloquear?`);
        
        if(querReagir) {
            log("🛡️ Você declarou reação de Guarda!");
            let iaDesafiaGuarda = Math.random() < 0.40; 
            let jogadorTemGuarda = jogador.cartas.includes("Guarda");

            if(iaDesafiaGuarda) {
                log("🤖 A IA resolveu checar seu Guarda e desafiou!");
                if(jogadorTemGuarda) {
                    log("✅ Você tinha o Guarda! O ataque da IA falhou e ela perdeu 1 vida.");
                    ia.vida--;
                    if(ia.cartas.length > 0) ia.perderCarta(0);
                } else {
                    log("❌ Pego no Blefe! Você não tinha o Guarda. Perdeu 1 vida do desafio e o ataque te acerta.");
                    jogador.vida--;
                    if(jogador.cartas.length > 0) jogador.perderCarta(0);
                    aplicarEfeitoAtaqueIA(carta);
                }
            } else {
                log("🤖 IA aceitou seu Guarda com cautela. Ataque anulado.");
            }
        } else {
            aplicarEfeitoAtaqueIA(carta);
        }
    } else {
        if(carta === "Comerciante") {
            ia.moedas += 3;
            log("💰 IA coletou tributos do Comerciante.");
        } else if(carta === "Rei") {
            if(ia.cartas.length > 0 && jogador.cartas.length > 0) {
                const idxIA = Math.floor(Math.random() * ia.cartas.length);
                const idxJ = Math.floor(Math.random() * jogador.cartas.length);
                let tmp = ia.cartas[idxIA];
                ia.cartas[idxIA] = jogador.cartas[idxJ];
                jogador.cartas[idxJ] = tmp;
                log("👑 A IA usou o Rei e trocou uma carta misteriosa com você.");
            }
        }
    }

    atualizarStatus();
    verificarVitoria();
    if(jogador.vida > 0 && ia.vida > 0) passarParaProximoTurnoJogador();
}

function aplicarEfeitoAtaqueIA(tipoAtaque) {
    if(jogador.cartas.length === 0) return;

    if(tipoAtaque === "Cavaleiro") {
        jogador.vida--;
        log("⚔️ O Cavaleiro da IA transpôs suas defesas. Você perdeu 1 vida.");
    } else if(tipoAtaque === "Assassino") {
        jogador.vida--;
        jogador.perderCarta(0); 
        log("🗡️ O Assassino da IA eliminou uma de suas cartas de jogo.");
    }
}

function passarParaProximoTurnoJogador(){
    turnoJogador = true;
    jogador.moedas += 2; 
    document.getElementById("turnText").innerText = "Seu Turno";
    renderizarTudo();
}

// ------------------------
// FIM DE JOGO
// ------------------------
function verificarVitoria(){
    if(jogador.vida <= 0 || jogador.cartas.length === 0){
        mostrarFim("💀 Derrota", "As conspirações venceram. Você perdeu o Trono.");
    } else if(ia.vida <= 0 || ia.cartas.length === 0){
        mostrarFim("🏆 Vitória", "Sua dinastia triunfou sobre o Trono das Sombras!");
    }
}

function mostrarFim(titulo, texto){
    document.getElementById("victoryTitle").innerText = titulo;
    document.getElementById("victoryText").innerText = texto;
    document.getElementById("victoryModal").classList.remove("hidden");
}
