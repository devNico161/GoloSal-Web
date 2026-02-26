let productos = [];

// Iniciar fecha y Nro factura
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

    // Forzar ancho fijo tipo desktop para captura correcta
    const anchoOriginal = element.style.width;
    const minWidthOriginal = element.style.minWidth;
    element.style.width = '794px';
    element.style.minWidth = '794px';

    html2canvas(element, {
        scale: 3,
        backgroundColor: "#1A202C",
        width: 794,
        windowWidth: 794,
        useCORS: true,
        scrollX: 0,
        scrollY: 0
    }).then(canvas => {
        // Restaurar estilos
        element.style.width = anchoOriginal;
        element.style.minWidth = minWidthOriginal;
        cols.forEach(c => c.style.display = 'table-cell');

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;

        // Página con el tamaño exacto del recibo = sin márgenes blancos
        const pdfWidth = 210; // A4 ancho en mm
        const pdfHeight = Math.round((canvas.height * pdfWidth) / canvas.width);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });

        // Imagen ocupa 100% de la página, sin márgenes
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Recibo_GoloSal_${Date.now()}.pdf`);
    });
}
