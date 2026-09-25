import type {
  CSSProperties,
  ChangeEventHandler,
  DragEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export type WithClassName<Props> = Omit<Props, 'className'> & { className?: string };

/** Public DOM-shaped props shared by Prism's accessible compound parts. */
export interface PrismPartProps<Element extends HTMLElement = HTMLElement> {
  className?: string;
  children?: ReactNode;
  id?: string;
  style?: CSSProperties;
  role?: string;
  tabIndex?: number;
  title?: string;
  hidden?: boolean;
  draggable?: boolean;
  onClick?: MouseEventHandler<Element>;
  onDoubleClick?: MouseEventHandler<Element>;
  onKeyDown?: KeyboardEventHandler<Element>;
  onKeyUp?: KeyboardEventHandler<Element>;
  onFocus?: FocusEventHandler<Element>;
  onBlur?: FocusEventHandler<Element>;
  onMouseEnter?: MouseEventHandler<Element>;
  onMouseLeave?: MouseEventHandler<Element>;
  onDragStart?: DragEventHandler<Element>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  orientation?: 'horizontal' | 'vertical';
  delay?: number;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  disabled?: boolean;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface PrismButtonProps extends PrismPartProps<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  value?: string | number | readonly string[];
  form?: string;
  autoFocus?: boolean;
}

export interface PrismInputProps extends PrismPartProps<HTMLInputElement> {
  type?: string;
  readOnly?: boolean;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onInput?: ChangeEventHandler<HTMLInputElement>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface PrismTextareaProps extends PrismPartProps<HTMLTextAreaElement> {
  readOnly?: boolean;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  rows?: number;
  cols?: number;
  autoComplete?: string;
  autoFocus?: boolean;
}

export interface PrismControlProps<Element extends HTMLElement = HTMLElement> extends PrismPartProps<Element> {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string | number | readonly string[];
  onCheckedChange?: (checked: boolean) => void;
}
