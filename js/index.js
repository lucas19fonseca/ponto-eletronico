document.addEventListener("DOMContentLoaded", function () {
    const diaSemana = document.getElementById("dia-semana");
    const diaMesAno = document.getElementById("dia-mes-ano");
    const horaMinSeg = document.getElementById("hora-min-seg");

    const btnBaterPonto = document.getElementById("btn-bater-ponto");
    const dialogPonto = document.getElementById("dialog-ponto");
    const btnDialogFechar = document.getElementById("btn-dialog-fechar");

    btnBaterPonto.addEventListener("click", register);
    btnDialogFechar.addEventListener("click", () => {
        dialogPonto.close();
    });

    const nextRegister = {
        "entrada": "intervalo",
        "intervalo": "volta-intervalo",
        "volta-intervalo": "saida",
        "saida": "entrada",
        "falta": "entrada"
    };

    let registerLocalStorage = getRegisterLocalStorage();
    const dialogData = document.getElementById("dialog-data");
    const dialogHora = document.getElementById("dialog-hora");
    const divAlertaRegistroPonto = document.getElementById("alerta-registro-ponto");

    diaSemana.textContent = getWeekDay();
    diaMesAno.textContent = getCurrentDate();

    const btnCloseAlertRegister = document.getElementById("alerta-registro-ponto-fechar");
    btnCloseAlertRegister.addEventListener("click", () => {
        divAlertaRegistroPonto.classList.remove("show");
        divAlertaRegistroPonto.classList.add("hidden");
    });

    const btnDialogBaterPonto = document.getElementById("btn-dialog-bater-ponto");
    const selectTipoPonto = document.getElementById("tipos-ponto");
    const divComentarioPonto = document.getElementById("div-comentario-opcional");
    const comentarioPontoTextarea = document.getElementById("comentario-opcional-textarea");
    const divJustificativaPonto = document.getElementById("div-justificativa-ponto");
    const justificativaPontoTextarea = document.getElementById("justificativa-ponto-textarea");

    selectTipoPonto.addEventListener("change", function() {
        const typeRegister = selectTipoPonto.value;
        divComentarioPonto.style.display = "block";
        divJustificativaPonto.style.display = typeRegister === "falta" ? "block" : "none";
        justificativaPontoTextarea.value = typeRegister === "falta" ? justificativaPontoTextarea.value : "";
    });

    btnDialogBaterPonto.addEventListener("click", async () => {
        const dataPonto = document.getElementById("data-ponto").value;
        const typeRegister = selectTipoPonto.value;

        if (!dataPonto) {
            alert("Por favor, escolha uma data e hora antes de registrar o ponto.");
            return;
        }

        const justificativa = typeRegister === "falta" ? justificativaPontoTextarea.value.trim() : null;
        const comentarioOpcional = comentarioPontoTextarea.value.trim();
        const anexoImagemInput = document.getElementById("arquivoUpload");
        const anexoImagem = anexoImagemInput ? anexoImagemInput.files[0] : null;
        let base64Image = null;
        
        if (anexoImagem) {
            base64Image = await toBase64(anexoImagem);
        }

        const selectedDate = new Date(dataPonto);
        const currentDate = new Date();

        if (selectedDate > currentDate) {
            alert("Você não pode registrar pontos em datas futuras.");
            return;
        }

        if (typeRegister === "falta" && !justificativa) {
            alert("Em caso de falta, escreva sua justificativa.");
            return;
        }

        let userCurrentPosition = await getCurrentPosition();
        let pontoId = getNextId();

        let ponto = {
            "id": pontoId,
            "data": selectedDate.toLocaleDateString(),
            "hora": selectedDate.toLocaleTimeString(),
            "localizacao": userCurrentPosition,
            "tipo": typeRegister,
            "justificativa": justificativa ? justificativa : null,
            "comentario_opcional": comentarioOpcional ? comentarioOpcional : null,
            "imagem": base64Image
        };

        saveRegisterLocalStorage(ponto);
        localStorage.setItem("lastDateRegister", ponto.data);
        localStorage.setItem("lastTimeRegister", ponto.hora);
        dialogPonto.close();

        divAlertaRegistroPonto.classList.remove("hidden");
        divAlertaRegistroPonto.classList.add("show");

        setTimeout(() => {
            divAlertaRegistroPonto.classList.remove("show");
            divAlertaRegistroPonto.classList.add("hidden");
        }, 5000);
    });

    function getNextId() {
        let lastId = localStorage.getItem("lastId") || 0;
        const nextId = parseInt(lastId) + 1;
        localStorage.setItem("lastId", nextId);
        return nextId;
    }

    function saveRegisterLocalStorage(register) {
        registerLocalStorage.push(register);
        localStorage.setItem("register", JSON.stringify(registerLocalStorage));
        localStorage.setItem("lastTypeRegister", selectTipoPonto.value);
    }

    function getRegisterLocalStorage() {
        let registers = localStorage.getItem("register");
        return registers ? JSON.parse(registers) : [];
    }

    function register() {
        dialogData.textContent = "Data: " + getCurrentDate();
        dialogHora.textContent = "Hora: " + getCurrentHour();
        
        let lastTypeRegister = localStorage.getItem("lastTypeRegister");
        if (lastTypeRegister) {
            selectTipoPonto.value = nextRegister[lastTypeRegister];
            document.getElementById("dialog-last-register").textContent = "Último registro: " + localStorage.getItem("lastDateRegister") + " - " + localStorage.getItem("lastTimeRegister") + " | " + localStorage.getItem("lastTypeRegister");
        }

        setInterval(() => {
            dialogHora.textContent = "Hora: " + getCurrentHour();
        }, 1000);

        dialogPonto.showModal();
    }

    function getWeekDay() {
        const date = new Date();
        return ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][date.getDay()];
    }

    function getCurrentHour() {
        const date = new Date();
        return String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0') + ":" + String(date.getSeconds()).padStart(2, '0');
    }

    function getCurrentDate() {
        const date = new Date();
        return String(date.getDate()).padStart(2, '0') + "/" + String(date.getMonth() + 1).padStart(2, '0') + "/" + date.getFullYear();
    }

    function printCurrentHour() {
        horaMinSeg.textContent = getCurrentHour();
    }

    const btnDataHoraAtual = document.getElementById("btn-data-hora-atual");
    btnDataHoraAtual.addEventListener("click", () => {
        const dataPonto = document.getElementById("data-ponto");
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        dataPonto.value = formattedDate;
    });

    async function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => reject("Erro ao recuperar a localização: " + error)
            );
        });
    }

    async function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    printCurrentHour();
    setInterval(printCurrentHour, 1000);
});

