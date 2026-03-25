const SUPABASE_URL = "https://jduahknpujrqwekibrbm.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vsAuckxkESYXHgKt17nYA_Z5pvsdNq";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// nomes das tabelas do seu banco
const TABELA_USUARIOS = "login";
const TABELA_PRODUTOS = "produtos";
const TABELA_MOVIMENTACOES = "movimentacoes";

let movimentacoes = [];
let produtos = [];
let usuarios = [];

// -------------------------
// INICIALIZAÇÃO
// -------------------------
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("buscarProduto").addEventListener("input", aplicarFiltros);
    document.getElementById("filtroTipo").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroData").addEventListener("change", aplicarFiltros);

    await carregarTudo();
});

async function carregarTudo() {
    await carregarProdutos();
    await carregarUsuarios();
    await carregarMovimentacoes();
    atualizarPainel();
}

// -------------------------
// CARREGAR PRODUTOS
// -------------------------
async function carregarProdutos() {
    const { data, error } = await client
        .from(TABELA_PRODUTOS)
        .select("*")
        .order("nome", { ascending: true });

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro ao carregar produtos no banco.");
        return;
    }

    produtos = data || [];

    const selectProduto = document.getElementById("produto");
    selectProduto.innerHTML = `<option value="">Selecione um produto</option>`;

    produtos.forEach((produto) => {
        selectProduto.innerHTML += `
            <option value="${produto.id}">${produto.nome}</option>
        `;
    });
}

// -------------------------
// CARREGAR USUÁRIOS
// -------------------------
async function carregarUsuarios() {
    const { data, error } = await client
        .from(TABELA_USUARIOS)
        .select("*")
        .order("nome", { ascending: true });

    if (error) {
        console.error("Erro ao carregar usuários:", error);
        alert("Erro ao carregar usuários no banco.");
        return;
    }

    usuarios = data || [];
}

// -------------------------
// CARREGAR MOVIMENTAÇÕES
// -------------------------
async function carregarMovimentacoes() {
    const { data, error } = await client
        .from(TABELA_MOVIMENTACOES)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar movimentações:", error);
        alert("Erro ao carregar movimentações no banco.");
        return;
    }

    movimentacoes = data || [];
    aplicarFiltros();
}

// -------------------------
// ATUALIZAR CARDS
// -------------------------
function atualizarPainel() {
    const hojeISO = new Date().toISOString().split("T")[0];

    const entradasHoje = movimentacoes
        .filter((mov) =>
            normalizarTipo(mov.tipo_movimentacao) === "entrada" &&
            mov.data_movimentacao === hojeISO
        )
        .reduce((total, mov) => total + Number(mov.quantidade || 0), 0);

    const saidasHoje = movimentacoes
        .filter((mov) =>
            normalizarTipo(mov.tipo_movimentacao) === "saida" &&
            mov.data_movimentacao === hojeISO
        )
        .reduce((total, mov) => total + Number(mov.quantidade || 0), 0);

    const estoqueAtual = produtos.reduce((total, produto) => {
        return total + Number(produto.estoque_atual || 0);
    }, 0);

    document.getElementById("totalEntradas").innerText = entradasHoje;
    document.getElementById("totalSaidas").innerText = saidasHoje;
    document.getElementById("totalEstoque").innerText = estoqueAtual;
}

// -------------------------
// REGISTRAR MOVIMENTAÇÃO
// -------------------------
async function registrar() {
    const tipoTela = document.getElementById("tipo").value;
    const produtoId = Number(document.getElementById("produto").value);
    const quantidade = Number(document.getElementById("quantidade").value);
    const responsavelNome = document.getElementById("responsavel").value.trim();
    const observacao = document.getElementById("observacao").value.trim();

    if (!produtoId) {
        alert("Selecione um produto.");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    if (responsavelNome === "") {
        alert("Digite o responsável.");
        return;
    }

    const produto = produtos.find((p) => Number(p.id) === produtoId);

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    const usuario = usuarios.find(
        (u) => (u.nome || "").toLowerCase() === responsavelNome.toLowerCase()
    );

    if (!usuario) {
        alert("Responsável não encontrado na tabela de usuários.");
        return;
    }

    const tipoBanco = tipoTela === "Entrada" ? "entrada" : "saida";
    let estoqueAtual = Number(produto.estoque_atual || 0);
    let novoEstoque = estoqueAtual;

    if (tipoBanco === "entrada") {
        novoEstoque = estoqueAtual + quantidade;
    } else {
        if (quantidade > estoqueAtual) {
            alert("Estoque insuficiente!");
            return;
        }
        novoEstoque = estoqueAtual - quantidade;
    }

    const dataHoje = new Date().toISOString().split("T")[0];

    const { error: erroInsert } = await client
        .from(TABELA_MOVIMENTACOES)
        .insert([
            {
                tipo_movimentacao: tipoBanco,
                produto_id: produtoId,
                quantidade: quantidade,
                responsavel_id: usuario.id,
                observacao: observacao || "-",
                data_movimentacao: dataHoje
            }
        ]);

    if (erroInsert) {
        console.error("Erro ao registrar movimentação:", erroInsert);
        alert("Erro ao salvar movimentação no Supabase.");
        return;
    }

    const { error: erroUpdate } = await client
        .from(TABELA_PRODUTOS)
        .update({ estoque_atual: novoEstoque })
        .eq("id", produtoId);

    if (erroUpdate) {
        console.error("Erro ao atualizar estoque:", erroUpdate);
        alert("Movimentação salva, mas houve erro ao atualizar o estoque.");
        return;
    }

    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("observacao").value = "";
    document.getElementById("tipo").value = "Entrada";

    await carregarTudo();
    alert("Movimentação registrada com sucesso.");
}

window.registrar = registrar;

// -------------------------
// FILTROS
// -------------------------
function aplicarFiltros() {
    const busca = document.getElementById("buscarProduto").value.toLowerCase().trim();
    const tipoFiltro = document.getElementById("filtroTipo").value;
    const dataFiltro = document.getElementById("filtroData").value;

    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];

    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const ontemISO = ontem.toISOString().split("T")[0];

    let filtrados = movimentacoes.filter((mov) => {
        const produto = produtos.find((p) => Number(p.id) === Number(mov.produto_id));
        const nomeProduto = produto ? produto.nome.toLowerCase() : "";

        const matchBusca = nomeProduto.includes(busca);

        let matchTipo = true;
        if (tipoFiltro === "Entrada") {
            matchTipo = normalizarTipo(mov.tipo_movimentacao) === "entrada";
        } else if (tipoFiltro === "Saída") {
            matchTipo = normalizarTipo(mov.tipo_movimentacao) === "saida";
        }

        let matchData = true;

        if (dataFiltro === "Hoje") {
            matchData = mov.data_movimentacao === hojeISO;
        }

        if (dataFiltro === "Ontem") {
            matchData = mov.data_movimentacao === ontemISO;
        }

        if (dataFiltro === "Semana") {
            const dataMov = new Date(mov.data_movimentacao + "T00:00:00");
            const seteDias = new Date();
            seteDias.setDate(hoje.getDate() - 7);
            matchData = dataMov >= seteDias;
        }

        if (dataFiltro === "Mês") {
            const dataMov = new Date(mov.data_movimentacao + "T00:00:00");
            matchData =
                dataMov.getMonth() === hoje.getMonth() &&
                dataMov.getFullYear() === hoje.getFullYear();
        }

        return matchBusca && matchTipo && matchData;
    });

    renderizarTabela(filtrados);
    atualizarPainel();
}

// -------------------------
// RENDERIZAR TABELA
// -------------------------
function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaMovimentos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">Nenhuma movimentação encontrada.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((mov) => {
        const produto = produtos.find((p) => Number(p.id) === Number(mov.produto_id));
        const usuario = usuarios.find((u) => Number(u.id) === Number(mov.responsavel_id));

        const tipoNormalizado = normalizarTipo(mov.tipo_movimentacao);
        const classe = tipoNormalizado === "entrada" ? "entrada" : "saida";
        const tipoExibicao = tipoNormalizado === "entrada" ? "Entrada" : "Saída";
        const quantidadeExibicao =
            tipoNormalizado === "entrada"
                ? `+${mov.quantidade}`
                : `-${mov.quantidade}`;

        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(mov.data_movimentacao)}</td>
                <td class="${classe}">${tipoExibicao}</td>
                <td>${produto ? produto.nome : "Produto não encontrado"}</td>
                <td class="${classe}">${quantidadeExibicao}</td>
                <td>${usuario ? usuario.nome : "Usuário não encontrado"}</td>
                <td>${mov.observacao || "-"}</td>
            </tr>
        `;
    });
}

// -------------------------
// FUNÇÕES AUXILIARES
// -------------------------
function formatarDataBR(dataISO) {
    if (!dataISO) return "-";
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarTipo(tipo) {
    return String(tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}