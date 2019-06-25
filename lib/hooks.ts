import React from 'react';

export function useForm(initial: string) {
    const [value, setValue] = React.useState(initial);
    const setFromForm = (ev: React.ChangeEvent<HTMLInputElement>) => setValue(ev.target.value);

    return [value, setFromForm] as const;
}
