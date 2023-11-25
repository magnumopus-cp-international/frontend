import React from 'react';
import { PromiseValue } from 'type-fest';

export type Extends<Self extends object, Base extends object> = Omit<Base, keyof Self> & Self;

export type IntrinsicPropsWithoutRef<E extends keyof JSX.IntrinsicElements> = React.PropsWithoutRef<
  JSX.IntrinsicElements[E]
>;

export type DivPropsWithoutRef = IntrinsicPropsWithoutRef<'div'>;
export type InputPropsWithoutRef = IntrinsicPropsWithoutRef<'input'>;

export type PolyExtends<ComponentType extends React.ElementType, Self extends object, Base extends object> = {
  /**
   * Базовый компонент
   *
   * @type React.ElementType
   */
  component?: ComponentType;
} & Extends<Self, Base>;

export type ExtractFnReturnType<FnType extends (...args: any) => any> = PromiseValue<ReturnType<FnType>>;
