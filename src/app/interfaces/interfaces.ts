export interface IUsuarioNuevo {
    Uid?: string;
    correo: string;
    contrasena?: string;
    contrasenaConfimarcion?: string;
    telefono?: string;
    nombre?: string;
}

export interface IUsuario {
    Uid?: string;
    correo: string;
    telefono?: string;
    nombre?: string;
    photoURL?: string;
    providerData?: string;
    direccion?: string;
}

export interface IRestaurantes {
    idR: string;
    nombre: string;
    direccion: string;
    logo: string;
    logoProductos?:string;
    logoCarniceria?: string;
    horario: string;
    envioMinimo?: string;
    aleatorio?: number;
}

export interface ICategorias {
    id: string;
    nombre: string;
}


export interface ICategoriaMenu {
    idCategoria: number;
    nombreCategoria: string;
    productoCategoria: IMenuRestaurante[];
}

export interface IMenuRestaurante {
    idCategoria: string;
    nombreCategoria: string;
    idProducto: string;
    nombreProducto: string;
    productoDescripcion: string;
    productoPrecio: string;
    productoDisponible: string;
    imagenProducto: string;
}

export interface IDetallesProductoMenu {
    info: IProductoVer;
    detalles?: IDetallesProducto[];
}

export interface IProductoVer {
    idCategoria: string;
    nombreCategoria: string;
    idProducto: string;
    nombreProducto: string;
    productoDescripcion: string;
    precioProducto: string;
    diponibleProducto: string;
    urlImagen: string;
}

export interface IDetallesProducto {
    id: string;
    idProducto: string;
    nombre: string;
    cantidad: string;
    obligatorio: string;
    opciones?: IOpcionesDetallesProducto[];
}

export interface IOpcionesDetallesProducto {
    id: string;
    idCatalogoExtra: string;
    nombre: string;
    precio: string;
    disponible: string;
}

export interface Icarrito {
    id?: string;
    uID: string;
    idRestaurante: string;
    nombreRestaurante: string;
    estadoCarrito: string;
    propina?: number;
    tipoPedidoid?: string;
    tipoPedido?: string;
    horaEntrega?: string;
    productos: IproductosCarrito[];
    datosOpcionEntrega?: {
        idTipoPedido: string;
        fecha: string;
        hora: string;
        minutosEntrega: string;
    }
    envioMinimo?: string;
}

export interface IproductosCarrito {
    id?: string;
    idProducto: string;
    nombreProducto: string;
    logo: string;
    textExtras: string;
    cantidad: number;
    costo: string;
    notas: string;
    extras: IaddTemporal[];
}

export interface IcatalogoOpciones {
    id: string;
    nombre: string;
    opciones: Iopciones[];
}

export interface Iopciones {
    id: string;
    nombre: string;
    costoExtra: string;
}

export interface IaddTemporal {
    idProducto: string;
    idCatalogo: string;
    idOpcion: string;
}

export interface IDirecciones {
    id?: string;
    direccionAPI: string;
    latitud: string;
    longitud: string;
    calle: string;
    colonia: string;
    municipio: string;
    estado: string;
    referencia: string;
    predeterminada: boolean;
}

export interface Icoordenadas {
    lat: string;
    lng: string;
}

export interface IFormaPago {
    id: number;
    forma: string;
}

export interface IPropina {
    id: string;
    propina: number;
}

export interface IOpcionesEnvio {
    idTipo: string;
    nombreTipo: string;
    horariosEntrega?: IdiasEntrega[],
}

export interface IdiasEntrega {
    diaTXT: string;
    fecha: string;
    horasEntrega: string[],
}

export interface IopcionEnvioSeleccionada {
    idTipo: string;
    fecha: string;
    hora: string;
}