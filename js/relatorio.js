// Função para obter o próximo ID
function getNextId() {
    // Obtém o contador do localStorage ou inicia em 0 se não existir
    let contador = parseInt(localStorage.getItem("contadorRegistros")) || 0;
    contador++; // Incrementa o contador
    localStorage.setItem("contadorRegistros", contador); // Atualiza o contador no localStorage
    return contador; // Retorna o novo ID
}

// Função para adicionar um novo registro
function adicionarRegistro(registro) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    registro.id = getNextId(); // Atribui um novo ID
    registros.push(registro); // Adiciona o registro à lista
    localStorage.setItem("register", JSON.stringify(registros)); // Atualiza o localStorage
    alert("Registro adicionado com sucesso!");
    renderList(registros); // Renderiza a lista atualizada
}

// Função para renderizar a lista de registros
function renderList(registros) {
    const tabelaBody = document.querySelector("#tabela-registros tbody");
    tabelaBody.innerHTML = ''; // Limpa a tabela antes de renderizar

    registros.forEach((registro) => {
        const row = document.createElement("tr");

        const imagemCell = registro.imagem 
            ? `<img src="${registro.imagem}" alt="Imagem" style="width: 100px; height: auto;">`
            : "-";

        const dataPassadaText = registro.data_passada ? 'Sim' : 'Não';

        // Botões de atualização ao lado de cada campo
        const botaoAtualizarComentario = `<button class="btn-atualizar-comentario" data-id="${registro.id}">Atualizar</button>`;
        const botaoAtualizarTipo = `<button class="btn-atualizar-tipo" data-id="${registro.id}">Atualizar</button>`;
        const botaoAtualizarData = `<button class="btn-atualizar-data" data-id="${registro.id}">Atualizar</button>`;
        const botaoAtualizarHora = `<button class="btn-atualizar-hora" data-id="${registro.id}">Atualizar</button>`;
        const botaoIncrementarHora = `<button class="btn-incrementar-hora" data-id="${registro.id}">Incrementar Hora</button>`; // Botão de incrementar hora
        const botaoApagar = `<button class="btn-apagar" data-id="${registro.id}">Apagar</button>`; // Botão de apagar

        row.innerHTML = `
            <td>${registro.id}</td>
            <td>${registro.data} <br> ${botaoAtualizarData}</td>
            <td>${registro.hora} <br> ${botaoAtualizarHora} ${botaoIncrementarHora}</td>
            <td>${registro.tipo} <br> ${botaoAtualizarTipo}</td>
            <td>${registro.justificativa || "-"}</td>
            <td>${registro.comentario_opcional || "-"} <br> ${botaoAtualizarComentario}</td>
            <td>${imagemCell}</td>
            <td>${dataPassadaText}</td>
            <td>${botaoApagar}</td>
        `;

        tabelaBody.appendChild(row);
    });

    // Adicionar eventos de clique para os botões

    // Atualizar Comentário
    document.querySelectorAll(".btn-atualizar-comentario").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            abrirDialogoAtualizarCampo(id, "comentario_opcional"); // Abre diálogo para atualizar o comentário
        });
    });

    // Atualizar Tipo de Ponto
    document.querySelectorAll(".btn-atualizar-tipo").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            abrirDialogoAtualizarCampo(id, "tipo"); // Abre diálogo para atualizar o tipo de ponto
        });
    });

    // Atualizar Data
    document.querySelectorAll(".btn-atualizar-data").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            abrirDialogoAtualizarCampo(id, "data"); // Abre diálogo para atualizar a data
        });
    });

    // Atualizar Hora
    document.querySelectorAll(".btn-atualizar-hora").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            abrirDialogoAtualizarCampo(id, "hora"); // Abre diálogo para atualizar a hora
        });
    });

    // Incrementar Hora
    document.querySelectorAll(".btn-incrementar-hora").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            incrementarHora(id); // Chama a função de incremento
        });
    });

    // Adicionar eventos de clique para o botão de apagar (apenas alerta)
    document.querySelectorAll(".btn-apagar").forEach(botao => {
        botao.addEventListener("click", () => {
            alert("Os registros não podem ser apagados.");
        });
    });
}

// Função para abrir o diálogo de atualização com input de data/hora ou tipo
function abrirDialogoAtualizarCampo(id, campo) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    const registro = registros.find(r => r.id == id);

    if (registro) {
        const dialogAtualizacao = document.getElementById("dialog-atualizar");
        dialogAtualizacao.showModal();

        const novoValorInput = document.getElementById("novo-valor");

        if (campo === "data") {
            novoValorInput.setAttribute("type", "date");
            novoValorInput.value = new Date(registro.data.split("/").reverse().join("-")).toISOString().split('T')[0];
        } else if (campo === "hora") {
            novoValorInput.setAttribute("type", "time");
            novoValorInput.value = registro.hora;
        } else if (campo === "tipo") {
            // Cria o select para os tipos de ponto
            const select = document.createElement("select");
            select.id = "novo-tipo";

            const tipos = ["Entrada", "Intervalo", "Volta Intervalo", "Saída", "Falta"];
            tipos.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.toLowerCase();
                option.text = tipo;
                if (registro.tipo === tipo.toLowerCase()) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            // Substitui o input atual pelo select
            const inputContainer = novoValorInput.parentNode;
            inputContainer.replaceChild(select, novoValorInput);
        } else {
            novoValorInput.setAttribute("type", "text");
            novoValorInput.value = registro[campo];
        }

        // Ação de confirmação
        document.getElementById("btn-confirmar-atualizacao").onclick = () => {
            let novoValor;
            if (campo === "tipo") {
                const selectTipo = document.getElementById("novo-tipo");
                novoValor = selectTipo.value;

                // Verifica se o tipo foi alterado de "falta" para outro e apaga a justificativa
                if (registro.tipo === "falta" && novoValor !== "falta") {
                    registro.justificativa = null;  // Apaga a justificativa se o novo tipo não for "falta"
                }
            } else {
                novoValor = novoValorInput.value;
            }

            if (novoValor && confirm("Deseja atualizar o valor?")) {
                atualizarCampoRegistro(id, campo, novoValor);
                dialogAtualizacao.close();
            }
        };

        document.getElementById("btn-cancelar-atualizacao").onclick = () => {
            dialogAtualizacao.close();
        };
    }
}

// Função para atualizar o registro no LocalStorage
function atualizarCampoRegistro(id, campo, novoValor) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    const registro = registros.find(r => r.id == id);

    if (registro) {
        registro[campo] = novoValor;

        // Atualiza o LocalStorage com o novo valor
        localStorage.setItem("register", JSON.stringify(registros));
        alert("Registro atualizado com sucesso!");

        // Re-renderiza a lista de registros
        renderList(registros);
    }
}

// Função para incrementar a hora
function incrementarHora(id) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    const registro = registros.find(r => r.id == id);

    if (registro) {
        const [horas, minutos] = registro.hora.split(':').map(Number);
        let novaHora = horas + 1; // Incrementa 1 hora

        // Se a nova hora ultrapassar 23, reseta para 0
        if (novaHora > 23) {
            novaHora = 0;
        }

        registro.hora = `${String(novaHora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        localStorage.setItem("register", JSON.stringify(registros)); // Atualiza o localStorage
        alert("Hora incrementada com sucesso!");

        // Re-renderiza a lista de registros
        renderList(registros);
    }
}

// Função para aplicar o filtro de datas
function aplicarFiltro() {
    const dataInicial = document.getElementById("data-inicial").value;
    const dataFinal = document.getElementById("data-final").value;

    if (!dataInicial || !dataFinal) {
        alert("Por favor, selecione um período válido para o filtro.");
        return;
    }

    const registros = JSON.parse(localStorage.getItem("register")) || [];

    const registrosFiltrados = registros.filter(registro => {
        const dataRegistro = new Date(registro.data.split('/').reverse().join('-')); // Converte a data para YYYY-MM-DD
        const dataInicio = new Date(dataInicial);
        const dataFim = new Date(dataFinal);

        return dataRegistro >= dataInicio && dataRegistro <= dataFim;
    });

    renderList(registrosFiltrados);
}

// Adicionar evento de clique no botão de filtro
document.getElementById("btn-filtrar").addEventListener("click", aplicarFiltro);

// Renderiza todos os registros ao carregar a página
renderList(JSON.parse(localStorage.getItem("register")) || []);
