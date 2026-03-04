geotab.addin.Rastreabilidad = function (api, state) {
    return {
        initialize: function (api, state, callback) {
            console.log("Comprobación: El Add-In Rastreabilidad se ha inicializado");
            this.updateHealthData(api);
            callback();
        },
        focus: function (api, state) {
            this.updateHealthData(api);
        },
        updateHealthData: function (api) {
            var self = this;
            api.call("Get", {
                typeName: "DeviceStatusInfo"
            }, function (results) {
                console.log("Datos de la API recibidos:", results);
                
                if (!results || results.length === 0) {
                    document.getElementById("vehicleTableBody").innerHTML = '<tr><td colspan="4" style="text-align:center;">No se encontraron dispositivos.</td></tr>';
                    return;
                }

                var now = new Date();
                var reportingCount = 0;
                var tableHtml = "";

                // Ordenar para ver los que NO reportan al principio
                results.sort(function (a, b) {
                    return new Date(a.dateTime) - new Date(b.dateTime);
                });

                results.forEach(function (info) {
                    var lastLog = new Date(info.dateTime);
                    var diffHours = (now - lastLog) / (1000 * 60 * 60);
                    var statusLabel = "OK", badgeClass = "badge-green";

                    if (diffHours > 72) {
                        statusLabel = "DESCONECTADO";
                        badgeClass = "badge-red";
                    } else if (diffHours > 24) {
                        statusLabel = "RETRASADO";
                        badgeClass = "badge-yellow";
                    } else {
                        reportingCount++;
                    }

                    tableHtml += '<tr>' +
                        '<td><strong>' + (info.device.name || info.device.id) + '</strong></td>' +
                        '<td>' + info.device.id + '</td>' +
                        '<td>' + lastLog.toLocaleString() + '</td>' +
                        '<td><span class="badge ' + badgeClass + '">' + statusLabel + '</span></td>' +
                    '</tr>';
                });

                document.getElementById("totalUnits").innerText = results.length;
                document.getElementById("reportingUnits").innerText = reportingCount;
                var score = ((reportingCount / results.length) * 100).toFixed(1);
                document.getElementById("healthScore").innerText = score + "%";
                document.getElementById("vehicleTableBody").innerHTML = tableHtml;

            }, function (error) {
                console.error("Error de API Geotab:", error);
                document.getElementById("vehicleTableBody").innerHTML = '<tr><td colspan="4" style="color:red;">Error de permisos: ' + error + '</td></tr>';
            });
        }
    };
};