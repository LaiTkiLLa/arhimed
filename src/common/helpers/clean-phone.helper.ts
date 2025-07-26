import { BadRequestException } from '@nestjs/common';

export const cleanPhone = ({ value }: { value: string }): string => {
  const purePhone = value.replace(/\D/g, '');
  if ((purePhone[0] !== '7' && purePhone[0] !== '8') || purePhone.length !== 11)
    throw new BadRequestException(['Номер телефона введен некорректно']);
  return purePhone.replace(/^8|^7/g, '+7');
};
