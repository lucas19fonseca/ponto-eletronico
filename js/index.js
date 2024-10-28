// Função para renderizar a lista de registros
function renderList(registros) {
    const tabelaBody = document.querySelector("#tabela-registros tbody");
    tabelaBody.innerHTML = "";
  
    registros.forEach((registro) => {
      const row = document.createElement("tr");
  
      const imagemCell = registro.imagem
        ? `<img src="${registro.imagem}" alt="Imagem" style="width: 100px; height: auto;">`
        : "-";
  
      const dataPassadaText = registro.data_passada ? "Sim" : "Não";
  
      const botaoAtualizarComentario = `<button class="btn-atualizar-comentario" data-id="${registro.id}">Atualizar</button>`;
      const botaoAtualizarTipo = `<button class="btn-atualizar-tipo" data-id="${registro.id}">Atualizar</button>`;
      const botaoAtualizarData = `<button class="btn-atualizar-data" data-id="${registro.id}">Atualizar</button>`;
      const botaoAtualizarHora = `<button class="btn-atualizar-hora" data-id="${registro.id}">Atualizar</button>`;
      const botaoApagar = `<button class="btn-apagar" data-id="${registro.id}">Apagar</button>`;
  
      row.innerHTML = `
              <td>${registro.id}</td>
              <td>${registro.data} <br> ${botaoAtualizarData}</td>
              <td>${registro.hora} <br> ${botaoAtualizarHora}</td>
              <td>${registro.tipo} <br> ${botaoAtualizarTipo}</td>
              <td>${registro.justificativa || "-"}</td>
              <td>${
                registro.comentario_opcional || "-"
              } <br> ${botaoAtualizarComentario}</td>
              <td>${imagemCell}</td>
              <td>${dataPassadaText}</td>
              <td>${botaoApagar}</td>
          `;
  
      tabelaBody.appendChild(row);
    });
  
    document.querySelectorAll(".btn-atualizar-comentario").forEach((botao) => {
      botao.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        abrirDialogoAtualizarCampo(id, "comentario_opcional");
      });
    });
  
    document.querySelectorAll(".btn-atualizar-tipo").forEach((botao) => {
      botao.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        abrirDialogoAtualizarCampo(id, "tipo");
      });
    });
  
    document.querySelectorAll(".btn-atualizar-data").forEach((botao) => {
      botao.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        abrirDialogoAtualizarCampo(id, "data");
      });
    });
  
    document.querySelectorAll(".btn-atualizar-hora").forEach((botao) => {
      botao.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        abrirDialogoAtualizarCampo(id, "hora");
      });
    });
  
    document.querySelectorAll(".btn-apagar").forEach((botao) => {
      botao.addEventListener("click", () => {
        alert("Os registros não podem ser apagados.");
      });
    });
  }
  
  function abrirDialogoAtualizarCampo(id, campo) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    const registro = registros.find((r) => r.id == id);
  
    if (registro) {
      const dialogAtualizacao = document.getElementById("dialog-atualizar");
      dialogAtualizacao.showModal();
  
      const novoValorInput = document.getElementById("novo-valor");
  
      if (campo === "data") {
        novoValorInput.setAttribute("type", "date");
        novoValorInput.value = new Date(
          registro.data.split("/").reverse().join("-")
        )
          .toISOString()
          .split("T")[0];
      } else if (campo === "hora") {
        novoValorInput.setAttribute("type", "time");
        novoValorInput.value = registro.hora;
      } else if (campo === "tipo") {
        // Cria o select para os tipos de ponto
        const select = document.createElement("select");
        select.id = "novo-tipo";
  
        const tipos = [
          "Entrada",
          "Intervalo",
          "Volta Intervalo",
          "Saída",
          "Falta",
        ];
        tipos.forEach((tipo) => {
          const option = document.createElement("option");
          option.value = tipo.toLowerCase();
          option.text = tipo;
          if (registro.tipo === tipo.toLowerCase()) {
            option.selected = true;
          }
          select.appendChild(option);
        });
  
        const inputContainer = novoValorInput.parentNode;
        inputContainer.replaceChild(select, novoValorInput);
      } else {
        novoValorInput.setAttribute("type", "text");
        novoValorInput.value = registro[campo];
      }
  
      document.getElementById("btn-confirmar-atualizacao").onclick = () => {
        let novoValor;
        if (campo === "tipo") {
          const selectTipo = document.getElementById("novo-tipo");
          novoValor = selectTipo.value;
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
  
  function atualizarCampoRegistro(id, campo, novoValor) {
    const registros = JSON.parse(localStorage.getItem("register")) || [];
    const registro = registros.find((r) => r.id == id);
  
    if (registro) {
      if (
        campo === "tipo" &&
        registro.tipo === "falta" &&
        novoValor !== "falta"
      ) {
        registro.justificativa = null;
      }
  
      registro[campo] = novoValor;
  
      localStorage.setItem("register", JSON.stringify(registros));
      alert("Registro atualizado com sucesso!");
  
      renderList(registros);
    }
  }
  
  function aplicarFiltro() {
    const dataInicial = document.getElementById("data-inicial").value;
    const dataFinal = document.getElementById("data-final").value;
  
    if (!dataInicial || !dataFinal) {
      alert("Por favor, selecione um período válido para o filtro.");
      return;
    }
  
    const registros = JSON.parse(localStorage.getItem("register")) || [];
  
    const registrosFiltrados = registros.filter((registro) => {
      const dataRegistro = new Date(registro.data.split("/").reverse().join("-"));
      const dataInicio = new Date(dataInicial);
      const dataFim = new Date(dataFinal);
  
      return dataRegistro >= dataInicio && dataRegistro <= dataFim;
    });
  
    renderList(registrosFiltrados);
  }
  
  document.getElementById("btn-filtrar").addEventListener("click", aplicarFiltro);
  
  renderList(JSON.parse(localStorage.getItem("register")) || []);