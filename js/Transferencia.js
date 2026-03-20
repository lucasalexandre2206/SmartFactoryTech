let movimentos = JSON.parse(localStorage.getItem("movimentos")) || []

function registrar(){

let movimento = {

data: new Date().toLocaleDateString(),
tipo: document.getElementById("tipo").value,
produto: document.getElementById("produto").value,
quantidade: document.getElementById("quantidade").value,
responsavel: document.getElementById("responsavel").value,
obs: document.getElementById("observacao").value

}

movimentos.push(movimento)

localStorage.setItem("movimentos", JSON.stringify(movimentos))

mostrarMovimentos()
atualizarCards()

}

/* MOSTRAR */
function mostrarMovimentos(){

let tabela = document.getElementById("tabelaMovimentos")

tabela.innerHTML = ""

movimentos.forEach(m => {

tabela.innerHTML += `
<tr>
<td>${m.data}</td>
<td class="${m.tipo === "Entrada" ? "entrada" : "saida"}">${m.tipo}</td>
<td>${m.produto}</td>
<td>${m.tipo === "Entrada" ? "+" : "-"}${m.quantidade}</td>
<td>${m.responsavel}</td>
<td>${m.obs}</td>
</tr>
`

})

}

/* CARDS */
function atualizarCards(){

let entradas = 0
let saidas = 0

movimentos.forEach(m => {

if(m.tipo === "Entrada"){
entradas += Number(m.quantidade)
}else{
saidas += Number(m.quantidade)
}

})

document.getElementById("totalEntradas").innerText = entradas
document.getElementById("totalSaidas").innerText = saidas

}

/* PESQUISA */
function pesquisar(){

let valor = document.getElementById("pesquisa").value.toLowerCase()

let linhas = document.querySelectorAll("#tabelaMovimentos tr")

linhas.forEach(linha => {

let texto = linha.innerText.toLowerCase()

linha.style.display = texto.includes(valor) ? "" : "none"

})

}

/* INICIAR */
mostrarMovimentos()
atualizarCards()