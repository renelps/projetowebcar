export function formatedBrl(item: string): string {
  const numero = parseFloat(item.replace(/\./g, '').replace(',', '.'));

  if (isNaN(numero)) return 'Valor inválido';

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}