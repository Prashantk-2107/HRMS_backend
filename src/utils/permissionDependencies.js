export const PERMISSION_DEPENDENCIES = {
  "emp:create": ["emp:get_all"],
  "emp:delete": ["emp:get_all"],
  "emp:update": ["emp:get_all"],
  "emp:assign_role": ["emp:get_all"],
  "emp:view_any": ["emp:get_all"],
  "emp:view_documents": ["emp:get_all"],
  "emp:add_documents": ["emp:get_all"],
  "emp:remove_documents": ["emp:get_all"],
  "emp:verify_documents": ["emp:get_all"],
  "emp:manage_bank_details": ["emp:get_all"],
  "emp:grant_extra_permission": ["emp:get_all"],

  "role:create": ["role:get_all"],
  "role:delete": ["role:get_all"],
  "role:update": ["role:get_all"],

  "permission:grantAndRevoke": ["role:get_all"],
};

/**
 * Returns list of permission names that a permission depends on.
 * @param {string} permissionName - The permission to look up
 * @returns {string[]} Required dependencies
 */
export function getRequiredDependencies(permissionName) {
  return PERMISSION_DEPENDENCIES[permissionName] || [];
}

/**
 * Returns list of permission names that depend on the given permission.
 * @param {string} permissionName - The parent permission
 * @returns {string[]} Dependents
 */
export function getDependentPermissions(permissionName) {
  const dependents = [];
  for (const [key, dependencies] of Object.entries(PERMISSION_DEPENDENCIES)) {
    if (dependencies.includes(permissionName)) {
      dependents.push(key);
    }
  }
  return dependents;
}
