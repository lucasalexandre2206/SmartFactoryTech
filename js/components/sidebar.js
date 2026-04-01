function carregarSidebar() {

    let tipo = localStorage.getItem("tipoUsuario")

    console.log("TIPO:", tipo) // 👈 ADICIONA ISSO

    let menu = ""

    if ( true ) {

        menu = `
        <a class="item" href="/views/dashboard.html">
            <div class="icon"><img src="/img/casa1.png"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/admin/usuarios.html">
            <div class="icon"><img src="/img/user.png"></div>
            <span>Usuários</span>
        </a>

        <a class="item" href="/views/admin/maquinas.html">
            <div class="icon"><img src="/img/engrenagem.png"></div>
            <span>Máquinas</span>
        </a>

        <a class="item" href="/views/transferencias.html">
            <div class="icon"><img src="/img/tranferencia.png"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/divergencias.html">
            <div class="icon"><img src="/img/x.png"></div>
            <span>Divergências</span>
        </a>

        <a class="item logout" href="#" onclick="logout()">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
        `

    } else {

        menu = `
        <a class="item" href="/views/dashboard.html">
            <div class="icon"><img src="/img/casa1.png"></div>
            <span>Dashboard</span>
        </a>

        <a class="item" href="/views/transferencias.html">
            <div class="icon"><img src="/img/tranferencia.png"></div>
            <span>Transferências</span>
        </a>

        <a class="item" href="/views/divergencias.html">
            <div class="icon"><img src="/img/x.png"></div>
            <span>Divergências</span>
        </a>

        <a class="item logout" href="#" onclick="logout()">
            <div class="icon">↩</div>
            <span>Sair</span>
        </a>
        `
    }

    document.getElementById("menuSidebar").innerHTML = menu
}


// 🔥 BOTÃO ☰
function ativarToggle(){
    document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebarMenu").classList.toggle("ativo")
    })
}


// 🔥 LOGOUT CERTO
function logout(){
    localStorage.removeItem("tipoUsuario")
    window.location.href = "/views/login.html"
}