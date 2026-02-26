let productos = [];

function inicializar() {
    document.getElementById('res-fecha').innerText = new Date().toLocaleDateString();
    const nro = Math.floor(Math.random() * 90000 + 10000);
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
    const element = document.getElementById('recibo-template');

    // Ocultar columna de acciones
    const cols = document.querySelectorAll('.no-print-column');
    cols.forEach(c => c.style.display = 'none');

    // Guardar estilos originales
    const originalStyles = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        maxWidth: element.style.maxWidth,
        position: element.style.position,
        overflow: element.style.overflow
    };

    // Forzar tamaño exacto para captura
    element.style.width = '750px';
    element.style.minWidth = '750px';
    element.style.maxWidth = '750px';
    element.style.overflow = 'visible';

    // Pequeña pausa para que el browser re-renderice
    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#1A202C",
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: 750,
        windowHeight: element.offsetHeight
    });

    // Restaurar estilos
    Object.assign(element.style, originalStyles);
    cols.forEach(c => c.style.display = 'table-cell');

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;

    // El PDF tiene exactamente el mismo aspect ratio que el canvas → sin espacios blancos
    const pdfWidth = 210;  // mm
    const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Recibo_GoloSal_${Date.now()}.pdf`);
}