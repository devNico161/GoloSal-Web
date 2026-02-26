let productos = [];

// Iniciar fecha y Nro factura
function inicializar() {
    document.getElementById('res-fecha').innerText = new Date().toLocaleDateString();
    document.getElementById('res-nro').innerText = 'F-' + Math.floor(Math.random() * 90000 + 10000);
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

    for(let i = productos.length; i < 8; i++) {
        tabla.innerHTML += `<tr><td>&nbsp;</td><td></td><td></td><td></td><td class="no-print-column"></td></tr>`;
    }

    resTotal.innerText = `$ ${total.toFixed(2)}`;
}

function nuevaVenta() {
    if(confirm("¿Deseas iniciar una nueva venta? Se borrará todo.")) {
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

    // Forzar ancho fijo para que el recibo se capture completo sin importar el tamaño de pantalla
    const anchoOriginal = element.style.width;
    const minWidthOriginal = element.style.minWidth;
    element.style.width = '794px';       // Ancho A4 en píxeles a 96dpi
    element.style.minWidth = '794px';

    html2canvas(element, {
        scale: 2,
        backgroundColor: "#1A202C",
        width: 794,
        windowWidth: 794,
        useCORS: true,
        scrollX: 0,
        scrollY: 0
    }).then(canvas => {
        // Restaurar estilos originales
        element.style.width = anchoOriginal;
        element.style.minWidth = minWidthOriginal;
        cols.forEach(c => c.style.display = 'table-cell');

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Si el recibo es más alto que la página, lo escala para que entre todo
        let finalHeight = imgHeight;
        let finalWidth = imgWidth;
        if (imgHeight > pageHeight - margin * 2) {
            finalHeight = pageHeight - margin * 2;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
        }

        const offsetX = (pageWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'PNG', offsetX, margin, finalWidth, finalHeight);
        pdf.save(`Recibo_GoloSal_${Date.now()}.pdf`);
    });
}