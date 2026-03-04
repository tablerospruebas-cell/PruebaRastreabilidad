geotab.addin.rastreabilidad = function () {

    return {

        initialize: function (api, state, callback) {
            this.api = api;
            callback();
        },

        focus: function (api, state) {

            const minutosLimite = 10;

            // Obtener dispositivos
            api.call("Get", {
                typeName: "Device"
            }, devices => {

                // Obtener último estado optimizado
                api.call("Get", {
                    typeName: "DeviceStatusInfo"
                }, statusList => {

                    let total = devices.length;
                    let reportando = 0;
                    let sinReportar = 0;

                    let tabla = document.getElementById("tabla");
                    tabla.innerHTML = "";

                    devices.forEach(device => {

                        let status = statusList.find(s => s.device.id === device.id);

                        if (!status || !status.dateTime) return;

                        let minutos = Math.floor(
                            (Date.now() - new Date(status.dateTime)) / 60000
                        );

                        let estado = minutos <= minutosLimite
                            ? "reportando"
                            : "sin_reportar";

                        if (estado === "reportando") reportando++;
                        else sinReportar++;

                        let clase = estado === "reportando"
                            ? "estado-ok"
                            : "estado-error";

                        tabla.innerHTML += `
                            <tr>
                                <td>${device.name}</td>
                                <td class="${clase}">${estado}</td>
                                <td>${new Date(status.dateTime).toLocaleString()}</td>
                                <td>${minutos}</td>
                            </tr>
                        `;
                    });

                    let porcentaje = total > 0
                        ? ((reportando / total) * 100).toFixed(1)
                        : 0;

                    document.getElementById("total").innerText = total;
                    document.getElementById("reportando").innerText = reportando;
                    document.getElementById("sinReportar").innerText = sinReportar;
                    document.getElementById("porcentaje").innerText = porcentaje + "%";

                    // Gráfica
                    new Chart(document.getElementById("grafica"), {
                        type: "doughnut",
                        data: {
                            labels: ["Reportando", "Sin Reportar"],
                            datasets: [{
                                data: [reportando, sinReportar],
                                backgroundColor: ["#27ae60", "#e74c3c"]
                            }]
                        }
                    });

                });

            });
        },

        blur: function () {}
    };
};
