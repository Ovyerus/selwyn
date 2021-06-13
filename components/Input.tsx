import React from "react";

import styles from "./Input.module.css";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, note, ...props }, ref) => (
    <label className={styles.root}>
      <span className={styles.label}>
        {label}
        {props.required && (
          <span
            aria-label="required"
            title="required"
            className={styles.required}
          >
            *
          </span>
        )}
      </span>

      <input ref={ref} className={styles.input} {...props} />
      {!!note && <span className={styles.note}>{note}</span>}
    </label>
  )
);

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  note?: string;
}

export default Input;
