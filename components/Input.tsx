import React from "react";
import { IMaskInput, IMaskInputProps } from "react-imask";

import styles from "./Input.module.css";

interface BaseInputContainerProps {
  label: string;
  note?: string;
}

interface InputContainerProps extends BaseInputContainerProps {
  children: React.ReactNode;
  required?: boolean;
}

const InputContainer = ({
  children,
  label,
  note,
  required,
}: InputContainerProps) => (
  <label className={styles.root}>
    <span className={styles.label}>
      {label}
      {required && (
        <span
          aria-label="required"
          title="required"
          className={styles.required}
        >
          *
        </span>
      )}
    </span>

    {children}
    {!!note && <span className={styles.note}>{note}</span>}
  </label>
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, note, ...props }, ref) => (
    <InputContainer {...{ label, note, required: props.required }}>
      <input ref={ref} className={styles.input} {...props} />
    </InputContainer>
  )
);

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, note, onChange, ...props }, ref) => (
    <InputContainer {...{ label, note, required: props.required }}>
      <IMaskInput
        inputRef={ref}
        className={styles.input}
        {...(props as any)}
        onAccept={(val) => onChange?.(val)}
      />
    </InputContainer>
  )
);

export type InputProps = BaseInputContainerProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;

export type MaskedInputProps = BaseInputContainerProps &
  Omit<IMaskInputProps, "mask" | "onAccept" | "onChange"> & {
    onChange?(val: string): void;
    mask: any;
  };

export default Input;
