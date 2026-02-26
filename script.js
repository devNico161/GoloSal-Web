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
        
        // Limpiar inputs de producto
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

    // Rellenar filas vacías para diseño
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
    
    // Ocultar columna de acciones para el PDF
    const cols = document.querySelectorAll('.no-print-column');
    cols.forEach(c => c.style.display = 'none');

    html2canvas(element, { 
        scale: 3, // Máxima calidad
        backgroundColor: "#1A202C" 
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save(`Recibo_GoloSal_${Date.now()}.pdf`);

        // Volver a mostrar columna en la web
        cols.forEach(c => c.style.display = 'table-cell');
    });
}