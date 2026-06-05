// ========================================
// TRONO DAS SOMBRAS - SCRIPT.JS (CORRIGIDO)
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
let guardaAtivo = false;
let guardaJogadorAtivo = false;
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
        this.cartas.splice(indice, 1);
        // Removido o comprarCarta() para que o número de cartas diminua de verdade!
    }
}

// ------------------------
// INICIAR
// ------------------------
window.addEventListener("DOMContentLoaded", () => {
    console.log("Script carregado!");
    const startBtn = document.getElementById("startBtn");
    if(startBtn){
        startBtn.addEventListener("click", iniciarPartida);
    }

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
        if(cartaSelecionada === index) div.className += " selected"; // Feedback visual opcional

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
        const carta = botao.dataset.card;
        usarAcao(carta);
    });
});

function usarAcao(nomeCarta){
    if(!turnoJogador) return;

    // CORREÇÃO: Validar custo antes de iniciar a ação/desafio
    const custo = CARTAS[nomeCarta].custo;
    if(jogador.moedas < custo){
        log(`❌ Moedas insuficientes para declarar ${nomeCarta} (Custa 🪙 ${custo}).`);
        return;
    }

    if(nomeCarta === "Guarda"){
        guardaJogadorAtivo = true;
        log("🛡️ Guarda ativado! Você está protegido contra o próximo ataque.");
        passarTurno();
        return;
    }

    // Se for o Rei, precisa ter uma carta selecionada antes de jogar
    if(nomeCarta === "Rei" && cartaSelecionada === null){
        log("👑 Selecione uma de suas cartas antes de usar o Rei para saber qual trocar.");
        return;
    }

    cartaDeclaradaAtual = nomeCarta;
    abrirModalDesafio();
}

function abrirModalDesafio(){
    challengeText.innerText = `Você declarou ${cartaDeclaradaAtual}.\nA IA está avaliando...`;
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
        return Math.random() < 0.20; // 20% de chance de errar e desafiar quem tem a carta
    }
    return Math.random() < 0.70; // 70% de chance de pegar o blefe do jogador
}

// ------------------------
// RESOLUÇÃO DE JOGADAS
// ------------------------
function resolverJogadaJogador(carta, desafia){
    let possui = jogador.cartas.includes(carta);

    if(desafia){
        log("🤖 IA desafiou sua declaração!");
        if(possui){
            ia.vida--;
            log("✅ Você provou a verdade! IA perdeu 1 vida.");
            executarPoderJogador(carta);
        } else {
            jogador.vida--;
            log("❌ Seu blefe foi descoberto! Você perdeu 1 vida.");
            // Se perdeu o blefe, a ação é cancelada e perde uma carta aleatória
            if(jogador.cartas.length > 0) jogador.perderCarta(0);
        }
    } else {
        log("🤖 IA aceitou sua declaração.");
        executarPoderJogador(carta);
    }

    atualizarStatus();
    verificarVitoria();

    if(ia.vida > 0 && jogador.vida > 0){
        passarTurno();
    }
}

function executarPoderJogador(carta){
    // O custo já foi validado na função usarAcao
    jogador.moedas -= CARTAS[carta].custo;

    switch(carta){
        case "Comerciante":
            jogador.moedas += 3;
            log("💰 Você recebeu 3 moedas do Comerciante.");
            break;

        case "Cavaleiro":
            if(guardaAtivo){
                log("🛡️ O Guarda da IA bloqueou seu Cavaleiro!");
                guardaAtivo = false;
            } else {
                ia.vida--;
                log("⚔️ Cavaleiro causou 1 de dano à IA.");
            }
            break;

        case "Mago":
            usarMago();
            break;

        case "Assassino":
            usarAssassino();
            break;

        case "Rei":
            usarRei();
            break;
    }
    renderizarTudo();
}

function usarMago(){
    if(ia.cartas.length === 0) return;
    const indice = Math.floor(Math.random() * ia.cartas.length);
    const carta = ia.cartas[indice];

    document.getElementById("revealedCard").innerText = `A carta vista foi: ${carta}`;
    document.getElementById("mageModal").classList.remove("hidden");
    log("🔮 Mago revelou com sucesso uma carta da IA.");
}

function usarAssassino(){
    if(ia.cartas.length === 0){
        log("❌ A IA não tem cartas para remover.");
        return;
    }
    if(guardaAtivo){
        log("🛡️ O Guarda da IA bloqueou seu Assassino!");
        guardaAtivo = false;
        return;
    }
    const indice = Math.floor(Math.random() * ia.cartas.length);
    ia.perderCarta(indice);
    ia.vida--; // Em mecânicas de Coup, perder carta equivale a perder vida
    log("🗡️ Assassino eliminou uma das cartas (e vida) da IA.");
}

function usarRei(){
    if(ia.cartas.length === 0 || cartaSelecionada === null) return;

    const indiceIA = Math.floor(Math.random() * ia.cartas.length);
    let temp = jogador.cartas[cartaSelecionada];
    jogador.cartas[cartaSelecionada] = ia.cartas[indiceIA];
    ia.cartas[indiceIA] = temp;

    cartaSelecionada = null;
    log("👑 Cartas trocadas com o Rei.");
}

// ------------------------
// FLUXO DE TURNOS
// ------------------------
function passarTurno(){
    turnoJogador = false;
    document.getElementById("turnText").innerText = "Turno da IA";
    setTimeout(turnoIA, 2000);
}

function turnoIA(){
    if(ia.vida <= 0) return;
    
    ia.moedas += 2; // Renda passiva do turno
    guardaAtivo = false;

    const opcoesCartas = Object.keys(CARTAS);
    let declarada;

    // Inteligência básica da IA para gastar moedas
    if(ia.moedas >= 4 && Math.random() < 0.6){
        declarada = "Assassino";
    } else if(ia.moedas >= 3 && Math.random() < 0.5){
        declarada = "Cavaleiro";
    } else if(Math.random() < 0.25){
        declarada = "Guarda";
        guardaAtivo = true;
        log("🤖 IA preparou um Guarda e está protegida.");
    } else {
        declarada = "Comerciante";
    }

    if(guardaAtivo){
        setTimeout(passarParaProximoTurnoJogador, 1500);
        return;
    }

    log(`🤖 IA declarou usar o efeito do: ${declarada}`);

    setTimeout(() => {
        const desafiar = confirm(`A IA declarou ${declarada}.\nDeseja desafiar o blefe dela?`);
        resolverJogadaIA(declarada, desafiar);
    }, 1000);
}

function resolverJogadaIA(carta, desafiar){
    let possui = ia.cartas.includes(carta);

    if(desafiar){
        if(possui){
            log("❌ A IA tinha a carta! Você perdeu o desafio e 1 vida.");
            jogador.vida--;
            if(jogador.cartas.length > 0) jogador.perderCarta(0);
            executarPoderIA(carta);
        } else {
            log("✅ Você pegou o blefe! A IA perdeu 1 vida.");
            ia.vida--;
            if(ia.cartas.length > 0) ia.perderCarta(0);
        }
    } else {
        executarPoderIA(carta);
    }

    atualizarStatus();
    verificarVitoria();
    
    if(jogador.vida > 0 && ia.vida > 0){
        passarParaProximoTurnoJogador();
    }
}

function passarParaProximoTurnoJogador(){
    turnoJogador = true;
    guardaJogadorAtivo = false;
    jogador.moedas += 2; // Renda passiva do turno do jogador
    
    document.getElementById("turnText").innerText = "Seu Turno";
    renderizarTudo();
}

function ejecutarPoderIA(carta){
    ia.moedas -= CARTAS[carta].custo;

    switch(carta){
        case "Comerciante":
            ia.moedas += 3;
            log("💰 IA recebeu 3 moedas.");
            break;

        case "Cavaleiro":
            if(guardaJogadorAtivo){
                log("🛡️ Seu Guarda bloqueou o Cavaleiro da IA!");
                guardaJogadorAtivo = false;
            } else {
                jogador.vida--;
                log("⚔️ Cavaleiro da IA causou 1 de dano em você.");
            }
            break;

        case "Assassino":
            if(jogador.cartas.length > 0){
                if(guardaJogadorAtivo){
                    log("🛡️ Seu Guarda bloqueou o Assassino da IA!");
                    guardaJogadorAtivo = false;
                } else {
                    jogador.perderCarta(0);
                    jogador.vida--;
                    log("🗡️ O Assassino da IA eliminou uma carta sua.");
                }
            }
            break;
    }
    renderizarTudo();
}

// ------------------------
// FIM DE JOGO
// ------------------------
function verificarVitoria(){
    if(jogador.vida <= 0 || jogador.cartas.length === 0){
        mostrarFim("💀 Derrota", "Você foi superado pelas intrigas e perdeu o trono.");
    } else if(ia.vida <= 0 || ia.cartas.length === 0){
        mostrarFim("🏆 Vitória", "Você eliminou seus oponentes e conquistou o Trono das Sombras!");
    }
}

function mostrarFim(titulo, texto){
    document.getElementById("victoryTitle").innerText = titulo;
    document.getElementById("victoryText").innerText = texto;
    document.getElementById("victoryModal").classList.remove("hidden");
}
