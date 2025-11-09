document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    let allProducts = [];

    const getToken = () => localStorage.getItem('jwt-token');

    window.logout = () => {
        localStorage.removeItem('jwt-token');
        window.location.href = 'login.html';
    };

    const createHeaders = () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const token = getToken();
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }
        return headers;
    };

    const loadCategoriesAndProductsForForms = async () => {
        const categoriaSelect = document.getElementById('producto-categoria');
        const productoSelect = document.getElementById('imagen-producto');

        if (categoriaSelect || productoSelect) {
            try {
                const [responseCategorias, responseProductos] = await Promise.all([
                    fetch(`${API_URL}/categorias`),
                    fetch(`${API_URL}/productos`)
                ]);

                const categorias = await responseCategorias.json();
                const productos = await responseProductos.json();

                if (categoriaSelect) {
                    categoriaSelect.innerHTML = categorias.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
                }

                if (productoSelect) {
                    productoSelect.innerHTML = productos.map(prod => `<option value="${prod.id}">${prod.nombre}</option>`).join('');
                }
            } catch (error) {
                console.error('Error al cargar datos para los formularios:', error);
            }
        }
    };

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('jwt-token', data.token);
                    window.location.href = 'admin.html';
                } else {
                    alert(data.mensaje || 'Error de inicio de sesión');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Usuario registrado con éxito. ¡Ahora puedes iniciar sesión!');
                    window.location.href = 'login.html';
                } else {
                    alert(data.mensaje || 'Error al registrar usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    const loadProducts = async () => {
        const productosContainer = document.getElementById('productos-container');
        const categoriasMenu = document.getElementById('categorias-menu');
        if (!productosContainer || !categoriasMenu) return;

        try {
            const [responseProductos, responseCategorias] = await Promise.all([
                fetch(`${API_URL}/productos`),
                fetch(`${API_URL}/categorias`)
            ]);

            const productos = await responseProductos.json();
            allProducts = productos;
            const categorias = await responseCategorias.json();

            renderProducts(productos);

            categoriasMenu.innerHTML = categorias.map(cat => `
                <li class="nav-item">
                    <a class="nav-link" href="#" data-categoria-id="${cat.id}">${cat.nombre}</a>
                </li>
            `).join('');
            categoriasMenu.innerHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="#" data-categoria-id="all">Todos</a>
                </li>
            `;
            categoriasMenu.addEventListener('click', (e) => {
                const categoriaId = e.target.getAttribute('data-categoria-id');
                if (categoriaId === 'all') {
                    renderProducts(allProducts);
                } else {
                    const filteredProducts = allProducts.filter(p => p.categoria_id == categoriaId);
                    renderProducts(filteredProducts);
                }
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    };

    const renderProducts = (productos) => {
        const productosContainer = document.getElementById('productos-container');
        if (!productosContainer) return;
        productosContainer.innerHTML = productos.map(p => `
        <div class="col">
            <div class="card h-100">
                <img src="${p.imagenes_productos_url}" class="card-img-top" alt="${p.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${p.nombre}</h5>
                    <p class="card-text">Precio: S/. ${p.precio}</p>
                    <p class="card-text"><small class="text-muted">Categoría: ${p.categoria}</small></p>
                    <a href="detalle_producto.html?id=${p.id}" class="btn btn-primary">Ver Detalles</a>
                </div>
            </div>
        </div>
        `).join('');
    };

    const loadProductDetail = async () => {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const detalleContainer = document.getElementById('detalle-container');
        if (!productId || !detalleContainer) return;

        try {
            const [responseProducto, responseImagenes] = await Promise.all([
                fetch(`${API_URL}/productos/${productId}`),
                fetch(`${API_URL}/imagenes/${productId}`)
            ]);

            const producto = await responseProducto.json();
            const imagenes = await responseImagenes.json();

            document.getElementById('producto-nombre').textContent = producto.nombre;
            document.getElementById('producto-precio').textContent = `Precio: S/. ${producto.precio}`;
            
            const galeriaImagenes = document.getElementById('galeria-imagenes');
            if (galeriaImagenes) {
                galeriaImagenes.innerHTML = imagenes.map(img => `
                    <div class="col-6 mb-4">
                        <img src="${img.url}" class="img-fluid rounded" alt="Imagen del producto">
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error al cargar el detalle del producto:', error);
        }
    };

    const comprobanteForm = document.getElementById('form-comprobante');
    if (comprobanteForm) {
        comprobanteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const numero = document.getElementById('comprobante-numero').value;
            const monto = parseFloat(document.getElementById('comprobante-monto').value);
            const fecha = document.getElementById('comprobante-fecha').value;
            const token = getToken();

            if (!token) {
                alert('Debe iniciar sesión para registrar un comprobante.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/comprobantes`, {
                    method: 'POST',
                    headers: createHeaders(),
                    body: JSON.stringify({ numero, monto, fecha })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Comprobante registrado con éxito. ID: ' + data.id);
                    comprobanteForm.reset();
                } else {
                    alert('Error al registrar el comprobante: ' + (data.error || 'Desconocido'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    const formsToHandle = ['form-categoria', 'form-producto', 'form-imagen', 'form-eliminar-categoria', 'form-eliminar-producto', 'form-eliminar-imagen'];

    formsToHandle.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                let url, method, body;

                switch (formId) {
                    case 'form-categoria':
                        url = `${API_URL}/categorias`;
                        method = 'POST';
                        body = { nombre: document.getElementById('categoria-nombre').value };
                        break;
                    case 'form-producto':
                        url = `${API_URL}/productos`;
                        method = 'POST';
                        body = {
                            nombre: document.getElementById('producto-nombre').value,
                            precio: document.getElementById('producto-precio').value,
                            categoria_id: document.getElementById('producto-categoria').value
                        };
                        break;
                    case 'form-imagen':
                        url = `${API_URL}/imagenes`;
                        method = 'POST';
                        body = {
                            url: document.getElementById('imagen-url').value,
                            producto_id: document.getElementById('imagen-producto').value
                        };
                        break;
                    case 'form-eliminar-categoria':
                        url = `${API_URL}/categorias/${document.getElementById('categoria-id-eliminar').value}`;
                        method = 'DELETE';
                        break;
                    case 'form-eliminar-producto':
                        url = `${API_URL}/productos/${document.getElementById('producto-id-eliminar').value}`;
                        method = 'DELETE';
                        break;
                    case 'form-eliminar-imagen':
                        url = `${API_URL}/imagenes/${document.getElementById('imagen-id-eliminar').value}`;
                        method = 'DELETE';
                        break;
                    default:
                        return;
                }

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: createHeaders(),
                        body: body ? JSON.stringify(body) : null
                    });

                    const data = await response.json();
                    if (response.ok) {
                        alert('Operación exitosa: ' + (data.mensaje || ''));
                        form.reset();
                        if (['form-producto', 'form-imagen'].includes(formId)) {
                            loadCategoriesAndProductsForForms();
                        }
                    } else {
                        alert('Error en la operación: ' + (data.error || data.message || 'Desconocido'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión con el servidor.');
                }
            });
        }
    });

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadProducts();
    }
    if (window.location.pathname.includes('detalle_producto.html')) {
        loadProductDetail();
    }
    
    const requiresAuth = ['admin.html', 'registrar.html', 'eliminar.html'];
    if (requiresAuth.some(path => window.location.pathname.includes(path))) {
        const token = getToken();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('registrar.html')) {
            loadCategoriesAndProductsForForms();
        }
    }
});