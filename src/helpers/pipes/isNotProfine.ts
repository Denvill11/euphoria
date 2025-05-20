import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary('ru');

@ValidatorConstraint({ async: false })
export class IsNotProfaneConstraint implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return !leoProfanity.check(text);
  }

  defaultMessage(): string {
    return 'Текст содержит ненормативную лексику';
  }
}

export function IsNotProfane(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotProfaneConstraint,
    });
  };
}
