/**
 * Verifica se a aplicação está rodando em modo de desenvolvimento.
 * 
 * Esta função depende da variável de ambiente NODE_ENV que deve ser configurada
 * nos scripts de inicialização, geralmente via cross-env.
 * 
 * O cross-env é uma ferramenta que permite definir variáveis de ambiente de forma
 * consistente entre diferentes sistemas operacionais (Windows, Linux, macOS).
 * 
 * Exemplo no package.json:
 * "scripts": {
 *   "dev": "cross-env NODE_ENV=development electron ."
 * }
 * 
 * @returns {boolean} true se a aplicação estiver em modo de desenvolvimento, false caso contrário.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}