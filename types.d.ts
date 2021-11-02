declare module "react-imask" {
  import IMask from "imask";

  /**
   * The props accepted by react-imask, based
   * on the implementation of imask, with  some additions
   */
  export type IMaskInputProps = IMask.AnyMaskedOptions &
    React.InputHTMLAttributes<HTMLInputElement> & {
      value?: number | string;
      unmask?: boolean | "typed";
      inputRef?: React.Ref<HTMLInputElement>;

      // events
      onAccept?: <T>(
        value: string,
        maskRef: IMask.InputMask<IMask.AnyMaskedOptions>,
        ...args: T[]
      ) => void;
      onComplete?: <T>(
        value: string,
        maskRef: IMask.InputMask<IMask.AnyMaskedOptions>,
        ...args: T[]
      ) => void;

      dispatch?: (
        value: string,
        masked: IMask.MaskedDynamic,
        flags: IMask.AppendFlags
      ) => IMask.AnyMasked | null | undefined;
    };

  /**
   * A function that decorates a react component
   * with 'imask' props
   * @param Component Any React Component
   */
  export function IMaskMixin<T, D>(
    Component: React.ComponentType<T & { inputRef?: React.Ref<D> }>
  ): React.ComponentType<IMaskInputProps & T>;

  /**
   * A basic IMask React Input
   */
  export const IMaskInput: React.ComponentType<IMaskInputProps>;
}
