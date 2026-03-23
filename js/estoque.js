let entradas = 0;
let saidas = 0;
let estoque = 0;

function atualizarPainel() {
    document.getElementById("totalEntradas").innerText = entradas;
    document.getElementById("totalSaidas").innerText = saidas;
    document.getElementById("totalEstoque").innerText = estoque;
}

function adicionarNoHistorico(tipo, produto, quantidade, responsavel, observacao) {
    let tabela = document.getElementById("tabelaMovimentos");

    let agora = new Date();
    let data = agora.toLocaleDateString("pt-BR");

    let classeTipo = tipo === "Entrada" ? "entrada" : "saida";
    let quantidadeTexto = tipo === "Entrada" ? `+${quantidade}` : `-${quantidade}`;

    let novaLinha = `
        <tr>
            <td>${data}</td>
            <td class="${classeTipo}">${tipo}</td>
            <td>${produto}</td>
            <td class="${classeTipo}">${quantidadeTexto}</td>
            <td>${responsavel}</td>
            <td>${observacao}</td>
        </tr>
    `;

    tabela.innerHTML = novaLinha + tabela.innerHTML;
}

function registrar() {
    let tipo = document.getElementById("tipo").value;
    let produto = document.getElementById("produto").value.trim();
    let quantidade = Number(document.getElementById("quantidade").value);
    let responsavel = document.getElementById("responsavel").value.trim();
    let observacao = document.getElementById("observacao").value.trim();

    if (produto === "") {
        alert("Digite o nome do produto");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Digite uma quantidade válida");
        return;
    }

    if (responsavel === "") {
        alert("Digite o nome do responsável");
        return;
    }

    if (tipo === "Entrada") {
        entradas += quantidade;
        estoque += quantidade;
    } else {
        if (quantidade > estoque) {
            alert("Estoque insuficiente!");
            return;
        }

        saidas += quantidade;
        estoque -= quantidade;
    }

    atualizarPainel();
    adicionarNoHistorico(tipo, produto, quantidade, responsavel, observacao || "-");

    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("observacao").value = "";
}