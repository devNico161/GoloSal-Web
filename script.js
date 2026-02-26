let productos = [];

function inicializar() {
    document.getElementById('res-fecha').innerText = new Date().toLocaleDateString();
    // Combina timestamp con random para garantizar unicidad real
    const timestamp = Date.now() % 1000000; // últimos 6 dígitos del timestamp
    const rand = Math.floor(Math.random() * 900 + 100); // 3 dígitos random
    const nro = String(timestamp).padStart(6, '0') + '-' + rand;
    document.getElementById('res-nro').innerText = 'F-' + nro;
}
inicializar();

function updateClientInfo() {
    document.getElementById('res-cliente').innerText = document.getElementById('clienteNombre').value;
    document.getElementById('res-negocio').innerText = document.getElementById('clienteEmpresa').value;
    document.getElementById('res-dir').innerText = document.getElementById('clienteDireccion').value;
}

function agregarProducto() {
    const desc = document.getElementById('prodDesc').value;
    const cant = parseFloat(document.getElementById('prodCant').value);
    const precio = parseFloat(document.getElementById('prodPrecio').value);

    if (desc && cant > 0 && precio > 0) {
        productos.push({ id: Date.now(), cant, desc, precio, subtotal: cant * precio });
        actualizarTabla();
        document.getElementById('prodDesc').value = "";
        document.getElementById('prodCant').value = "";
        document.getElementById('prodPrecio').value = "";
        document.getElementById('prodDesc').focus();
    } else {
        alert("⚠️ Por favor carga los datos correctamente");
    }
}

function eliminarProducto(id) {
    productos = productos.filter(p => p.id !== id);
    actualizarTabla();
}

function actualizarTabla() {
    const tabla = document.getElementById('lista-items');
    const resTotal = document.getElementById('res-total');
    tabla.innerHTML = "";
    let total = 0;

    productos.forEach(p => {
        total += p.subtotal;
        tabla.innerHTML += `
            <tr>
                <td>${p.cant}</td>
                <td style="text-align:left">${p.desc}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>$${p.subtotal.toFixed(2)}</td>
                <td class="no-print-column"><button class="btn-delete" onclick="eliminarProducto(${p.id})">Borrar</button></td>
            </tr>
        `;
    });

    for (let i = productos.length; i < 8; i++) {
        tabla.innerHTML += `<tr><td>&nbsp;</td><td></td><td></td><td></td><td class="no-print-column"></td></tr>`;
    }

    resTotal.innerText = `$ ${total.toFixed(2)}`;
}

function nuevaVenta() {
    if (confirm("¿Deseas iniciar una nueva venta? Se borrará todo.")) {
        productos = [];
        document.getElementById('clienteNombre').value = "";
        document.getElementById('clienteEmpresa').value = "";
        document.getElementById('clienteDireccion').value = "";
        inicializar();
        actualizarTabla();
        updateClientInfo();
    }
}

async function generarPDF() {
    // Leer datos actuales
    const cliente  = document.getElementById('res-cliente').innerText;
    const negocio  = document.getElementById('res-negocio').innerText;
    const dir      = document.getElementById('res-dir').innerText;
    const fecha    = document.getElementById('res-fecha').innerText;
    const nroFact  = document.getElementById('res-nro').innerText;

    let total = 0;
    let filasProductos = '';
    productos.forEach(p => {
        total += p.subtotal;
        filasProductos += `
            <tr>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;text-align:center;">${p.cant}</td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;text-align:left;">${p.desc}</td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;text-align:center;">$${p.precio.toFixed(2)}</td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;text-align:center;">$${p.subtotal.toFixed(2)}</td>
            </tr>`;
    });
    for (let i = productos.length; i < 8; i++) {
        filasProductos += `
            <tr>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;">&nbsp;</td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;"></td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;"></td>
                <td style="padding:10px 6px;border-bottom:1px solid #2D3748;"></td>
            </tr>`;
    }

    // Obtener logo como base64
    const logoUrl = document.querySelector('.company-info img').src;
    let logoBase64 = '';
    try {
        const resp = await fetch(logoUrl);
        const blob = await resp.blob();
        logoBase64 = await new Promise(res => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch(e) { logoBase64 = logoUrl; }

    // Construir HTML del recibo con tamaño FIJO de 750px — independiente del celular
    const reciboHTML = `
    <div style="width:750px;background:#1A202C;color:white;border:3px solid #000;font-family:'Segoe UI',sans-serif;">

        <!-- HEADER -->
        <div style="display:flex;border-bottom:3px solid #000;">
            <div style="width:45%;background:#C31E2E;padding:15px;border-right:3px solid #000;text-align:center;">
                <img src="${logoBase64}" style="width:110px;margin-bottom:8px;"><br>
                <strong>GoloSal</strong><br>
                <span style="font-size:13px;">Nombre y Apellido del Dueño (Fabian)</span><br>
                <span style="font-size:13px;">Telefono del Dueño</span>
            </div>
            <div style="width:55%;display:flex;flex-direction:column;background:#F7941E;color:black;">
                <div style="padding:20px 15px;border-bottom:3px solid #000;font-weight:bold;font-size:15px;flex:1;display:flex;align-items:center;">
                    <strong>Nro Factura:</strong>&nbsp;${nroFact}
                </div>
                <div style="padding:20px 15px;font-weight:bold;font-size:15px;flex:1;display:flex;align-items:center;">
                    <strong>Fecha:</strong>&nbsp;${fecha}
                </div>
            </div>
        </div>

        <!-- DATOS CLIENTE -->
        <div style="padding:18px 20px;border-bottom:3px solid #000;background:#2D3748;">
            <div style="color:#F7941E;font-weight:bold;text-decoration:underline;margin-bottom:10px;font-size:14px;">DATOS DEL CLIENTE</div>
            <p style="margin:4px 0;font-size:14px;"><strong>Cliente:</strong> ${cliente}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Negocio:</strong> ${negocio}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Dirección:</strong> ${dir}</p>
        </div>

        <!-- TABLA -->
        <table style="width:100%;border-collapse:collapse;background:#1A202C;">
            <thead>
                <tr>
                    <th style="background:#0072BC;padding:12px 6px;color:white;font-size:13px;border-bottom:3px solid #000;text-align:center;">CANTIDAD</th>
                    <th style="background:#0072BC;padding:12px 6px;color:white;font-size:13px;border-bottom:3px solid #000;text-align:center;">DESCRIPCION</th>
                    <th style="background:#0072BC;padding:12px 6px;color:white;font-size:13px;border-bottom:3px solid #000;text-align:center;">Precio Unit</th>
                    <th style="background:#0072BC;padding:12px 6px;color:white;font-size:13px;border-bottom:3px solid #000;text-align:center;">SubTotal</th>
                </tr>
            </thead>
            <tbody>${filasProductos}</tbody>
        </table>

        <!-- TOTAL -->
        <div style="display:flex;border-top:3px solid #000;background:#C31E2E;">
            <div style="flex:1;text-align:right;padding:18px 15px;font-weight:bold;font-size:16px;color:white;">Total A Pagar</div>
            <div style="width:180px;text-align:center;padding:18px 15px;font-weight:bold;font-size:18px;background:#F7941E;color:black;">$ ${total.toFixed(2)}</div>
        </div>

    </div>`;

    // Crear contenedor oculto FUERA del viewport
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 750px;
        z-index: -9999;
        opacity: 0;
        pointer-events: none;
    `;
    container.innerHTML = reciboHTML;
    document.body.appendChild(container);

    await new Promise(r => setTimeout(r, 200));

    const reciboEl = container.firstElementChild;

    const canvas = await html2canvas(reciboEl, {
        scale: 2,
        backgroundColor: "#1A202C",
        useCORS: true,
        allowTaint: true,
        width: 750,
        height: reciboEl.scrollHeight,
        windowWidth: 750,
        windowHeight: reciboEl.scrollHeight
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;

    const pdfWidth = 210;
    const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Recibo_GoloSal_${Date.now()}.pdf`);
}