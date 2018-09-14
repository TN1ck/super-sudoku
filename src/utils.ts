import { ThemedStyledFunction } from 'styled-components';

export const withProps = <U>() =>
<P, T, O>(
    fn: ThemedStyledFunction<P, T, O>,
): ThemedStyledFunction<P & U, T, O & U> => fn;
