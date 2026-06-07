// ========================================
// TRONO DAS SOMBRAS - SCRIPT.JS
// ========================================
window.onerror = function(msg, url, line){
    console.error("Erro JS: " + msg + " Linha: " + line);
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
let jogoAtivo = true;
let aguardandoDesafio = false;

const challengeModal = document.getElementById("challengeModal");
const challengeText = document.getElementById("challengeText");
const challengeYesBtn = document.getElementById("challengeYes");
const challengeNoBtn = document.getElementById("challengeNo");

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

    // --- Lógica do Novo Modal: Como Jogar ---
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const rulesModal = document.getElementById("rulesModal");
    const closeRulesModal = document.getElementById("closeRulesModal");

    if(howToPlayBtn) {
        howToPlayBtn.addEventListener("click", () => {
            rulesModal.classList.remove("hidden");
        });
    }

    if(closeRulesModal) {
        closeRulesModal.addEventListener("click", () => {
            rulesModal.classList.add("hidden");
        });
    }
    // -----------------------------------------

    const closeMageBtn = document.getElementById("closeMageModal");
    if(closeMageBtn){
        closeMageBtn.addEventListener("click", () => {
            document.getElementById("mageModal").classList.add("hidden");
        });
    }

    // Configurar botões de desafio (Apenas usados quando a IA joga)
    if(challengeYesBtn) challengeYesBtn.addEventListener("click", () => {
        if(aguardandoDesafio) {
            aguardandoDesafio = false;
            challengeModal.classList.add("hidden");
            resolverJogadaIA(cartaDeclaradaAtual, true);
        }
    });
    if(challengeNoBtn) challengeNoBtn.addEventListener("click", () => {
        if(aguardandoDesafio) {
            aguardandoDesafio = false;
            challengeModal.classList.add("hidden");
            resolverJogadaIA(cartaDeclaradaAtual, false);
        }
    });
});

function iniciarPartida(){
    jogador = new Jogador("Jogador");
    ia = new Jogador("IA");
    jogoAtivo = true;
    turnoJogador = true;
    aguardandoDesafio = false;
    
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
        if(cartaSelecionada === index) div.classList.add("selected");

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
    if(!turnoJogador || jogoAtivo === false) return;
    cartaSelecionada = indice;
    const nome = jogador.cartas[indice];
    log("🃏 Carta selecionada: " + nome);
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
// BOTÕES DE AÇÃO
// ------------------------
document.querySelectorAll(".action-btn").forEach(botao => {
    botao.addEventListener("click", () => {
        if(!turnoJogador || !jogoAtivo || aguardandoDesafio) return;

        if(botao.dataset.universal) {
            const acaoUniversal = botao.dataset.universal;
            executarAcaoUniversalJogador(acaoUniversal);
        } else {
            const carta = botao.dataset.card;
            usarAcao(carta);
        }
    });
});

// --- LÓGICA DAS AÇÕES UNIVERSAIS ---
function executarAcaoUniversalJogador(acao) {
    if(acao === "Taxar") {
        jogador.moedas += 1;
        log("🪙 AÇÃO UNIVERSAL: Você coletou 1 moeda (Ação segura, sem blefe).");
        atualizarStatus();
        finalizarTurnoJogador();
    } 
    else if(acao === "Golpe") {
        if(jogador.moedas < 7) {
            log("❌ Moedas insuficientes para o Golpe Supremo. Requer 🪙 7.");
            return;
        }

        jogador.moedas -= 7;
        ia.vida--;
        log("💥 GOLPE SUPREMO! Você pagou 7 moedas e desferiu um ataque devastador. IA perdeu 1 vida!");
        
        atualizarStatus();
        verificarVitoria();
        if(jogoAtivo) finalizarTurnoJogador();
    }
}

function usarAcao(nomeCarta){
    if(!turnoJogador || !jogoAtivo || aguardandoDesafio) return;

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

// Resolução IA
function abrirModalDesafio(){
    challengeText.innerText = `Você declarou: ${cartaDeclaradaAtual}\n🤖 A IA está avaliando se você está blefando...`;
    
    if(challengeYesBtn) challengeYesBtn.style.display = "none";
    if(challengeNoBtn) challengeNoBtn.style.display = "none";
    
    challengeModal.classList.remove("hidden");

    setTimeout(() => {
        const desafia = iaDecideDesafio(cartaDeclaradaAtual);
        challengeModal.classList.add("hidden");
        
        if(challengeYesBtn) challengeYesBtn.style.display = "";
        if(challengeNoBtn) challengeNoBtn.style.display = "";
        
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
            atualizarStatus();
            verificarVitoria();
            if(jogoAtivo) executarPoderJogador(carta);
        } else {
            jogador.vida--;
            log("❌ Seu blefe foi descoberto! Você perdeu 1 vida.");
            atualizarStatus();
            verificarVitoria();
            if(jogoAtivo) finalizarTurnoJogador();
        }
    } else {
        log("🤖 IA aceitou sua declaração.");
        executarPoderJogador(carta);
    }
}

function executarPoderJogador(carta){
    if(!jogoAtivo) return;
    
    jogador.moedas -= CARTAS[carta].custo;

    if(carta === "Cavaleiro" || carta === "Assassino") {
        let iaTemGuarda = ia.cartas.includes("Guarda");
        let iaUsaGuarda = iaTemGuarda ? Math.random() < 0.85 : Math.random() < 0.30; 

        if(iaUsaGuarda) {
            log(`🛡️ REAÇÃO: A IA declarou um Guarda para bloquear seu ${carta}!`);
            let desafiarGuarda = confirm(`A IA declarou REAÇÃO de Guarda contra seu ${carta}.\nDeseja desafiar?`);
            
            if(desafiarGuarda) {
                if(iaTemGuarda) {
                    log("❌ A IA realmente tinha Guarda! Seu ataque foi bloqueado.");
                } else {
                    log("✅ Você desmascarou o blefe! O ataque passa!");
                    ia.vida--;
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

    atualizarStatus();
    verificarVitoria();
    if(jogoAtivo) finalizarTurnoJogador();
}

function aplicarEfeitoAtaqueJogador(tipoAtaque) {
    if(tipoAtaque === "Cavaleiro") {
        ia.vida--;
        log("⚔️ Cavaleiro causou 1 de dano.");
    }

    if(tipoAtaque === "Assassino") {
        if(ia.cartas.length > 0){
            let indice = Math.floor(Math.random() * ia.cartas.length);
            let removida = ia.cartas[indice];
            ia.perderCarta(indice);
            log(`🗡️ Assassino eliminou a carta ${removida}.`);
        }
    }
    renderizarTudo();
}

function usarMago(){
    const indice = Math.floor(Math.random() * ia.cartas.length);
    document.getElementById("revealedCard").innerText = `Carta revelada: ${ia.cartas[indice]}`;
    document.getElementById("mageModal").classList.remove("hidden");
    log("🔮 Mago revelou uma carta da IA!");
}

function usarRei(){
    const indiceIA = Math.floor(Math.random() * ia.cartas.length);
    
    let cartaJogador = jogador.cartas[cartaSelecionada];
    let cartaIA = ia.cartas[indiceIA];

    jogador.cartas[cartaSelecionada] = cartaIA;
    ia.cartas[indiceIA] = cartaJogador;

    log(`👑 Rei realizou a troca de cartas!`);
    cartaSelecionada = null;
    renderizarCartasJogador();
}

function finalizarTurnoJogador() {
    if(!jogoAtivo) return;
    turnoJogador = false;
    cartaSelecionada = null;
    document.getElementById("turnText").innerText = "Turno da IA";
    renderizarCartasJogador();
    setTimeout(turnoIA, 2000);
}

// ------------------------
// FLUXO DE TURNOS
// ------------------------
function turnoIA(){
    if(!jogoAtivo || ia.vida <= 0 || jogador.vida <= 0) return;
    
    ia.moedas += 2; 
    
    if(ia.moedas >= 7 && Math.random() < 0.6) {
        ia.moedas -= 7;
        jogador.vida--;
        log("💥 🤖 IA DESFERIU UM GOLPE SUPREMO! Você perdeu 1 vida.");
        
        atualizarStatus();
        verificarVitoria();
        if(jogoAtivo) passarParaProximoTurnoJogador();
        return;
    }

    let chance = Math.random();
    let declarada;

    if(ia.moedas >= 4 && chance < 0.4){
        declarada = "Assassino";
    } else if(ia.moedas >= 3 && chance < 0.7){
        declarada = "Cavaleiro";
    } else if(chance < 0.85) {
        declarada = "Comerciante";
    } else {
        ia.moedas += 1;
        log("🪙 🤖 IA coletou 1 moeda (Ação segura).");
        atualizarStatus();
        passarParaProximoTurnoJogador();
        return;
    }

    log(`🤖 IA declarou: ${declarada}`);
    cartaDeclaradaAtual = declarada;

    // Quando a IA joga: VOCÊ pensa (Botões visíveis)
    setTimeout(() => {
        aguardandoDesafio = true;
        challengeText.innerText = `A IA declarou usar o ${declarada}.\n\nDeseja desafiar o blefe dela?`;
        
        if(challengeYesBtn) challengeYesBtn.style.display = "";
        if(challengeNoBtn) challengeNoBtn.style.display = "";
        
        challengeModal.classList.remove("hidden");
    }, 1200);
}

// ------------------------
// RESOLUÇÃO DE JOGADAS DA IA
// ------------------------
function resolverJogadaIA(carta, desafiar){
    let possui = ia.cartas.includes(carta);

    if(desafiar){
        if(possui){
            log("❌ A IA provou a verdade! Você perdeu o desafio e 1 vida.");
            jogador.vida--;
            atualizarStatus();
            verificarVitoria();
            if(jogoAtivo) executarPoderIA(carta);
        } else {
            log("✅ Você pegou o blefe da IA! IA perdeu 1 vida.");
            ia.vida--;
            atualizarStatus();
            verificarVitoria();
            if(jogoAtivo) passarParaProximoTurnoJogador();
        }
    } else {
        executarPoderIA(carta);
    }
}

function executarPoderIA(carta){
    if(!jogoAtivo) return;
    
    ia.moedas -= CARTAS[carta].custo;

    if(carta === "Cavaleiro" || carta === "Assassino") {
        let querReagir = confirm(`🤖 IA está te atacando com ${carta}!\nDeseja declarar REAÇÃO de Guarda?`);
        
        if(querReagir) {
            log("🛡️ Você declarou reação de Guarda!");
            let iaDesafiaGuarda = Math.random() < 0.40; 
            let jogadorTemGuarda = jogador.cartas.includes("Guarda");

            if(iaDesafiaGuarda) {
                log("🤖 IA desafiou seu Guarda!");
                if(jogadorTemGuarda) {
                    log("✅ Você tinha Guarda! O ataque falhou e IA perdeu 1 vida.");
                    ia.vida--;
                } else {
                    log("❌ Seu blefe foi descoberto! Você perdeu 1 vida e o ataque te acerta.");
                    jogador.vida--;
                    aplicarEfeitoAtaqueIA(carta);
                }
            } else {
                log("🤖 IA aceitou seu Guarda. Ataque anulado.");
            }
        } else {
            aplicarEfeitoAtaqueIA(carta);
        }
    } else {
        if(carta === "Comerciante") {
            ia.moedas += 3;
            log("💰 IA coletou tributos com o Comerciante.");
        } else if(carta === "Rei") {
            if(ia.cartas.length > 0 && jogador.cartas.length > 0) {
                const idxIA = Math.floor(Math.random() * ia.cartas.length);
                const idxJ = Math.floor(Math.random() * jogador.cartas.length);
                let tmp = ia.cartas[idxIA];
                ia.cartas[idxIA] = jogador.cartas[idxJ];
                jogador.cartas[idxJ] = tmp;
                log("👑 IA usou Rei e trocou uma carta com você.");
                renderizarCartasJogador();
            }
        }
    }

    atualizarStatus();
    verificarVitoria();
    if(jogoAtivo) passarParaProximoTurnoJogador();
}

function aplicarEfeitoAtaqueIA(tipoAtaque) {
    if(jogador.cartas.length === 0) return;

    if(tipoAtaque === "Cavaleiro") {
        jogador.vida--;
        log("⚔️ Cavaleiro da IA transpôs suas defesas. Você perdeu 1 vida.");
    } else if(tipoAtaque === "Assassino") {
        jogador.perderCarta(0); 
        log("🗡️ Assassino da IA eliminou uma de suas cartas.");
    }
}

function passarParaProximoTurnoJogador(){
    if(!jogoAtivo) return;
    
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
        jogoAtivo = false;
        mostrarFim("💀 Derrota", "As conspirações venceram. Você perdeu o Trono.");
    } else if(ia.vida <= 0 || ia.cartas.length === 0){
        jogoAtivo = false;
        mostrarFim("🏆 Vitória", "Sua dinastia triunfou sobre o Trono das Sombras!");
    }
}

function mostrarFim(titulo, texto){
    document.getElementById("victoryTitle").innerText = titulo;
    document.getElementById("victoryText").innerText = texto;
    document.getElementById("victoryModal").classList.remove("hidden");
    log(titulo + " - " + texto);
}
