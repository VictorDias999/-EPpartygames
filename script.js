// ========================================
// TRONO DAS SOMBRAS - SCRIPT.JS (CORRIGIDO)
// Tema Medieval Premium - Com Ações Universais
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
        if(ia.cartas.length === 0) {
            log("❌ A IA não tem cartas para atacar.");
            return;
        }

        jogador.moedas -= 7;
        ia.vida--;
        ia.perderCarta(0); 
        log("💥 GOLPE SUPREMO! Você pagou 7 moedas e desferiu um ataque devastador. IA perdeu 1 vida e 1 carta!");
        
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

// Quando VOCÊ joga: A IA pensa (Botões ocultos)
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
        log
