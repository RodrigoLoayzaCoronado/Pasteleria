export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator'
};

export const PERMISSIONS = {
  // Productos
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_PRODUCTS: 'view_products',
  
  // Usuarios
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',
  
  // Cotizaciones
  CREATE_QUOTE: 'create_quote',
  EDIT_QUOTE: 'edit_quote',
  VIEW_QUOTES: 'view_quotes',
  
  // Perfil
  EDIT_PROFILE: 'edit_profile',
  
  // Reportes
  VIEW_REPORTS: 'view_reports'
};

export const rolePermissions = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_QUOTE,
    PERMISSIONS.EDIT_QUOTE,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_QUOTE,
    PERMISSIONS.EDIT_QUOTE,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.EDIT_PROFILE
  ]
};

export const roleRoutes = {
  [ROLES.ADMIN]: [
    '/dashboard',
    '/products',
    '/users',
    '/quotes',
    '/reports',
    '/profile'
  ],
  [ROLES.OPERATOR]: [
    '/dashboard',
    '/quotes',
    '/profile'
  ]
};