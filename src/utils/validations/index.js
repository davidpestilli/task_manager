// Validations Exports
export {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordConfirmation,
  validateRegistrationData,
  validateLoginData,
  sanitizeEmail,
  sanitizeName,
  isAllowedEmailDomain,
  suggestEmailCorrection
} from './authValidations'

// Exports centralizados das validações
export { authValidations } from './authValidations'
export { projectValidations } from './projectValidations'