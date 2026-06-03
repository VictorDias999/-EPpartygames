// ========================================
// TRONO DAS SOMBRAS
// SCRIPT.JS
// ========================================
window.onerror = function(msg, url, line){

    alert(
        "Erro JS: " +
        msg +
        " Linha: " +
        line
    );

};
// ------------------------
// CARTAS
// ------------------------

const CARTAS = {
    Cavaleiro: {
        nome: "Cavaleiro",
        icone: "⚔️",
        custo: 3,
        descricao: "Causa 1 de dano."
    },

    Guarda: {
        nome: "Guarda",
        icone: "🛡️",
        custo: 0,
        descricao: "Bloqueia ataques."
    },

    Mago: {
        nome: "Mago",
        icone: "🧙",
        custo: 4,
        descricao: "Revela uma carta."
    },

    Rei: {
        nome: "Rei",
        icone: "👑",
        custo: 3,
        descricao: "Troca uma carta."
    },

    Assassino: {
        nome: "Assassino",
        icone: "🗡️",
        custo: 4,
        descricao: "Remove uma carta."
    },

    Comerciante: {
        nome: "Comerciante",
        icone: "💰",
        custo: 0,
        descricao: "Recebe 3 moedas."
    }
};

// ------------------------
// ESTADO
// ------------------------

let jogador;
let ia;

let turnoJogador = true;

let cartaSelecionada = null;

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

        const sorteada =
            nomes[Math.floor(
                Math.random() * nomes.length
            )];

        this.cartas.push(sorteada);
    }

    perderCarta(indice){

        this.cartas.splice(indice,1);

        this.comprarCarta();
    }
}

// ------------------------
// INICIAR
// ------------------------

window.addEventListener("DOMContentLoaded", () => {

    console.log("Script carregado!");

    const startBtn = document.getElementById("startBtn");

    if(startBtn){

        startBtn.addEventListener(
            "click",
            iniciarPartida
        );

        console.log("Botão conectado.");
    }

    const closeMageBtn =
        document.getElementById(
            "closeMageModal"
        );

    if(closeMageBtn){

        closeMageBtn.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "mageModal"
                    )
                    .classList
                    .add("hidden");
            }
        );
    }

});

function iniciarPartida(){

    jogador =
        new Jogador("Jogador");

    ia =
        new Jogador("IA");

    document
        .getElementById("menuScreen")
        .classList
        .remove("active");

    document
        .getElementById("gameScreen")
        .classList
        .add("active");

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

    document
        .getElementById("playerLife")
        .innerText =
            "❤️ " + jogador.vida;

    document
        .getElementById("playerCoins")
        .innerText =
            "🪙 " + jogador.moedas;

    document
        .getElementById("aiLife")
        .innerText =
            "❤️ " + ia.vida;

    document
        .getElementById("aiCoins")
        .innerText =
            "🪙 " + ia.moedas;
}

function renderizarCartasJogador(){

    const area =
        document.getElementById(
            "playerCards"
        );

    area.innerHTML = "";

    jogador.cartas.forEach((carta,index)=>{

        const dados = CARTAS[carta];

        const div =
            document.createElement("div");

        div.className = "card";

        div.innerHTML = `
            <div class="card-title">
                ${dados.nome}
            </div>

            <div class="card-icon">
                ${dados.icone}
            </div>

            <div class="card-desc">
                ${dados.descricao}
            </div>
        `;

        div.onclick = ()=>{

            selecionarCarta(index);
        };

        area.appendChild(div);
    });
}

function renderizarCartasIA(){

    const area =
        document.getElementById(
            "aiCards"
        );

    area.innerHTML = "";

    ia.cartas.forEach(()=>{

        const carta =
            document.createElement("div");

        carta.className =
            "card back-card";

        area.appendChild(carta);
    });
}

// ------------------------
// SELEÇÃO
// ------------------------

function selecionarCarta(indice){

    cartaSelecionada = indice;

    const nome =
        jogador.cartas[indice];

    log(
        "🃏 Carta selecionada: "
        + nome
    );
}

// ------------------------
// LOG
// ------------------------

function log(texto){

    const logArea =
        document.getElementById(
            "gameLog"
        );

    const linha =
        document.createElement("div");

    linha.className =
        "log-entry";

    linha.innerText =
        texto;

    logArea.appendChild(linha);

    logArea.scrollTop =
        logArea.scrollHeight;
}

// ------------------------
// BOTÕES DE AÇÃO
// ------------------------

document
.querySelectorAll(".action-btn")
.forEach(botao=>{

    botao.addEventListener(
        "click",
        ()=>{

            const carta =
                botao.dataset.card;

            usarAcao(carta);
        }
    );
});

function usarAcao(nomeCarta){

    if(!turnoJogador){

        return;
    }

    cartaDeclaradaAtual =
        nomeCarta;

    abrirModalDesafio();
}
// ========================================
// MODAIS
// ========================================

const challengeModal =
    document.getElementById(
        "challengeModal"
    );

const challengeText =
    document.getElementById(
        "challengeText"
    );

let cartaDeclaradaAtual = null;

function abrirModalDesafio(){

    challengeText.innerText =
        `Você declarou ${cartaDeclaradaAtual}.
        A IA está avaliando...`;

    challengeModal.classList.remove(
        "hidden"
    );

    setTimeout(()=>{

        const desafia =
            iaDecideDesafio(
                cartaDeclaradaAtual
            );

        challengeModal.classList.add(
            "hidden"
        );

        resolverJogadaJogador(
            cartaDeclaradaAtual,
            desafia
        );

    },1500);
}

// ========================================
// IA
// ========================================

function iaDecideDesafio(carta){

    let possui =
        jogador.cartas.includes(carta);

    if(possui){

        return Math.random() < 0.25;
    }

    return Math.random() < 0.65;
}

// ========================================
// BLEFE
// ========================================

function resolverJogadaJogador(
    carta,
    desafia
){

    let possui =
        jogador.cartas.includes(carta);

    if(desafia){

        log(
            "🤖 IA desafiou sua declaração."
        );

        if(possui){

            ia.vida--;

            log(
                "✅ Você tinha a carta."
            );

            log(
                "❤️ IA perdeu 1 vida."
            );

            executarPoderJogador(
                carta
            );
        }
        else{

            jogador.vida--;

            log(
                "❌ Blefe descoberto."
            );

            log(
                "❤️ Você perdeu 1 vida."
            );
        }
    }
    else{

        log(
            "🤖 IA aceitou sua declaração."
        );

        executarPoderJogador(
            carta
        );
    }

    atualizarStatus();

    verificarVitoria();

    if(ia.vida > 0 &&
       jogador.vida > 0){

        passarTurno();
    }
}

// ========================================
// PODERES
// ========================================

function executarPoderJogador(
    carta
){

    switch(carta){

        case "Comerciante":

            jogador.moedas += 3;

            log(
                "💰 Você recebeu 3 moedas."
            );

            break;

        case "Cavaleiro":

            if(jogador.moedas < 3){

                log(
                    "❌ Moedas insuficientes."
                );

                return;
            }

            jogador.moedas -= 3;

            ia.vida--;

            log(
                "⚔️ Cavaleiro causou 1 dano."
            );

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

        case "Guarda":

            log(
                "🛡️ Guarda preparado."
            );

            break;
    }

    renderizarTudo();
}

// ========================================
// MAGO
// ========================================

function usarMago(){

    if(jogador.moedas < 4){

        log(
            "❌ Moedas insuficientes."
        );

        return;
    }

    jogador.moedas -= 4;

    const indice =
        Math.floor(
            Math.random() *
            ia.cartas.length
        );

    const carta =
        ia.cartas[indice];

    document
        .getElementById(
            "revealedCard"
        )
        .innerText =
            `A carta vista foi: ${carta}`;

    document
        .getElementById(
            "mageModal"
        )
        .classList
        .remove("hidden");

    log(
        "🔮 Você utilizou Mago."
    );
}


// ========================================
// ASSASSINO
// ========================================

function usarAssassino(){

    if(jogador.moedas < 4){

        log(
            "❌ Moedas insuficientes."
        );

        return;
    }

    jogador.moedas -= 4;

    const indice =
        Math.floor(
            Math.random() *
            ia.cartas.length
        );

    ia.perderCarta(indice);

    log(
        "🗡️ Uma carta da IA foi eliminada."
    );
}

// ========================================
// REI
// ========================================

function usarRei(){

    if(jogador.moedas < 3){

        log(
            "❌ Moedas insuficientes."
        );

        return;
    }

    jogador.moedas -= 3;

    if(cartaSelecionada === null){

        log(
            "👑 Selecione uma carta sua."
        );

        return;
    }

    const indiceIA =
        Math.floor(
            Math.random() *
            ia.cartas.length
        );

    let temp =
        jogador.cartas[cartaSelecionada];

    jogador.cartas[cartaSelecionada] =
        ia.cartas[indiceIA];

    ia.cartas[indiceIA] =
        temp;

    log(
        "👑 Cartas trocadas."
    );

    renderizarTudo();
}

// ========================================
// TURNOS
// ========================================

function passarTurno(){

    turnoJogador = false;

    document
        .getElementById(
            "turnText"
        )
        .innerText =
            "Turno da IA";

    setTimeout(
        turnoIA,
        2000
    );
}

function turnoIA(){

    ia.moedas += 2;

    const cartas =
        Object.keys(CARTAS);

    const declarada =
        cartas[
            Math.floor(
                Math.random() *
                cartas.length
            )
        ];

    log(
        `🤖 IA declarou ${declarada}`
    );

    setTimeout(()=>{

        const desafiar =
            confirm(
                `A IA declarou ${declarada}.
Deseja desafiar?`
            );

        resolverJogadaIA(
            declarada,
            desafiar
        );

    },1000);
}

// ========================================
// IA RESOLVE
// ========================================

function resolverJogadaIA(
    carta,
    desafiar
){

    let possui =
        ia.cartas.includes(carta);

    if(desafiar){

        if(possui){

            jogador.vida--;

            log(
                "❌ A IA tinha a carta."
            );
        }
        else{

            ia.vida--;

            log(
                "✅ Blefe da IA descoberto."
            );
        }
    }
    else{

        executarPoderIA(
            carta
        );
    }

    atualizarStatus();

    verificarVitoria();

    turnoJogador = true;

    jogador.moedas += 2;

    document
        .getElementById(
            "turnText"
        )
        .innerText =
            "Seu Turno";
}

// ========================================
// IA PODERES
// ========================================

function executarPoderIA(
    carta
){

    switch(carta){

        case "Comerciante":

            ia.moedas += 3;

            break;

        case "Cavaleiro":

            if(ia.moedas >= 3){

                ia.moedas -= 3;

                jogador.vida--;
            }

            break;

        case "Assassino":

            if(ia.moedas >= 4){

                ia.moedas -= 4;

                jogador.perderCarta(
                    Math.floor(
                        Math.random() *
                        jogador.cartas.length
                    )
                );
            }

            break;
    }

    renderizarTudo();
}

// ========================================
// VITÓRIA
// ========================================

function verificarVitoria(){

    if(jogador.vida <= 0){

        mostrarFim(
            "💀 Derrota",
            "Você perdeu o trono."
        );
    }

    if(ia.vida <= 0){

        mostrarFim(
            "🏆 Vitória",
            "Você conquistou o trono."
        );
    }
}

function mostrarFim(
    titulo,
    texto
){

    document
        .getElementById(
            "victoryTitle"
        )
        .innerText =
            titulo;

    document
        .getElementById(
            "victoryText"
        )
        .innerText =
            texto;

    document
        .getElementById(
            "victoryModal"
        )
        .classList
        .remove("hidden");
}
